// frontend/src/pages/dashboard/WorkplaceSupervisorDashboard.jsx
import { Typography, Box, Avatar, Divider } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  RateReview as ReviewIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';
import { logbookAPI, placementsAPI } from '../../../services/api';
import { DashGreeting, SectionCard, ProgressRow, T } from '../../../components/dashboard/DashboardComponents';

/* ─── Helpers ────────────────────────────────────────────────── */
const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const timeAgo = (value) => {
  const date = toDate(value);
  if (!date) return 'Recently';
  const diffMs   = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1)  return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

/* ─── Inline metric card ─────────────────────────────────────── */
const MetricCard = ({ icon, iconBg, iconColor, topGradient, label, value, sub, actionLabel, onAction, loading }) => (
  <Box
    onClick={onAction}
    sx={{
      bgcolor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: '14px',
      p: '18px 18px 16px',
      cursor: onAction ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(13,16,32,.05),0 4px 18px rgba(13,16,32,.06)',
      transition: 'transform .25s cubic-bezier(.4,0,.2,1),box-shadow .25s cubic-bezier(.4,0,.2,1)',
      '&:hover': onAction ? { transform: 'translateY(-3px)', boxShadow: '0 8px 30px rgba(13,16,32,.10)' } : {},
      '&::before': {
        content: '""',
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        borderRadius: '14px 14px 0 0',
        background: topGradient,
      },
    }}
  >
    <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, mb: '14px' }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: T.tx3, textTransform: 'uppercase', letterSpacing: '.6px', mb: '3px', fontFamily: "'DM Sans', sans-serif" }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '28px', fontWeight: 700, color: T.tx1, letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>
      {loading ? '—' : value}
    </Typography>
    {sub && (
      <Typography sx={{ fontSize: '11.5px', color: T.tx3, mt: '6px', fontFamily: "'DM Sans', sans-serif" }}>{sub}</Typography>
    )}
    {actionLabel && onAction && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '14px', pt: '12px', borderTop: `1px solid ${T.border}`, color: iconColor, fontSize: '12px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
        {actionLabel} →
      </Box>
    )}
  </Box>
);

/* ════════════════════════════════════════════════════════════════
   WORKPLACE SUPERVISOR DASHBOARD
════════════════════════════════════════════════════════════════ */
const WorkplaceSupervisorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading]       = useState(true);
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs]             = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [placementRes, logsRes] = await Promise.allSettled([
          placementsAPI.getAssignedPlacements(),
          logbookAPI.getSupervisorLogs({ page_size: 200 }),
        ]);

        if (placementRes.status === 'fulfilled') {
          setPlacements(Array.isArray(placementRes.value.data) ? placementRes.value.data : []);
        }
        if (logsRes.status === 'fulfilled') {
          const payload = logsRes.value.data;
          const rows = Array.isArray(payload?.results) ? payload.results
            : Array.isArray(payload) ? payload : [];
          setLogs(rows);
        }
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  /* ── Computed stats ─────────────────────────────────────────── */
  const stats = useMemo(() => {
    const pendingReviews = logs.filter((log) =>
      ['pending', 'under_review'].includes(log.review_status)
    ).length;

    const reviewedLogs   = logs.filter((log) =>
      !['pending', 'under_review'].includes(log.review_status)
    );
    const approvalsGiven = reviewedLogs.filter((log) => log.review_status === 'approved').length;
    const rejections     = reviewedLogs.filter((log) => log.review_status === 'rejected').length;
    const ratingValues   = reviewedLogs
      .map((log) => Number(log.supervisor_rating || 0))
      .filter((r) => r > 0);

    return {
      pendingReviews,
      studentsAssigned: placements.length,
      logsReviewed:     reviewedLogs.length,
      approvalsGiven,
      rejections,
      avgRating: ratingValues.length
        ? (ratingValues.reduce((s, v) => s + v, 0) / ratingValues.length).toFixed(1)
        : '0.0',
    };
  }, [placements, logs]);

  /* ── Recent activities ──────────────────────────────────────── */
  const recentActivities = useMemo(() => {
    const placementActivities = placements.slice(0, 3).map((placement) => ({
      type:        'placement',
      title:       `Placement ${placement.current_lifecycle_status || placement.approval_status}`,
      description: `${placement.student_name || 'Student'} • ${placement.organization?.name || 'Organization'}`,
      time:        timeAgo(placement.updated_at || placement.created_at),
      status:      placement.current_lifecycle_status || placement.approval_status,
      sortAt:      toDate(placement.updated_at || placement.created_at),
    }));

    const logActivities = logs.slice(0, 6).map((log) => ({
      type:        'log',
      title:       `Week ${log.week_number} log ${log.review_status}`,
      description: `${log.student_name || 'Student'} • ${log.placement_summary || 'Placement log'}`,
      time:        timeAgo(log.updated_at || log.created_at),
      status:      log.review_status,
      sortAt:      toDate(log.updated_at || log.created_at),
    }));

    return [...placementActivities, ...logActivities]
      .sort((a, b) => (b.sortAt?.getTime() || 0) - (a.sortAt?.getTime() || 0))
      .slice(0, 5)
      .map(({ sortAt, ...activity }) => activity);
  }, [logs, placements]);

  /* ── Quick actions ──────────────────────────────────────────── */
  const quickActions = [
    { label: 'Review Pending Logs', icon: <ReviewIcon sx={{ fontSize: 18 }} />,      onClick: () => navigate('/logs') },
    { label: 'View Students',        icon: <GroupIcon sx={{ fontSize: 18 }} />,       onClick: () => navigate('/interns') },
    { label: 'Provide Feedback',     icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/evaluations') },
    { label: 'Update Profile',       icon: <AssignmentIcon sx={{ fontSize: 18 }} />,  onClick: () => navigate('/profile') },
  ];

  /* ── Students under supervision (up to 5) ───────────────────── */
  const students = useMemo(() => {
    const logsByPlacement = logs.reduce((acc, log) => {
      const key = String(log.placement);
      acc[key] = acc[key] || [];
      acc[key].push(log);
      return acc;
    }, {});

    return placements.slice(0, 5).map((placement) => {
      const placementLogs = logsByPlacement[String(placement.id)] || [];
      const reviewedCount = placementLogs.filter((log) => log.review_status === 'approved').length;
      const progress      = placementLogs.length
        ? Math.round((reviewedCount / placementLogs.length) * 100)
        : 0;
      const lastUpdated   = placementLogs
        .map((log) => toDate(log.updated_at || log.created_at))
        .filter(Boolean)
        .sort((a, b) => b.getTime() - a.getTime())[0];

      return {
        name:    placement.student_name || 'Student',
        progress,
        status:  progress >= 80 ? 'Excellent' : progress >= 40 ? 'Active' : 'Needs Follow-up',
        lastLog: lastUpdated ? timeAgo(lastUpdated.toISOString()) : 'No logs yet',
      };
    });
  }, [placements, logs]);

  /* ── Status badge styles ────────────────────────────────────── */
  const statusStyle = (status) => ({
    Excellent:        { bg: T.t50,     color: T.t700   },
    Active:           { bg: T.i50,     color: T.i700   },
    'Needs Follow-up':{ bg: T.dangerL, color: T.danger },
  }[status] || { bg: T.surface2, color: T.tx2 });

  const approvalRate = stats.logsReviewed
    ? Math.round((stats.approvalsGiven / stats.logsReviewed) * 100)
    : 0;

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <Box sx={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Greeting banner — indigo/blue tones (Workplace role) ── */}
      <DashGreeting
        role="workplace_supervisor"
        greeting="My Dashboard"
        name=""
        sub="Monitor student progress, review logs, and provide feedback."
        roleTag="Workplace Supervisor"
        stats={[
          { num: stats.studentsAssigned, label: 'Students'        },
          { num: stats.pendingReviews,   label: 'Pending Reviews' },
          { num: stats.logsReviewed,     label: 'Logs Reviewed'   },
          { num: stats.avgRating,        label: 'Avg Rating'      },
        ]}
      />

      <Grid container spacing={2}>

        {/* ── Metric cards ─────────────────────────────────────── */}
        <Grid item xs={12} sm={4}>
          <MetricCard
            icon={<ReviewIcon sx={{ fontSize: 17 }} />}
            iconBg={T.a100} iconColor={T.a700}
            topGradient={`linear-gradient(90deg,${T.a700},${T.a400})`}
            label="Pending Reviews"
            value={stats.pendingReviews}
            sub="Logs awaiting your review"
            actionLabel="Review Logs"
            onAction={() => navigate('/logs')}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <MetricCard
            icon={<GroupIcon sx={{ fontSize: 17 }} />}
            iconBg={T.i100} iconColor={T.i700}
            topGradient={`linear-gradient(90deg,${T.i700},${T.i400})`}
            label="Students Assigned"
            value={stats.studentsAssigned}
            sub="Interns under your supervision"
            actionLabel="View Students"
            onAction={() => navigate('/interns')}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <MetricCard
            icon={<TrendingUpIcon sx={{ fontSize: 17 }} />}
            iconBg={T.t100} iconColor={T.t700}
            topGradient={`linear-gradient(90deg,${T.t700},${T.t400})`}
            label="Average Rating"
            value={stats.avgRating}
            sub="Average from reviewed logs"
            loading={loading}
          />
        </Grid>

        {/* ── Performance Overview ─────────────────────────────── */}
        <Grid item xs={12}>
          <SectionCard title="Performance Overview" subtitle="Log review breakdown" delay={0.20}>
            <Grid container spacing={1.5}>
              {[
                { label: 'Logs Reviewed',   value: stats.logsReviewed,  color: T.t600,   bg: T.t50    },
                { label: 'Approvals Given',  value: stats.approvalsGiven, color: T.i600,  bg: T.i50    },
                { label: 'Rejections',       value: stats.rejections,     color: T.danger, bg: T.dangerL},
                { label: 'Approval Rate',    value: `${approvalRate}%`,   color: T.a600,   bg: T.a50    },
              ].map(({ label, value, color, bg }) => (
                <Grid item xs={6} sm={3} key={label}>
                  <Box sx={{
                    textAlign: 'center', p: '16px 8px',
                    borderRadius: '12px', bgcolor: bg,
                    border: `1px solid ${T.border}`,
                  }}>
                    <Typography sx={{
                      fontSize: '24px', fontWeight: 700, color,
                      letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1, fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {value}
                    </Typography>
                    <Typography sx={{
                      fontSize: '11px', color: T.tx3, mt: '4px',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        {/* ── Students Under Supervision ───────────────────────── */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Students Under Supervision"
            action={
              <Typography
                onClick={() => navigate('/interns')}
                sx={{
                  fontSize: '12px', color: T.t600, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View all →
              </Typography>
            }
            delay={0.25}
          >
            {students.length === 0 ? (
              <Typography sx={{ fontSize: '12.5px', color: T.tx3, fontFamily: "'DM Sans', sans-serif" }}>
                No students assigned yet.
              </Typography>
            ) : (
              students.map((student, index) => {
                const ss = statusStyle(student.status);
                return (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar sx={{
                          width: 32, height: 32, borderRadius: '9px',
                          bgcolor: T.t100, color: T.t700,
                          fontSize: '11px', fontWeight: 700,
                        }}>
                          {student.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: T.tx1, fontFamily: "'DM Sans', sans-serif" }}>
                            {student.name}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: T.tx3, fontFamily: "'DM Sans', sans-serif" }}>
                            Last log: {student.lastLog}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        px: '9px', py: '3px', borderRadius: '99px',
                        bgcolor: ss.bg, color: ss.color,
                        fontSize: '10.5px', fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: ss.color }} />
                        {student.status}
                      </Box>
                    </Box>
                    <ProgressRow label="Progress" value={student.progress} color={T.t600} />
                    {index < students.length - 1 && (
                      <Divider sx={{ my: '12px', borderColor: T.border }} />
                    )}
                  </Box>
                );
              })
            )}
          </SectionCard>
        </Grid>

        {/* ── Recent Activity ──────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <RecentActivity activities={recentActivities} loading={loading} />
        </Grid>

        {/* ── Quick Actions ─────────────────────────────────────── */}
        <Grid item xs={12}>
          <QuickActions actions={quickActions} />
        </Grid>

      </Grid>
    </Box>
  );
};

export default WorkplaceSupervisorDashboard;