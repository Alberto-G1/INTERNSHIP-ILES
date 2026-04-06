// frontend/src/pages/dashboard/StudentDashboard.jsx
import { Typography, Box, Card, CardContent, Button, LinearProgress, Chip } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as AchievementIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';
import { evaluationsAPI, logbookAPI, placementsAPI, profileAPI } from '../../../services/api';
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

/* ── Week timeline pill colours ──────────────────────────────── */
const WEEK_COLORS = {
  approved:        { bg: T.t100, color: T.t800 },
  submitted:       { bg: T.i100, color: T.i700 },
  needs_revision:  { bg: T.a100, color: T.a800 },
  missing:         { bg: T.dangerL, color: T.danger },
  current:         { bg: T.t700, color: '#fff' },
  upcoming:        { bg: T.surface2, color: T.tx3 },
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progressRows, setProgressRows] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [finalScores, setFinalScores] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          profileAPI.getCompletion(),
          placementsAPI.getMyPlacements(),
          logbookAPI.getStudentLogs(),
          logbookAPI.getStudentProgress(),
          evaluationsAPI.getStudentEvaluations(),
          evaluationsAPI.getStudentFinalScores(),
        ]);
        if (results[0].status === 'fulfilled') setProfileCompletion(Number(results[0].value.data?.percentage || 0));
        if (results[1].status === 'fulfilled') setPlacements(Array.isArray(results[1].value.data) ? results[1].value.data : []);
        if (results[2].status === 'fulfilled') setLogs(Array.isArray(results[2].value.data) ? results[2].value.data : []);
        if (results[3].status === 'fulfilled') setProgressRows(Array.isArray(results[3].value.data) ? results[3].value.data : []);
        if (results[4].status === 'fulfilled') setEvaluations(Array.isArray(results[4].value.data) ? results[4].value.data : []);
        if (results[5].status === 'fulfilled') setFinalScores(Array.isArray(results[5].value.data) ? results[5].value.data : []);
      } finally { setLoading(false); }
    };
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const approvedPlacements = placements.filter((p) => p.approval_status === 'approved');
    const totalExpected = progressRows.reduce((s, r) => s + Number(r.total_expected_weeks || 0), 0);
    const totalSubmitted = progressRows.reduce((s, r) => s + Number(r.total_logs_submitted || 0), 0);
    const overallProgress = progressRows.length
      ? Math.round(progressRows.reduce((s, r) => s + Number(r.completion_percentage || 0), 0) / progressRows.length)
      : 0;
    const finalizedEvals = evaluations.filter((e) => e.status === 'finalized').length;
    const achievements = [totalSubmitted > 0, profileCompletion >= 100, finalizedEvals > 0, finalScores.length > 0].filter(Boolean).length;
    const missingWeeks = progressRows.flatMap((r) => (Array.isArray(r.missing_weeks) ? r.missing_weeks : []));
    return { hasApprovedPlacement: approvedPlacements.length > 0, weeklySubmitted: totalSubmitted, weeklyTotal: totalExpected, profileCompletion, overallProgress, achievements, upcomingDeadlines: missingWeeks.slice(0, 2) };
  }, [placements, progressRows, profileCompletion, evaluations, finalScores]);

  const recentActivities = useMemo(() => [
    ...placements.slice(0, 4).map((p) => ({ type: 'placement', title: `Placement ${p.approval_status === 'approved' ? 'Approved' : 'Updated'}`, description: p.organization?.name ? `${p.organization.name} • ${p.position_role || 'Internship placement'}` : 'Placement details updated', time: timeAgo(p.updated_at || p.created_at), status: p.approval_status, sortAt: toDate(p.updated_at || p.created_at) })),
    ...logs.slice(0, 4).map((l) => ({ type: 'log', title: `Week ${l.week_number} Log ${l.submission_status === 'submitted' ? 'Submitted' : 'Drafted'}`, description: l.placement_summary || 'Weekly log activity', time: timeAgo(l.updated_at || l.created_at), status: l.review_status, sortAt: toDate(l.updated_at || l.created_at) })),
    ...evaluations.slice(0, 3).map((e) => ({ type: 'evaluation', title: `Evaluation ${e.status}`, description: e.placement_summary || 'Evaluation progress update', time: timeAgo(e.updated_at || e.created_at), status: e.status, sortAt: toDate(e.updated_at || e.created_at) })),
  ].sort((a, b) => (b.sortAt?.getTime() || 0) - (a.sortAt?.getTime() || 0)).slice(0, 5).map(({ sortAt, ...a }) => a),
  [placements, logs, evaluations]);

  const quickActions = [
    { label: 'Submit Weekly Log', icon: <AssignmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/logs') },
    { label: 'Complete Profile',  icon: <SchoolIcon sx={{ fontSize: 18 }} />,    onClick: () => navigate('/profile') },
    { label: 'View Placements',   icon: <TrendingUpIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/placements') },
    { label: 'Check Evaluations', icon: <CheckIcon sx={{ fontSize: 18 }} />,     onClick: () => navigate('/evaluations') },
  ];

  /* Score from latest finalized evaluation */
  const latestScore = finalScores.length ? finalScores[finalScores.length - 1] : null;
  const scorePercent = latestScore?.max_possible_score
    ? Math.round((Number(latestScore.total_score || 0) / Number(latestScore.max_possible_score)) * 100)
    : null;

  return (
    <Box sx={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Greeting banner (deep green for Student) ──────────── */}
      <DashGreeting
        role="student"
        greeting="My Internship"
        name=""
        sub="Track your progress, submit weekly logs, and complete your evaluations."
        roleTag={`Student · Week ${logs.length + 1}`}
        stats={[
          { num: `${stats.overallProgress}%`,           label: 'Progress' },
          { num: `${stats.weeklySubmitted}/${stats.weeklyTotal || 0}`, label: 'Logs' },
          { num: `${stats.profileCompletion}%`,         label: 'Profile' },
          { num: stats.achievements,                     label: 'Achievements' },
        ]}
      />

      <Grid container spacing={2}>
        {/* Active Placement */}
        <Grid item xs={12} md={6}>
          <Box
            onClick={() => navigate('/placements')}
            sx={{
              bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px',
              p: '18px 18px 16px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(13,16,32,.05),0 4px 18px rgba(13,16,32,.06)',
              transition: 'transform .25s,box-shadow .25s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 30px rgba(13,16,32,.10)' },
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '14px 14px 0 0', background: stats.hasApprovedPlacement ? `linear-gradient(90deg, ${T.t700}, ${T.t400})` : `linear-gradient(90deg, ${T.a700}, ${T.a400})` },
            }}
          >
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: stats.hasApprovedPlacement ? T.t100 : T.a100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stats.hasApprovedPlacement ? T.t700 : T.a700, mb: '14px' }}>
              <SchoolIcon sx={{ fontSize: 17 }} />
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: T.tx3, textTransform: 'uppercase', letterSpacing: '.6px', mb: '3px', fontFamily: "'DM Sans', sans-serif" }}>Active Internship</Typography>
            <Typography sx={{ fontSize: stats.hasApprovedPlacement ? '16px' : '13px', fontWeight: 700, color: T.tx1, letterSpacing: '-0.5px', fontFamily: "'DM Sans', sans-serif" }}>
              {stats.hasApprovedPlacement ? 'Approved Placement' : 'No Approved Placement'}
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: T.tx3, mt: '6px', fontFamily: "'DM Sans', sans-serif" }}>
              {stats.hasApprovedPlacement ? 'Your internship journey is active' : 'Apply and submit a placement to get started'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '14px', pt: '12px', borderTop: `1px solid ${T.border}`, color: stats.hasApprovedPlacement ? T.t700 : T.a700, fontSize: '12px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>View Placements →</Box>
          </Box>
        </Grid>

        {/* Weekly Logs */}
        <Grid item xs={12} md={6}>
          <Box
            onClick={() => navigate('/logs')}
            sx={{
              bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px',
              p: '18px 18px 16px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(13,16,32,.05),0 4px 18px rgba(13,16,32,.06)',
              transition: 'transform .25s,box-shadow .25s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 30px rgba(13,16,32,.10)' },
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '14px 14px 0 0', background: `linear-gradient(90deg, ${T.i700}, ${T.i400})` },
            }}
          >
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: T.i100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.i700, mb: '14px' }}>
              <AssignmentIcon sx={{ fontSize: 17 }} />
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: T.tx3, textTransform: 'uppercase', letterSpacing: '.6px', mb: '3px', fontFamily: "'DM Sans', sans-serif" }}>Weekly Logs</Typography>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: T.tx1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{loading ? '—' : `${stats.weeklySubmitted}/${stats.weeklyTotal || 0}`}</Typography>
            <Typography sx={{ fontSize: '11.5px', color: T.tx3, mt: '6px', fontFamily: "'DM Sans', sans-serif" }}>Submitted logs vs expected</Typography>
            {stats.weeklyTotal > 0 && (
              <Box sx={{ mt: '10px', height: '4px', bgcolor: T.surface2, borderRadius: '99px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                <Box sx={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${T.i700}, ${T.i400})`, width: `${Math.round((stats.weeklySubmitted / stats.weeklyTotal) * 100)}%`, transition: 'width 1s cubic-bezier(.34,1.2,.64,1)' }} />
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '12px', pt: '12px', borderTop: `1px solid ${T.border}`, color: T.i700, fontSize: '12px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>Submit Log →</Box>
          </Box>
        </Grid>

        {/* Profile Completion */}
        <Grid item xs={12} md={4}>
          <Box
            onClick={() => navigate('/profile')}
            sx={{
              bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px',
              p: '18px 18px 16px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(13,16,32,.05)',
              transition: 'transform .25s,box-shadow .25s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 30px rgba(13,16,32,.10)' },
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '14px 14px 0 0', background: `linear-gradient(90deg, ${T.t700}, ${T.t400})` },
            }}
          >
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: T.t100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.t700, mb: '14px' }}>
              <SchoolIcon sx={{ fontSize: 17 }} />
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: T.tx3, textTransform: 'uppercase', letterSpacing: '.6px', mb: '3px', fontFamily: "'DM Sans', sans-serif" }}>Profile Completion</Typography>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: T.tx1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{loading ? '—' : `${stats.profileCompletion}%`}</Typography>
            <Box sx={{ mt: '10px', height: '4px', bgcolor: T.surface2, borderRadius: '99px', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${T.t700}, ${T.t400})`, width: `${stats.profileCompletion}%`, transition: 'width 1s cubic-bezier(.34,1.2,.64,1)' }} />
            </Box>
          </Box>
        </Grid>

        {/* Overall Progress */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px',
              p: '18px 18px 16px', position: 'relative', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(13,16,32,.05)',
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '14px 14px 0 0', background: `linear-gradient(90deg, ${T.t700}, ${T.t400})` },
            }}
          >
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: T.t100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.t700, mb: '14px' }}>
              <TrendingUpIcon sx={{ fontSize: 17 }} />
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: T.tx3, textTransform: 'uppercase', letterSpacing: '.6px', mb: '3px', fontFamily: "'DM Sans', sans-serif" }}>Overall Progress</Typography>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: T.tx1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{loading ? '—' : `${stats.overallProgress}%`}</Typography>
            <Box sx={{ mt: '10px', height: '4px', bgcolor: T.surface2, borderRadius: '99px', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${T.t700}, ${T.t400})`, width: `${stats.overallProgress}%`, transition: 'width 1s cubic-bezier(.34,1.2,.64,1)' }} />
            </Box>
          </Box>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={4}>
          <SectionCard title="Achievements" delay={0.25}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '8px' }}>
              <AchievementIcon sx={{ color: T.a400, fontSize: 22 }} />
              <Typography sx={{ fontSize: '28px', fontWeight: 700, color: T.tx1, fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{stats.achievements}</Typography>
            </Box>
            <Typography sx={{ fontSize: '11.5px', color: T.tx3, mb: '12px', fontFamily: "'DM Sans', sans-serif" }}>Milestones reached from your real progress</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {stats.weeklySubmitted > 0 && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', px: '9px', py: '3px', borderRadius: '99px', bgcolor: T.t100, color: T.t700, fontSize: '10.5px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: T.t600 }} /> First Log
                </Box>
              )}
              {stats.profileCompletion >= 100 && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', px: '9px', py: '3px', borderRadius: '99px', bgcolor: T.i100, color: T.i700, fontSize: '10.5px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: T.i600 }} /> Profile Complete
                </Box>
              )}
              {finalScores.length > 0 && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', px: '9px', py: '3px', borderRadius: '99px', bgcolor: T.a100, color: T.a700, fontSize: '10.5px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: T.a600 }} /> Final Grade
                </Box>
              )}
            </Box>
          </SectionCard>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Upcoming Deadlines" delay={0.30}>
            {stats.upcomingDeadlines.length === 0 ? (
              <Typography sx={{ fontSize: '12.5px', color: T.tx3, fontFamily: "'DM Sans', sans-serif" }}>No upcoming deadlines right now.</Typography>
            ) : stats.upcomingDeadlines.map((weekEndingDate) => {
              const dueDate = toDate(weekEndingDate);
              const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / 86400000) : null;
              const progressValue = daysLeft === null ? 0 : Math.max(0, Math.min(100, ((14 - daysLeft) / 14) * 100));
              return (
                <Box key={weekEndingDate} sx={{ mb: '12px', '&:last-child': { mb: 0 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
                    <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: T.tx1, fontFamily: "'DM Sans', sans-serif" }}>Weekly Log Submission</Typography>
                    <Typography sx={{ fontSize: '11px', color: daysLeft !== null && daysLeft < 0 ? T.danger : T.tx3, fontFamily: "'DM Sans', sans-serif" }}>
                      {daysLeft === null ? 'N/A' : daysLeft >= 0 ? `Due in ${daysLeft}d` : `${Math.abs(daysLeft)}d overdue`}
                    </Typography>
                  </Box>
                  <Box sx={{ height: '4px', bgcolor: T.surface2, borderRadius: '99px', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', borderRadius: '99px', bgcolor: daysLeft !== null && daysLeft < 0 ? T.danger : T.a600, width: `${progressValue}%`, transition: 'width .8s cubic-bezier(.34,1.2,.64,1)' }} />
                  </Box>
                </Box>
              );
            })}
          </SectionCard>
        </Grid>

        {/* Score ring (if final score exists) */}
        {scorePercent !== null && (
          <Grid item xs={12} md={6}>
            <SectionCard title="My Score" delay={0.35}>
              {/* Circular score ring */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: '16px' }}>
                <Box sx={{ position: 'relative', width: 110, height: 110 }}>
                  <svg viewBox="0 0 110 110" width={110} height={110} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="55" cy="55" r="46" fill="none" stroke={T.surface2} strokeWidth="8" />
                    <circle cx="55" cy="55" r="46" fill="none" stroke="url(#sg1)" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray="289" strokeDashoffset={289 - (289 * scorePercent / 100)} style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }} />
                    <defs>
                      <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={T.t700}/><stop offset="100%" stopColor={T.t400}/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: T.tx1, fontVariantNumeric: 'tabular-nums', lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>{scorePercent}</Typography>
                    <Typography sx={{ fontSize: '9.5px', color: T.tx3, textTransform: 'uppercase', letterSpacing: '.8px', mt: '2px', fontFamily: "'DM Sans', sans-serif" }}>/ 100</Typography>
                  </Box>
                </Box>
              </Box>
            </SectionCard>
          </Grid>
        )}

        {/* Recent Activity + Quick Actions */}
        <Grid item xs={12} md={scorePercent !== null ? 12 : 6}>
          <RecentActivity activities={recentActivities} loading={loading} />
        </Grid>
        <Grid item xs={12}>
          <QuickActions actions={quickActions} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;