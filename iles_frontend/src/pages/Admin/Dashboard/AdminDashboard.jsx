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
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const stats = {
    totalUsers: 245,
    totalPlacements: 78,
    activeInternships: 52,
    pendingApprovals: 8,
    students: 156,
    supervisors: 45,
    admins: 4,
    systemHealth: 98,
  };

  const userGrowth = {
    monthly: '+12%',
    weekly: '+3%',
  };

  const recentActivities = [
    {
      type: 'approval',
      title: 'New Supervisor Request',
      description: 'John Smith requested supervisor approval',
      time: '30 minutes ago',
      status: 'Pending',
    },
    {
      type: 'placement',
      title: 'Placement Created',
      description: 'New internship placement at Tech Corp',
      time: '2 hours ago',
      status: 'Active',
    },
    {
      type: 'warning',
      title: 'System Update',
      description: 'New version v2.5.0 available',
      time: 'Yesterday',
      status: 'Info',
    },
  ];

  const quickActions = [
    { label: 'Add User', icon: <PeopleIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/users') },
    { label: 'View Reports', icon: <AssessmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/reports') },
    { label: 'Approve Supervisors', icon: <VerifiedIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/admin/approvals') },
    { label: 'System Settings', icon: <SettingsIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/settings') },
    { label: 'View Logs', icon: <TimelineIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/logs') },
    { label: 'Manage Placements', icon: <AssignmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/placements') },
  ];

  const systemMetrics = [
    { label: 'Active Users', value: '156', change: '+8%', color: 'green' },
    { label: 'API Calls', value: '2.4k', change: '+23%', color: 'blue' },
    { label: 'Error Rate', value: '0.3%', change: '-0.1%', color: 'green' },
    { label: 'Response Time', value: '124ms', change: '-12ms', color: 'green' },
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
            trend={+12}
            actionLabel="Manage Users"
            onAction={() => navigate('/users')}
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
            trend={+5}
            actionLabel="View Placements"
            onAction={() => navigate('/placements')}
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
                      value={(stats.students / stats.totalUsers) * 100} 
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
                      value={(stats.supervisors / stats.totalUsers) * 100} 
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
                      value={(stats.admins / stats.totalUsers) * 100} 
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
                          color: metric.change.includes('-') ? 'var(--red-500)' : 'var(--green-600)',
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
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{Math.round((stats.activeInternships / stats.totalPlacements) * 100)}%</Typography>
                    <Typography variant="caption">Placement Rate</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'var(--gray-50)', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>4.2</Typography>
                    <Typography variant="caption">Avg Rating</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'var(--gray-50)', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>92%</Typography>
                    <Typography variant="caption">Completion Rate</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <RecentActivity activities={recentActivities} />
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