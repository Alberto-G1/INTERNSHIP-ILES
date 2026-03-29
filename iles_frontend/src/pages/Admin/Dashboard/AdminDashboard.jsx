// Admin Dashboard - System administration center
import { Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { 
  People as PeopleIcon, 
  AssignmentInd as AssignmentIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Administration Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* User Management */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.3s', '&:hover': { boxShadow: 2 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6">User Management</Typography>
              </Box>
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                0
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Total registered users
              </Typography>
              <Button
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/users')}
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Internship Placements */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.3s', '&:hover': { boxShadow: 2 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'success.main', fontSize: 28 }} />
                <Typography variant="h6">Placements</Typography>
              </Box>
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                0
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Active internship placements
              </Typography>
              <Button
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/placements')}
              >
                View Placements
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* System Overview */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">System Overview</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>0</Typography>
                    <Typography variant="caption">Students</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>0</Typography>
                    <Typography variant="caption">Supervisors</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>0</Typography>
                    <Typography variant="caption">Active</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>0</Typography>
                    <Typography variant="caption">Pending</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="outlined" size="small" onClick={() => navigate('/users')}>
                  Add User
                </Button>
                <Button variant="outlined" size="small" onClick={() => navigate('/reports')}>
                  View Reports
                </Button>
                <Button variant="outlined" size="small" onClick={() => navigate('/admin/approvals')}>
                  Supervisor Approvals
                </Button>
                <Button variant="outlined" size="small" onClick={() => navigate('/settings')}>
                  System Settings
                </Button>
                <Button variant="outlined" size="small" onClick={() => navigate('/logs')}>
                  View Logs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
