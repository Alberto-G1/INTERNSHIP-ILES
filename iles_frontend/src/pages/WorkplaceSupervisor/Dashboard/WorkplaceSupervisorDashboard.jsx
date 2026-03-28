// Workplace Supervisor Dashboard - Customized for workplace supervisors
import { Typography, Paper, Box, Grid, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { RateReview as ReviewIcon, Group as GroupIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const WorkplaceSupervisorDashboard = () => {
  const navigate = useNavigate();

  const pendingReviews = [
    { id: 1, studentName: 'John Doe', company: 'Tech Corp', status: 'Pending' },
    { id: 2, studentName: 'Jane Smith', company: 'Tech Corp', status: 'Pending' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Workplace Supervisor Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Pending Reviews */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReviewIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Pending Reviews</Typography>
              </Box>
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                0
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Logs awaiting your review
              </Typography>
              <Button
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/logs')}
              >
                Review Logs
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Students Supervised */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Students Assigned</Typography>
              </Box>
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                0
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Interns under your supervision
              </Typography>
              <Button
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/interns')}
              >
                View Students
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Statistics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>0</Typography>
                    <Typography variant="caption">Logs Reviewed</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>0</Typography>
                    <Typography variant="caption">Approvals Given</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>0</Typography>
                    <Typography variant="caption">Rejections</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>0</Typography>
                    <Typography variant="caption">Avg Rating</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Info */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Organization Information</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Company: <strong>Not Set</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Department: <strong>Not Set</strong>
                </Typography>
              </Box>
              <Button
                size="small"
                sx={{ mt: 2 }}
                onClick={() => navigate('/profile')}
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkplaceSupervisorDashboard;
