// frontend/src/pages/dashboard/AdminDashboard.jsx
import { Typography, Box, Card, CardContent, Avatar, Chip, Divider, LinearProgress, Button } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  People as PeopleIcon,
  AssignmentInd as AssignmentIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  VerifiedUser as VerifiedIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';
import { adminAPI, adminPlacementsAPI, adminUsersAPI, evaluationsAPI, logbookAPI } from '../../../services/api';
import { DashGreeting, SectionCard, ProgressRow, MiniStat, T } from '../../../components/dashboard/DashboardComponents';

const CHART_COLORS = [T.t700, T.i700, T.a700, T.violet, '#118AB2', '#EF476F'];

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const timeAgo = (value) => {
  const date = toDate(value);
  if (!date) return 'Recently';
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const ADMIN_STYLES = `
  @keyframes dashFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [overview, setOverview] = useState({ total_logs: 0, pending_review: 0, approved: 0, revisions: 0, late_submissions: 0, approval_rate: 0 });
  const [finalScores, setFinalScores] = useState([]);

  useEffect(() => {
    if (!document.getElementById('admin-dash-styles')) {
      const tag = document.createElement('style');
      tag.id = 'admin-dash-styles';
      tag.textContent = ADMIN_STYLES;
      document.head.appendChild(tag);
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [usersRes, placementsRes, approvalsRes, overviewRes, finalScoresRes] = await Promise.allSettled([
          adminUsersAPI.getUsers(),
          adminPlacementsAPI.getPlacements({ page_size: 200 }),
          adminAPI.getSupervisorApprovals(),
          logbookAPI.getAdminOverview(),
          evaluationsAPI.getAdminFinalScores(),
        ]);
        if (usersRes.status === 'fulfilled') setUsers(Array.isArray(usersRes.value.data) ? usersRes.value.data : []);
        if (placementsRes.status === 'fulfilled') {
          const data = placementsRes.value.data;
          setPlacements(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []);
        }
        if (approvalsRes.status === 'fulfilled') {
          const approvalUsers = Array.isArray(approvalsRes.value.data) ? approvalsRes.value.data : [];
          setPendingApprovals(approvalUsers.filter((u) => !u.admin_approved));
        }
        if (overviewRes.status === 'fulfilled') setOverview({ ...overview, ...overviewRes.value.data });
        if (finalScoresRes.status === 'fulfilled') setFinalScores(Array.isArray(finalScoresRes.value.data) ? finalScoresRes.value.data : []);
      } finally { setLoading(false); }
    };
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const students   = users.filter((u) => u.role === 'student').length;
    const supervisors = users.filter((u) => ['academic_supervisor', 'workplace_supervisor'].includes(u.role)).length;
    const admins      = users.filter((u) => u.role === 'admin').length;
    const activeInternships = placements.filter((p) => ['active', 'approved'].includes(p.current_lifecycle_status)).length;
    const healthScore = Math.max(0, Math.min(100,
      Math.round((Number(overview.approval_rate || 0) * 0.7) + ((pendingApprovals.length ? 0 : 100) * 0.3))
    ));
    return { totalUsers: users.length, totalPlacements: placements.length, activeInternships, pendingApprovals: pendingApprovals.length, students, supervisors, admins, systemHealth: healthScore };
  }, [users, placements, pendingApprovals, overview.approval_rate]);

  const recentActivities = useMemo(() => {
    const approvalActivities = pendingApprovals.slice(0, 3).map((u) => ({ type: 'approval', title: 'Supervisor approval pending', description: `${u.full_name || u.username} (${u.role})`, time: timeAgo(u.created_at), status: 'pending', sortAt: toDate(u.created_at) }));
    const placementActivities = placements.slice(0, 4).map((p) => ({ type: 'placement', title: `Placement ${p.approval_status}`, description: `${p.student_name || 'Student'} • ${p.organization?.name || 'Organization'}`, time: timeAgo(p.updated_at || p.created_at), status: p.approval_status, sortAt: toDate(p.updated_at || p.created_at) }));
    const scoreActivities = finalScores.slice(0, 3).map((s) => ({ type: 'evaluation', title: 'Final score computed', description: `${s.student_name || 'Student'} • Grade ${s.grade || 'N/A'}`, time: timeAgo(s.computed_at || s.updated_at), status: s.grade || 'graded', sortAt: toDate(s.computed_at || s.updated_at) }));
    return [...approvalActivities, ...placementActivities, ...scoreActivities]
      .sort((a, b) => (b.sortAt?.getTime() || 0) - (a.sortAt?.getTime() || 0))
      .slice(0, 5).map(({ sortAt, ...activity }) => activity);
  }, [pendingApprovals, placements, finalScores]);

  const quickActions = [
    { label: 'Add User', icon: <PeopleIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/users') },
    { label: 'View Reports', icon: <AssessmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/reports') },
    { label: 'Approve Supervisors', icon: <VerifiedIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/admin/approvals') },
    { label: 'System Settings', icon: <SettingsIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/settings') },
    { label: 'View Logs', icon: <TimelineIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/logs') },
    { label: 'Manage Placements', icon: <AssignmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/placements') },
  ];

  const systemMetrics = [
    { label: 'Active Users',         value: users.filter((u) => u.is_active).length,                                                          change: `${users.length ? Math.round((users.filter((u) => u.is_active).length / users.length) * 100) : 0}% active` },
    { label: 'Pending Log Reviews',  value: overview.pending_review || 0,                                                                      change: `${overview.total_logs || 0} total logs` },
    { label: 'Late Submissions',     value: overview.late_submissions || 0,                                                                    change: `${overview.approval_rate || 0}% approval rate` },
    { label: 'Final Scores Released',value: finalScores.length,                                                                                change: `${finalScores.filter((s) => s.grade === 'A').length} grade A` },
  ];

  const gradeDistributionChart = useMemo(() => {
    const bucket = {};
    finalScores.forEach((score) => {
      const grade = score.grade || 'N/A';
      bucket[grade] = (bucket[grade] || 0) + 1;
    });
    return Object.entries(bucket).map(([name, value]) => ({ name, value }));
  }, [finalScores]);

  const placementDistributionChart = useMemo(() => {
    const bucket = {};
    placements.forEach((placement) => {
      const org = placement.organization?.name || 'Unknown';
      bucket[org] = (bucket[org] || 0) + 1;
    });
    return Object.entries(bucket)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [placements]);

  const activityTrendChart = useMemo(() => {
    const bucket = {};
    const addBucket = (dateValue, field) => {
      const date = toDate(dateValue);
      const key = date ? date.toISOString().slice(0, 7) : 'Unknown';
      if (!bucket[key]) bucket[key] = { month: key, submissions: 0, evaluations: 0, placements: 0 };
      bucket[key][field] += 1;
    };
    placements.forEach((item) => addBucket(item.updated_at || item.created_at, 'placements'));
    finalScores.forEach((item) => addBucket(item.computed_at || item.updated_at, 'evaluations'));
    const estSubmissions = Number(overview.total_logs || 0);
    if (estSubmissions > 0) {
      const now = new Date().toISOString().slice(0, 7);
      if (!bucket[now]) bucket[now] = { month: now, submissions: 0, evaluations: 0, placements: 0 };
      bucket[now].submissions = estSubmissions;
    }
    return Object.values(bucket).sort((a, b) => a.month.localeCompare(b.month)).slice(-8);
  }, [placements, finalScores, overview.total_logs]);

  return (
    <Box sx={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Greeting banner ───────────────────────────────────── */}
      <DashGreeting
        role="admin"
        greeting="Good morning"
        name="Administrator"
        sub="Live overview of all interns across departments this semester."
        roleTag={`Live · Spring 2025 Cohort`}
        stats={[
          { num: stats.totalUsers, label: 'Users' },
          { num: stats.activeInternships, label: 'Active' },
          { num: `${overview.approval_rate || 0}%`, label: 'Approval Rate' },
          { num: stats.pendingApprovals, label: 'Pending' },
        ]}
      />

      <Grid container spacing={2}>
        {/* ── Metric cards ──────────────────────────────────────── */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon sx={{ fontSize: 17 }} />}
            label="Total Users"
            value={stats.totalUsers}
            sub="Registered across all roles"
            variant="teal"
            actionLabel="Manage Users"
            onClick={() => navigate('/admin/staff')}
            loading={loading}
            delay={0.05}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AssignmentIcon sx={{ fontSize: 17 }} />}
            label="Active Placements"
            value={stats.activeInternships}
            sub="Current internship placements"
            variant="indigo"
            actionLabel="View Placements"
            onClick={() => navigate('/placements')}
            loading={loading}
            delay={0.10}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<VerifiedIcon sx={{ fontSize: 17 }} />}
            label="Pending Approvals"
            value={stats.pendingApprovals}
            sub="Supervisor requests awaiting review"
            variant="amber"
            actionLabel="Review Approvals"
            onClick={() => navigate('/admin/approvals')}
            loading={loading}
            delay={0.15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TimelineIcon sx={{ fontSize: 17 }} />}
            label="System Health"
            value={`${stats.systemHealth}%`}
            sub="Platform health score"
            variant={stats.systemHealth >= 70 ? 'teal' : stats.systemHealth >= 40 ? 'amber' : 'danger'}
            loading={loading}
            delay={0.20}
          />
        </Grid>

        {/* ── User Distribution ─────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title="User Distribution"
            subtitle="Breakdown by role"
            delay={0.25}
          >
            <Grid container spacing={2} sx={{ mt: 0 }}>
              {[
                { label: 'Students',    count: stats.students,    color: T.i600, bg: T.i50 },
                { label: 'Supervisors', count: stats.supervisors,  color: T.t600, bg: T.t50 },
                { label: 'Admins',      count: stats.admins,       color: T.violet, bg: T.violetL },
              ].map(({ label, count, color, bg }) => (
                <Grid item xs={4} key={label}>
                  <Box sx={{ textAlign: 'center', p: '16px 8px', borderRadius: '12px', bgcolor: bg, border: `1px solid ${T.border}` }}>
                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{count}</Typography>
                    <Typography sx={{ fontSize: '11px', color: T.tx3, mt: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'DM Sans', sans-serif" }}>{label}</Typography>
                    <Box sx={{ mt: '8px', height: '4px', borderRadius: '99px', bgcolor: T.border2, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', borderRadius: '99px', bgcolor: color, width: `${stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0}%`, transition: 'width 1s cubic-bezier(.34,1.2,.64,1)' }} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        {/* ── System Overview ───────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title="System Overview"
            subtitle="Key platform metrics"
            delay={0.30}
          >
            <Grid container spacing={1.5} sx={{ mt: 0 }}>
              {systemMetrics.map((metric, idx) => (
                <Grid item xs={6} key={idx}>
                  <Box sx={{ p: '12px 14px', borderRadius: '10px', bgcolor: T.surface2, border: `1px solid ${T.border}` }}>
                    <Typography sx={{ fontSize: '10.5px', color: T.tx3, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 600, mb: '4px', fontFamily: "'DM Sans', sans-serif" }}>{metric.label}</Typography>
                    <Typography sx={{ fontSize: '22px', fontWeight: 700, color: T.tx1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px', fontFamily: "'DM Sans', sans-serif" }}>{metric.value}</Typography>
                    <Typography sx={{ fontSize: '11px', color: T.t600, display: 'flex', alignItems: 'center', gap: '3px', mt: '4px', fontFamily: "'DM Sans', sans-serif" }}>
                      <TrendingUpIcon sx={{ fontSize: 11 }} /> {metric.change}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        {/* ── Platform Analytics ────────────────────────────────── */}
        <Grid item xs={12}>
          <SectionCard
            title="Platform Analytics"
            subtitle="Internship cycle summary"
            action={<Box component="button" onClick={() => navigate('/reports')} sx={{ fontSize: '12px', color: T.t600, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", px: '12px', py: '5px', borderRadius: '8px', border: `1px solid ${T.border2}`, bgcolor: 'transparent', transition: 'all .14s', '&:hover': { bgcolor: T.t50, borderColor: T.t400 } }}>View Detailed Report →</Box>}
            delay={0.35}
          >
            <Grid container spacing={1.5}>
              {[
                { label: 'Total Placements',     value: stats.totalPlacements,                                                                     color: T.tx1 },
                { label: 'Placement Rate',        value: `${stats.totalPlacements ? Math.round((stats.activeInternships / stats.totalPlacements) * 100) : 0}%`, color: T.t700 },
                { label: 'Log Approval Rate',     value: `${overview.approval_rate || 0}%`,                                                        color: T.i700 },
                { label: 'Final Scores Released', value: finalScores.length,                                                                       color: T.a700 },
              ].map(({ label, value, color }) => (
                <Grid item xs={6} sm={3} key={label}>
                  <Box sx={{ textAlign: 'center', p: '14px 8px', bgcolor: T.surface2, borderRadius: '12px', border: `1px solid ${T.border}` }}>
                    <Typography sx={{ fontSize: '22px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px', fontFamily: "'DM Sans', sans-serif" }}>{value}</Typography>
                    <Typography sx={{ fontSize: '11px', color: T.tx3, mt: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'DM Sans', sans-serif" }}>{label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionCard title="Grade Distribution" subtitle="A-F outcomes across finalized scores" delay={0.37}>
            <Box sx={{ height: 220 }}>
              {gradeDistributionChart.length === 0 ? (
                <Typography sx={{ color: T.tx3, fontSize: '13px' }}>No finalized grades yet.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gradeDistributionChart} dataKey="value" nameKey="name" outerRadius={72} label>
                      {gradeDistributionChart.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <SectionCard title="Placement Distribution" subtitle="Students per organization" delay={0.39}>
            <Box sx={{ height: 220 }}>
              {placementDistributionChart.length === 0 ? (
                <Typography sx={{ color: T.tx3, fontSize: '13px' }}>No placement distribution data yet.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={placementDistributionChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border2} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill={T.i700} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12}>
          <SectionCard title="System Trend" subtitle="Monthly submissions, evaluations, and placements" delay={0.41}>
            <Box sx={{ height: 230 }}>
              {activityTrendChart.length === 0 ? (
                <Typography sx={{ color: T.tx3, fontSize: '13px' }}>No trend data available.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityTrendChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border2} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="submissions" stroke={T.t700} strokeWidth={2.2} dot={false} />
                    <Line type="monotone" dataKey="evaluations" stroke={T.a700} strokeWidth={2.2} dot={false} />
                    <Line type="monotone" dataKey="placements" stroke={T.i700} strokeWidth={2.2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </SectionCard>
        </Grid>

        {/* ── Recent Activity + Quick Actions ───────────────────── */}
        <Grid item xs={12} md={6}>
          <RecentActivity activities={recentActivities} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <QuickActions actions={quickActions} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;