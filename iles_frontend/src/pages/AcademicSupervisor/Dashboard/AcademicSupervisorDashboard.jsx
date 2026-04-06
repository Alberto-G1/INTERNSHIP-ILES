// frontend/src/pages/dashboard/AcademicSupervisorDashboard.jsx
import { Typography, Box, Card, CardContent, Avatar, Divider, LinearProgress, Button } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';
import { authAPI, evaluationsAPI, logbookAPI, placementsAPI } from '../../../services/api';
import { DashGreeting, SectionCard, ProgressRow, T } from '../../../components/dashboard/DashboardComponents';

const toDate = (v) => { if (!v) return null; const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; };
const timeAgo = (v) => {
  const d = toDate(v);
  if (!d) return 'Recently';
  const ms = Date.now() - d.getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const AcademicSupervisorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [profileInfo, setProfileInfo] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [profileRes, placementRes, logsRes, evalRes] = await Promise.allSettled([
          authAPI.getProfile(),
          placementsAPI.getAssignedPlacements(),
          logbookAPI.getSupervisorLogs({ page_size: 200 }),
          evaluationsAPI.getSupervisorEvaluations(),
        ]);
        if (profileRes.status === 'fulfilled') setProfileInfo(profileRes.value.data || null);
        if (placementRes.status === 'fulfilled') setPlacements(Array.isArray(placementRes.value.data) ? placementRes.value.data : []);
        if (logsRes.status === 'fulfilled') {
          const payload = logsRes.value.data;
          setLogs(Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : []);
        }
        if (evalRes.status === 'fulfilled') setEvaluations(Array.isArray(evalRes.value.data) ? evalRes.value.data : []);
      } finally { setLoading(false); }
    };
    loadDashboard();
  }, []);

  const evaluationByPlacement = evaluations.reduce((acc, e) => { acc[String(e.placement)] = e; return acc; }, {});

  const stats = useMemo(() => {
    const placementProgress = placements.map((p) => {
      const pLogs = logs.filter((l) => String(l.placement) === String(p.id));
      if (!pLogs.length) return 0;
      return Math.round((pLogs.filter((l) => l.review_status === 'approved').length / pLogs.length) * 100);
    });
    const avgStudentProgress = placementProgress.length ? Math.round(placementProgress.reduce((s, v) => s + v, 0) / placementProgress.length) : 0;
    const pendingEvaluations = placements.filter((p) => { const e = evaluationByPlacement[String(p.id)]; return !e || e.status !== 'finalized'; }).length;
    const atRiskStudents = placements.filter((p) => {
      const pLogs = logs.filter((l) => String(l.placement) === String(p.id));
      if (!pLogs.length) return true;
      const latest = pLogs.map((l) => toDate(l.updated_at || l.created_at)).filter(Boolean).sort((a, b) => b - a)[0];
      const stale = latest ? Date.now() - latest.getTime() > 14 * 86400000 : true;
      const progress = Math.round((pLogs.filter((l) => l.review_status === 'approved').length / pLogs.length) * 100);
      return stale || progress < 40;
    }).length;
    return {
      pendingEvaluations,
      studentsUnderSupervision: placements.length,
      evaluationsCompleted: evaluations.filter((e) => e.status === 'finalized').length,
      avgStudentProgress,
      atRiskStudents,
      institutionInfo: {
        name: profileInfo?.supervisor_profile?.organization_name || 'Not set',
        department: profileInfo?.supervisor_profile?.department || profileInfo?.supervisor_profile?.faculty || 'Not set',
      },
    };
  }, [placements, logs, evaluations, profileInfo]);

  const evaluationProgress = {
    notStarted: placements.filter((p) => !evaluationByPlacement[String(p.id)]).length,
    inProgress: evaluations.filter((e) => ['draft', 'submitted'].includes(e.status)).length,
    completed: evaluations.filter((e) => e.status === 'finalized').length,
  };

  const recentActivities = useMemo(() => [
    ...evaluations.slice(0, 5).map((e) => ({ type: 'evaluation', title: `Evaluation ${e.status}`, description: `${e.student_name || 'Student'} • ${e.placement_summary || 'Evaluation update'}`, time: timeAgo(e.updated_at || e.created_at), status: e.status, sortAt: toDate(e.updated_at || e.created_at) })),
    ...logs.slice(0, 4).map((l) => ({ type: l.review_status === 'needs_revision' ? 'warning' : 'log', title: `Week ${l.week_number} log ${l.review_status}`, description: `${l.student_name || 'Student'} • ${l.placement_summary || 'Log status updated'}`, time: timeAgo(l.updated_at || l.created_at), status: l.review_status, sortAt: toDate(l.updated_at || l.created_at) })),
  ].sort((a, b) => (b.sortAt?.getTime() || 0) - (a.sortAt?.getTime() || 0)).slice(0, 5).map(({ sortAt, ...a }) => a),
  [evaluations, logs]);

  const topStudents = evaluations
    .filter((e) => e.max_possible_score)
    .map((e) => {
      const pct = Math.round((Number(e.total_score || 0) / Number(e.max_possible_score || 1)) * 100);
      return { name: e.student_name || 'Student', progress: pct, rating: Math.max(1, Math.min(5, Number(((pct / 100) * 5).toFixed(1)))) };
    })
    .sort((a, b) => b.progress - a.progress).slice(0, 3);

  const quickActions = [
    { label: 'Review Evaluations', icon: <AssessmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/evaluations') },
    { label: 'View Students',       icon: <PeopleIcon sx={{ fontSize: 18 }} />,     onClick: () => navigate('/interns') },
    { label: 'Generate Reports',    icon: <AssessmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/reports') },
    { label: 'Update Profile',      icon: <SchoolIcon sx={{ fontSize: 18 }} />,     onClick: () => navigate('/profile') },
  ];

  return (
    <Box
      sx={{
        fontFamily: "'DM Sans', sans-serif",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {/* ── Greeting banner (violet/purple tones for Academic) ── */}
      <DashGreeting
        role="academic_supervisor"
        greeting="Academic Overview"
        name=""
        sub="Monitor student progress, review evaluations, and provide academic guidance."
        roleTag="Academic Supervisor"
        stats={[
          { num: stats.studentsUnderSupervision, label: 'Students' },
          { num: stats.pendingEvaluations,        label: 'Pending Evals' },
          { num: `${stats.avgStudentProgress}%`, label: 'Avg Progress' },
          { num: stats.atRiskStudents,            label: 'At Risk' },
        ]}
      />

      <Grid container spacing={2}>
        {/* Metric cards */}
        <Grid item xs={12} sm={4}>
          <Box
            onClick={() => navigate('/evaluations')}
            sx={{
              bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px',
              p: '18px 18px 16px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(13,16,32,.05),0 4px 18px rgba(13,16,32,.06)',
              transition: 'transform .25s,box-shadow .25s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 30px rgba(13,16,32,.10)' },
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '14px 14px 0 0', background: `linear-gradient(90deg, ${T.a700}, ${T.a400})` },
            }}
          >
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: T.a100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.a700, mb: '14px' }}>
              <AssessmentIcon sx={{ fontSize: 17 }} />
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: T.tx3, textTransform: 'uppercase', letterSpacing: '.6px', mb: '3px', fontFamily: "'DM Sans', sans-serif" }}>Pending Evaluations</Typography>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: T.tx1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{loading ? '—' : stats.pendingEvaluations}</Typography>
            <Typography sx={{ fontSize: '11.5px', color: T.tx3, mt: '6px', fontFamily: "'DM Sans', sans-serif" }}>Awaiting your review</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '14px', pt: '12px', borderTop: `1px solid ${T.border}`, color: T.a700, fontSize: '12px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>Review Evaluations →</Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box
            onClick={() => navigate('/interns')}
            sx={{
              bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px',
              p: '18px 18px 16px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(13,16,32,.05),0 4px 18px rgba(13,16,32,.06)',
              transition: 'transform .25s,box-shadow .25s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 30px rgba(13,16,32,.10)' },
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '14px 14px 0 0', background: `linear-gradient(90deg, ${T.violet}, #A855F7)` },
            }}
          >
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: T.violetL, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.violet, mb: '14px' }}>
              <PeopleIcon sx={{ fontSize: 17 }} />
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: T.tx3, textTransform: 'uppercase', letterSpacing: '.6px', mb: '3px', fontFamily: "'DM Sans', sans-serif" }}>Students in Internship</Typography>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: T.tx1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{loading ? '—' : stats.studentsUnderSupervision}</Typography>
            <Typography sx={{ fontSize: '11.5px', color: T.tx3, mt: '6px', fontFamily: "'DM Sans', sans-serif" }}>Active interns under supervision</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '14px', pt: '12px', borderTop: `1px solid ${T.border}`, color: T.violet, fontSize: '12px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>View Students →</Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px',
              p: '18px 18px 16px', position: 'relative', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(13,16,32,.05),0 4px 18px rgba(13,16,32,.06)',
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '14px 14px 0 0', background: `linear-gradient(90deg, ${T.t700}, ${T.t400})` },
            }}
          >
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: T.t100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.t700, mb: '14px' }}>
              <TrendingUpIcon sx={{ fontSize: 17 }} />
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: T.tx3, textTransform: 'uppercase', letterSpacing: '.6px', mb: '3px', fontFamily: "'DM Sans', sans-serif" }}>Average Progress</Typography>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: T.tx1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{loading ? '—' : `${stats.avgStudentProgress}%`}</Typography>
            <Typography sx={{ fontSize: '11.5px', color: T.tx3, mt: '6px', fontFamily: "'DM Sans', sans-serif" }}>Overall completion rate</Typography>
          </Box>
        </Grid>

        {/* Evaluation Progress */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Evaluation Progress" delay={0.25}>
            {[
              { label: 'Not Started', count: evaluationProgress.notStarted, color: T.danger },
              { label: 'In Progress',  count: evaluationProgress.inProgress, color: T.a600 },
              { label: 'Completed',    count: evaluationProgress.completed,  color: T.t600 },
            ].map(({ label, count, color }) => (
              <ProgressRow
                key={label}
                label={label}
                value={Math.round((count / Math.max(placements.length, 1)) * 100)}
                color={color}
                count={count}
                total={placements.length}
              />
            ))}
            <Box sx={{ mt: '12px', pt: '12px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '12px', color: T.tx2, fontFamily: "'DM Sans', sans-serif" }}>Completion Rate</Typography>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: T.t600, fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>
                {Math.round((evaluationProgress.completed / Math.max(placements.length, 1)) * 100)}%
              </Typography>
            </Box>
          </SectionCard>
        </Grid>

        {/* Top Performing Students */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Top Performing Students" delay={0.30}>
            {topStudents.length === 0 ? (
              <Typography sx={{ fontSize: '12.5px', color: T.tx3, fontFamily: "'DM Sans', sans-serif" }}>No finalized evaluations yet.</Typography>
            ) : topStudents.map((student, idx) => (
              <Box key={idx}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: T.a100, color: T.a700, fontSize: '11px', fontWeight: 700 }}>
                      {student.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: T.tx1, fontFamily: "'DM Sans', sans-serif" }}>{student.name}</Typography>
                      <Rating value={student.rating} precision={0.1} size="small" readOnly />
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '16px', fontWeight: 700, color: T.t600, fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{student.progress}%</Typography>
                </Box>
                <Box sx={{ height: '4px', bgcolor: T.surface2, borderRadius: '2px', overflow: 'hidden', mb: idx < topStudents.length - 1 ? '12px' : 0 }}>
                  <Box sx={{ width: `${student.progress}%`, height: '100%', background: `linear-gradient(90deg, ${T.t700}, ${T.t400})`, borderRadius: '2px', transition: 'width .3s ease' }} />
                </Box>
                {idx < topStudents.length - 1 && <Divider sx={{ mb: '12px' }} />}
              </Box>
            ))}
          </SectionCard>
        </Grid>

        {/* Institution Info */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Institution Information" delay={0.35}>
            {[
              { label: 'Institution',    value: stats.institutionInfo.name },
              { label: 'Department',     value: stats.institutionInfo.department },
              { label: 'Active Semester',value: 'Current Internship Cycle' },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ py: '11px', borderBottom: `1px solid ${T.border}`, '&:last-child': { borderBottom: 'none' } }}>
                <Typography sx={{ fontSize: '11px', color: T.tx3, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600, mb: '1px', fontFamily: "'DM Sans', sans-serif" }}>{label}</Typography>
                <Typography sx={{ fontSize: '13.5px', fontWeight: 500, color: T.tx1, fontFamily: "'DM Sans', sans-serif" }}>{value}</Typography>
              </Box>
            ))}
            <Box sx={{ mt: '10px' }}>
              <Typography sx={{ fontSize: '12px', color: T.t600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/profile')}>
                Update Profile →
              </Typography>
            </Box>
          </SectionCard>
        </Grid>

        {/* At-Risk Students */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              bgcolor: '#FEF2F2', border: '1px solid rgba(232,69,69,0.2)', borderRadius: '14px',
              p: '18px', boxShadow: '0 1px 3px rgba(13,16,32,.05)',
              animation: 'dashFadeUp 0.5s ease 0.40s both',
              '@keyframes dashFadeUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '12px' }}>
              <WarningIcon sx={{ color: T.danger, fontSize: 20 }} />
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: T.danger, fontFamily: "'DM Sans', sans-serif" }}>Students Needing Attention</Typography>
            </Box>
            <Typography sx={{ fontSize: '32px', fontWeight: 700, color: T.danger, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif", mb: '6px' }}>
              {stats.atRiskStudents}
            </Typography>
            <Typography sx={{ fontSize: '12.5px', color: '#B91C1C', mb: '14px', fontFamily: "'DM Sans', sans-serif" }}>
              Students with low progress or missed deadlines
            </Typography>
            <Box
              component="button"
              onClick={() => navigate('/interns?filter=at-risk')}
              sx={{ fontSize: '12px', color: T.danger, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", px: '12px', py: '6px', borderRadius: '8px', border: '1px solid rgba(232,69,69,0.3)', bgcolor: 'transparent', transition: 'all .14s', '&:hover': { bgcolor: T.dangerL } }}
            >
              View Details →
            </Box>
          </Box>
        </Grid>

        {/* Recent Activity + Quick Actions */}
        <Grid item xs={12}>
          <RecentActivity activities={recentActivities} loading={loading} />
        </Grid>
        <Grid item xs={12}>
          <QuickActions actions={quickActions} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicSupervisorDashboard;