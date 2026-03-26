import { Typography, Paper, Box, Grid, Card, CardContent } from '@mui/material';

const SupervisorDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Supervisor Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending Reviews</Typography>
              <Typography variant="h2" align="center">0</Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Logs awaiting your review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Students Supervised</Typography>
              <Typography variant="h2" align="center">0</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupervisorDashboard;