import { Typography, Paper, Box, Grid, Card, CardContent } from '@mui/material';

const StudentDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Internship</Typography>
              <Typography variant="body2" color="textSecondary">
                No active internship placement
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Weekly Logs</Typography>
              <Typography variant="h2" align="center">0/12</Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Logs submitted this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;