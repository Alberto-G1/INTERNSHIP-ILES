// frontend/src/components/Dashboard/QuickActions.jsx
import { Card, CardContent, Typography, Box, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';

const QuickActions = ({ actions, loading = false }) => {
  return (
    <Card sx={{ border: '1px solid var(--gray-200)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--ink)' }}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={1.5}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={action.onClick}
                  startIcon={action.icon}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1,
                    borderColor: 'var(--gray-200)',
                    color: 'var(--gray-700)',
                    '&:hover': {
                      borderColor: 'var(--green-600)',
                      bgcolor: 'var(--green-50)',
                      color: 'var(--green-700)',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {action.label}
                </Button>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions;