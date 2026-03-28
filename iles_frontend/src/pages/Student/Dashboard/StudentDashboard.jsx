// Student Dashboard - Customized for interns
import { Typography, Paper, Box, Grid, Card, CardContent, Button, LinearProgress } from '@mui/material';
import { School as SchoolIcon, Assignment as AssignmentIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Internship Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Active Internship */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Active Internship</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                No active internship placement
              </Typography>
              <Button
                size="small"
                sx={{ mt: 2 }}
                onClick={() => navigate('/placements')}
              >
                View Placements
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Logs */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Weekly Logs</Typography>
              </Box>
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                0/12
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Logs submitted this week
              </Typography>
              <Button
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/logs')}
              >
                Submit Log
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Progress */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Profile Completion</Typography>
              <LinearProgress variant="determinate" value={65} sx={{ mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                Complete your profile to unlock all features
              </Typography>
              <Button
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/profile')}
              >
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Overall Progress */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Overall Progress</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Internship Progress: <strong>0%</strong>
              </Typography>
              <LinearProgress variant="determinate" value={0} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
