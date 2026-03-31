// frontend/src/pages/dashboard/StudentDashboard.jsx
import { Typography, Box, Grid, Card, CardContent, Button, LinearProgress, Chip } from '@mui/material';
import { 
  School as SchoolIcon, 
  Assignment as AssignmentIcon, 
  TrendingUp as TrendingUpIcon,
  EmojiEvents as AchievementIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // Mock data - replace with actual API calls
  const stats = {
    activeInternship: false,
    weeklyLogs: { submitted: 0, total: 12 },
    profileCompletion: 65,
    overallProgress: 0,
    achievements: 2,
    upcomingDeadlines: 3,
  };

  const recentActivities = [
    {
      type: 'log',
      title: 'Weekly Log Submitted',
      description: 'Week 2 log submitted for review',
      time: '2 hours ago',
      status: 'Pending',
    },
    {
      type: 'evaluation',
      title: 'Mid-term Evaluation',
      description: 'Evaluation form available for completion',
      time: 'Yesterday',
      status: 'Pending',
    },
    {
      type: 'placement',
      title: 'Placement Application',
      description: 'Your application is being reviewed',
      time: '2 days ago',
      status: 'In Progress',
    },
  ];

  const quickActions = [
    { label: 'Submit Weekly Log', icon: <AssignmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/logs') },
    { label: 'Complete Profile', icon: <SchoolIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/profile') },
    { label: 'View Placements', icon: <TrendingUpIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/placements') },
    { label: 'Check Evaluations', icon: <CheckIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/evaluations') },
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
            Welcome back, Intern!
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--gray-500)' }}>
            Track your internship progress, submit logs, and complete evaluations
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Active Internship Status */}
        <Grid item xs={12} md={6}>
          <StatCard
            icon={SchoolIcon}
            title="Active Internship"
            value={stats.activeInternship ? "Active" : "No Active Placement"}
            subtitle={stats.activeInternship ? "Current internship details" : "Apply for placements to start your journey"}
            color={stats.activeInternship ? "success" : "warning"}
            actionLabel="View Placements"
            onAction={() => navigate('/placements')}
          />
        </Grid>

        {/* Weekly Logs */}
        <Grid item xs={12} md={6}>
          <StatCard
            icon={AssignmentIcon}
            title="Weekly Logs"
            value={`${stats.weeklyLogs.submitted}/${stats.weeklyLogs.total}`}
            subtitle="Logs submitted this week"
            color="primary"
            progress={(stats.weeklyLogs.submitted / stats.weeklyLogs.total) * 100}
            actionLabel="Submit Log"
            onAction={() => navigate('/logs')}
          />
        </Grid>

        {/* Profile Completion */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={SchoolIcon}
            title="Profile Completion"
            value={`${stats.profileCompletion}%`}
            subtitle="Complete your profile to unlock all features"
            color="info"
            progress={stats.profileCompletion}
            actionLabel="Complete Profile"
            onAction={() => navigate('/profile')}
          />
        </Grid>

        {/* Overall Progress */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={TrendingUpIcon}
            title="Overall Progress"
            value={`${stats.overallProgress}%`}
            subtitle="Internship completion status"
            color="success"
            progress={stats.overallProgress}
          />
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AchievementIcon sx={{ color: 'var(--amber-500)' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Achievements</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.achievements}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>
                Badges earned this semester
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="First Log" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, bgcolor: 'var(--green-50)', color: 'var(--green-700)' }} 
                />
                <Chip 
                  label="Profile Starter" 
                  size="small" 
                  sx={{ bgcolor: 'var(--blue-50)', color: 'var(--blue-700)' }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalendarIcon sx={{ color: 'var(--orange-500)' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Upcoming Deadlines</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Weekly Log Submission</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Due in 2 days</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={30} 
                    sx={{ mt: 1, height: 4, borderRadius: 2 }} 
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Mid-term Evaluation</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Due in 2 weeks</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={10} 
                    sx={{ mt: 1, height: 4, borderRadius: 2 }} 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <RecentActivity activities={recentActivities} />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <QuickActions actions={quickActions} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;