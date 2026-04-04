// frontend/src/pages/dashboard/AdminDashboard.jsx
import { Typography, Box, Grid, Card, CardContent, Avatar, Chip, Divider, LinearProgress, Button } from '@mui/material';
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
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';
import { adminAPI, adminPlacementsAPI, adminUsersAPI, evaluationsAPI, logbookAPI } from '../../../services/api';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [overview, setOverview] = useState({
    total_logs: 0,
    pending_review: 0,
    approved: 0,
    revisions: 0,
    late_submissions: 0,
    approval_rate: 0,
  });
  const [finalScores, setFinalScores] = useState([]);

  useEffect(() => {
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

        if (usersRes.status === 'fulfilled') {
          setUsers(Array.isArray(usersRes.value.data) ? usersRes.value.data : []);
        }
        if (placementsRes.status === 'fulfilled') {
          const data = placementsRes.value.data;
          setPlacements(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []);
        }
        if (approvalsRes.status === 'fulfilled') {
          const approvalUsers = Array.isArray(approvalsRes.value.data) ? approvalsRes.value.data : [];
          setPendingApprovals(approvalUsers.filter((user) => !user.admin_approved));
        }
        if (overviewRes.status === 'fulfilled') {
          setOverview({ ...overview, ...overviewRes.value.data });
        }
        if (finalScoresRes.status === 'fulfilled') {
          setFinalScores(Array.isArray(finalScoresRes.value.data) ? finalScoresRes.value.data : []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const students = users.filter((user) => user.role === 'student').length;
    const supervisors = users.filter((user) => ['academic_supervisor', 'workplace_supervisor'].includes(user.role)).length;
    const admins = users.filter((user) => user.role === 'admin').length;
    const activeInternships = placements.filter((placement) => ['active', 'approved'].includes(placement.current_lifecycle_status)).length;

    const healthScore = Math.max(
      0,
      Math.min(
        100,
        Math.round((Number(overview.approval_rate || 0) * 0.7) + ((pendingApprovals.length ? 0 : 100) * 0.3))
      )
    );

    return {
      totalUsers: users.length,
      totalPlacements: placements.length,
      activeInternships,
      pendingApprovals: pendingApprovals.length,
      students,
      supervisors,
      admins,
      systemHealth: healthScore,
    };
  }, [users, placements, pendingApprovals, overview.approval_rate]);

  const recentActivities = useMemo(() => {
    const approvalActivities = pendingApprovals.slice(0, 3).map((user) => ({
      type: 'approval',
      title: 'Supervisor approval pending',
      description: `${user.full_name || user.username} (${user.role})`,
      time: timeAgo(user.created_at),
      status: 'pending',
      sortAt: toDate(user.created_at),
    }));

    const placementActivities = placements.slice(0, 4).map((placement) => ({
      type: 'placement',
      title: `Placement ${placement.approval_status}`,
      description: `${placement.student_name || 'Student'} • ${placement.organization?.name || 'Organization'}`,
      time: timeAgo(placement.updated_at || placement.created_at),
      status: placement.approval_status,
      sortAt: toDate(placement.updated_at || placement.created_at),
    }));

    const scoreActivities = finalScores.slice(0, 3).map((score) => ({
      type: 'evaluation',
      title: 'Final score computed',
      description: `${score.student_name || 'Student'} • Grade ${score.grade || 'N/A'}`,
      time: timeAgo(score.computed_at || score.updated_at),
      status: score.grade || 'graded',
      sortAt: toDate(score.computed_at || score.updated_at),
    }));

    return [...approvalActivities, ...placementActivities, ...scoreActivities]
      .sort((a, b) => (b.sortAt?.getTime() || 0) - (a.sortAt?.getTime() || 0))
      .slice(0, 5)
      .map(({ sortAt, ...activity }) => activity);
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
    {
      label: 'Active Users',
      value: users.filter((user) => user.is_active).length,
      change: `${users.length ? Math.round((users.filter((user) => user.is_active).length / users.length) * 100) : 0}% active`,
    },
    {
      label: 'Pending Log Reviews',
      value: overview.pending_review || 0,
      change: `${overview.total_logs || 0} total logs`,
    },
    {
      label: 'Late Submissions',
      value: overview.late_submissions || 0,
      change: `${overview.approval_rate || 0}% approval rate`,
    },
    {
      label: 'Final Scores Released',
      value: finalScores.length,
      change: `${finalScores.filter((score) => score.grade === 'A').length} grade A`,
    },
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--ink)', mb: 1 }}>
            Administration Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--gray-500)' }}>
            System overview, user management, and platform analytics
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Total Users */}
        <Grid item xs={12} md={3}>
          <StatCard
            icon={PeopleIcon}
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Registered users across all roles"
            color="primary"
            actionLabel="Manage Users"
            onAction={() => navigate('/admin/staff')}
            loading={loading}
          />
        </Grid>

        {/* Active Placements */}
        <Grid item xs={12} md={3}>
          <StatCard
            icon={AssignmentIcon}
            title="Active Placements"
            value={stats.activeInternships}
            subtitle="Current internship placements"
            color="success"
            actionLabel="View Placements"
            onAction={() => navigate('/placements')}
            loading={loading}
          />
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} md={3}>
          <StatCard
            icon={VerifiedIcon}
            title="Pending Approvals"
            value={stats.pendingApprovals}
            subtitle="Supervisor requests awaiting review"
            color="warning"
            actionLabel="Review Approvals"
            onAction={() => navigate('/admin/approvals')}
            loading={loading}
          />
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={3}>
          <StatCard
            icon={TimelineIcon}
            title="System Health"
            value={`${stats.systemHealth}%`}
            subtitle="Platform uptime and performance"
            color="info"
            progress={stats.systemHealth}
            loading={loading}
          />
        </Grid>

        {/* User Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>User Distribution</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--blue-600)' }}>
                      {stats.students}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Students</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.totalUsers ? (stats.students / stats.totalUsers) * 100 : 0} 
                      sx={{ mt: 1, height: 4, borderRadius: 2 }} 
                    />
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--green-600)' }}>
                      {stats.supervisors}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Supervisors</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.totalUsers ? (stats.supervisors / stats.totalUsers) * 100 : 0} 
                      sx={{ mt: 1, height: 4, borderRadius: 2 }} 
                    />
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--purple-600)' }}>
                      {stats.admins}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Admins</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.totalUsers ? (stats.admins / stats.totalUsers) * 100 : 0} 
                      sx={{ mt: 1, height: 4, borderRadius: 2 }} 
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Overview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>System Overview</Typography>
              <Grid container spacing={2}>
                {systemMetrics.map((metric, index) => (
                  <Grid item xs={6} key={index}>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {metric.value}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'var(--green-600)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        {metric.change}
                        <TrendingUpIcon sx={{ fontSize: 12 }} />
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Analytics */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid var(--gray-200)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Platform Analytics</Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => navigate('/reports')}
                  sx={{ textTransform: 'none' }}
                >
                  View Detailed Report
                </Button>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'var(--gray-50)', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalPlacements}</Typography>
                    <Typography variant="caption">Total Placements</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'var(--gray-50)', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.totalPlacements ? Math.round((stats.activeInternships / stats.totalPlacements) * 100) : 0}%</Typography>
                    <Typography variant="caption">Placement Rate</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'var(--gray-50)', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{overview.approval_rate || 0}%</Typography>
                    <Typography variant="caption">Log Approval Rate</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'var(--gray-50)', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{finalScores.length}</Typography>
                    <Typography variant="caption">Computed Final Scores</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <RecentActivity activities={recentActivities} loading={loading} />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <QuickActions actions={quickActions} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;