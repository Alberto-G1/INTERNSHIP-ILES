// Academic Supervisor Dashboard - For academic oversight
import { Typography, Box, Grid, Card, CardContent, Button, LinearProgress } from '@mui/material';
import { School as SchoolIcon, Assessment as AssessmentIcon, ChecklistRtl as EvalIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AcademicSupervisorDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Academic Supervisor Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Evaluations Pending */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EvalIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Pending Evaluations</Typography>
              </Box>
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                0
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Student evaluations awaiting your assessment
              </Typography>
              <Button
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/evaluations')}
              >
                Review Evaluations
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Students Under Supervision */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Students in Internship</Typography>
              </Box>
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                0
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Active interns under your academic supervision
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

        {/* Academic Progress */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Evaluation Progress</Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Not Started</Typography>
                  <LinearProgress variant="determinate" value={0} />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">In Progress</Typography>
                  <LinearProgress variant="determinate" value={0} />
                </Box>
                <Box>
                  <Typography variant="body2">Completed</Typography>
                  <LinearProgress variant="determinate" value={0} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Institution Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Institution Information</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Institution: <strong>Not Set</strong>
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

export default AcademicSupervisorDashboard;
