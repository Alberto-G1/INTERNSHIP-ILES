// frontend/src/pages/dashboard/AcademicSupervisorDashboard.jsx
import { Typography, Box, Grid, Card, CardContent, Avatar, Chip, Rating, Divider, LinearProgress, Button } from '@mui/material';
import { 
  School as SchoolIcon, 
  Assessment as AssessmentIcon, 
  ChecklistRtl as EvalIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';

const AcademicSupervisorDashboard = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Mock data - replace with actual API calls
  const stats = {
    pendingEvaluations: 4,
    studentsUnderSupervision: 12,
    evaluationsCompleted: 8,
    avgStudentProgress: 65,
    atRiskStudents: 2,
    institutionInfo: {
      name: 'University of Technology',
      department: 'Computer Science',
    },
  };

  const evaluationProgress = {
    notStarted: 3,
    inProgress: 5,
    completed: 4,
  };

  const recentActivities = [
    {
      type: 'evaluation',
      title: 'New Evaluation Submitted',
      description: 'John Doe completed mid-term evaluation',
      time: '2 hours ago',
      status: 'Pending Review',
    },
    {
      type: 'warning',
      title: 'Low Progress Alert',
      description: 'Jane Smith is behind schedule on weekly logs',
      time: 'Yesterday',
      status: 'Attention Needed',
    },
    {
      type: 'approval',
      title: 'Evaluation Approved',
      description: 'Michael Chen\'s evaluation was approved',
      time: '2 days ago',
      status: 'Completed',
    },
  ];

  const quickActions = [
    { label: 'Review Evaluations', icon: <EvalIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/evaluations') },
    { label: 'View Students', icon: <PeopleIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/interns') },
    { label: 'Generate Reports', icon: <AssessmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/reports') },
    { label: 'Update Profile', icon: <SchoolIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/profile') },
  ];

  const topStudents = [
    { name: 'Michael Chen', progress: 92, rating: 4.8 },
    { name: 'Sarah Johnson', progress: 88, rating: 4.6 },
    { name: 'Emily Davis', progress: 85, rating: 4.5 },
  ];

  return (
    <Box
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--ink)', mb: 1 }}>
          Academic Supervisor Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--gray-500)' }}>
          Monitor student progress, review evaluations, and provide academic guidance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Pending Evaluations */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={EvalIcon}
            title="Pending Evaluations"
            value={stats.pendingEvaluations}
            subtitle="Student evaluations awaiting your review"
            color="warning"
            actionLabel="Review Evaluations"
            onAction={() => navigate('/evaluations')}
          />
        </Grid>

        {/* Students Under Supervision */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={PeopleIcon}
            title="Students in Internship"
            value={stats.studentsUnderSupervision}
            subtitle="Active interns under your supervision"
            color="primary"
            actionLabel="View Students"
            onAction={() => navigate('/interns')}
          />
        </Grid>

        {/* Average Student Progress */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={TrendingUpIcon}
            title="Average Progress"
            value={`${stats.avgStudentProgress}%`}
            subtitle="Overall student completion rate"
            color="success"
            trend={+5}
          />
        </Grid>

        {/* Evaluation Progress */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Evaluation Progress</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Not Started</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{evaluationProgress.notStarted}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(evaluationProgress.notStarted / 12) * 100} 
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--gray-200)' }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">In Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{evaluationProgress.inProgress}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(evaluationProgress.inProgress / 12) * 100} 
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--gray-200)' }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Completed</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{evaluationProgress.completed}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(evaluationProgress.completed / 12) * 100} 
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--gray-200)' }}
                  />
                </Box>
              </Box>
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid var(--gray-200)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'var(--gray-600)' }}>Completion Rate</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--green-600)' }}>
                    {Math.round((evaluationProgress.completed / 12) * 100)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Students */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Top Performing Students</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {topStudents.map((student, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'var(--amber-100)', color: 'var(--amber-700)' }}>
                          {student.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{student.name}</Typography>
                          <Rating value={student.rating} precision={0.1} size="small" readOnly />
                        </Box>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--green-600)' }}>
                        {student.progress}%
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ 
                        height: '4px', 
                        background: 'var(--gray-200)', 
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: `${student.progress}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, var(--green-500), var(--green-600))',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease'
                        }} />
                      </Box>
                    </Box>
                    {index < topStudents.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Institution Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Institution Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Institution</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{stats.institutionInfo.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Department</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{stats.institutionInfo.department}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Active Semester</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>Spring 2025</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ color: 'var(--green-600)', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/profile')}
                >
                  Update Profile →
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* At-Risk Students Alert */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', bgcolor: 'var(--red-50)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WarningIcon sx={{ color: 'var(--red-600)' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--red-700)' }}>
                  Students Needing Attention
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--red-600)', mb: 1 }}>
                {stats.atRiskStudents}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--red-700)', mb: 2 }}>
                Students with low progress or missed deadlines
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ 
                  borderColor: 'var(--red-300)', 
                  color: 'var(--red-700)',
                  '&:hover': { borderColor: 'var(--red-500)', bgcolor: 'var(--red-100)' }
                }}
                onClick={() => navigate('/interns?filter=at-risk')}
              >
                View Details →
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
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

export default AcademicSupervisorDashboard;