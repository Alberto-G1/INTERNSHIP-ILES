// frontend/src/pages/dashboard/WorkplaceSupervisorDashboard.jsx
import { Typography, Box, Grid, Card, CardContent, Avatar, Chip, Rating, Divider } from '@mui/material';
import { 
  RateReview as ReviewIcon, 
  Group as GroupIcon, 
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';

const WorkplaceSupervisorDashboard = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const stats = {
    pendingReviews: 3,
    studentsAssigned: 5,
    logsReviewed: 12,
    approvalsGiven: 8,
    rejections: 2,
    avgRating: 4.2,
  };

  const recentActivities = [
    {
      type: 'log',
      title: 'New Log Submission',
      description: 'John Doe submitted Week 3 log',
      time: '1 hour ago',
      status: 'Pending Review',
    },
    {
      type: 'evaluation',
      title: 'Evaluation Completed',
      description: 'Jane Smith completed mid-term evaluation',
      time: '3 hours ago',
      status: 'Completed',
    },
    {
      type: 'approval',
      title: 'Log Approved',
      description: 'Week 2 log approved for Michael Chen',
      time: 'Yesterday',
      status: 'Approved',
    },
  ];

  const quickActions = [
    { label: 'Review Pending Logs', icon: <ReviewIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/logs') },
    { label: 'View Students', icon: <GroupIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/interns') },
    { label: 'Provide Feedback', icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/evaluations') },
    { label: 'Update Profile', icon: <AssignmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/profile') },
  ];

  const students = [
    { name: 'John Doe', progress: 75, status: 'Active', lastLog: '2 days ago' },
    { name: 'Jane Smith', progress: 45, status: 'Active', lastLog: '5 days ago' },
    { name: 'Michael Chen', progress: 90, status: 'Excellent', lastLog: 'Yesterday' },
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
            Workplace Supervisor Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--gray-500)' }}>
            Monitor student progress, review logs, and provide feedback
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Pending Reviews */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={ReviewIcon}
            title="Pending Reviews"
            value={stats.pendingReviews}
            subtitle="Logs awaiting your review"
            color="warning"
            actionLabel="Review Logs"
            onAction={() => navigate('/logs')}
          />
        </Grid>

        {/* Students Assigned */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={GroupIcon}
            title="Students Assigned"
            value={stats.studentsAssigned}
            subtitle="Interns under your supervision"
            color="primary"
            actionLabel="View Students"
            onAction={() => navigate('/interns')}
          />
        </Grid>

        {/* Average Rating */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={TrendingUpIcon}
            title="Average Rating"
            value={stats.avgRating}
            subtitle="Student performance rating"
            color="success"
            trend={+8}
          />
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid var(--gray-200)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Performance Overview</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--green-600)' }}>
                      {stats.logsReviewed}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Logs Reviewed</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--blue-600)' }}>
                      {stats.approvalsGiven}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Approvals Given</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--red-600)' }}>
                      {stats.rejections}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Rejections</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--amber-600)' }}>
                      {Math.round((stats.approvalsGiven / stats.logsReviewed) * 100)}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Approval Rate</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Students Under Supervision */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Students Under Supervision</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {students.map((student, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'var(--green-100)', color: 'var(--green-700)' }}>
                          {student.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{student.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>
                            Last log: {student.lastLog}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={student.status} 
                        size="small"
                        sx={{ 
                          bgcolor: student.status === 'Excellent' ? 'var(--green-50)' : 'var(--blue-50)',
                          color: student.status === 'Excellent' ? 'var(--green-700)' : 'var(--blue-700)',
                        }}
                      />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">Progress</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>{student.progress}%</Typography>
                      </Box>
                      <div className="progress-bar" style={{ 
                        height: '4px', 
                        background: 'var(--gray-200)', 
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${student.progress}%`, 
                          height: '100%', 
                          background: 'var(--green-600)',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </Box>
                    {index < students.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography 
                  variant="caption" 
                  sx={{ color: 'var(--green-600)', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/interns')}
                >
                  View all students →
                </Typography>
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

export default WorkplaceSupervisorDashboard;