// frontend/src/components/Dashboard/RecentActivity.jsx
import { Card, CardContent, Typography, Box, Avatar, Chip, Divider } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';

const RecentActivity = ({ activities, loading = false }) => {
  const getActivityIcon = (type) => {
    const icons = {
      log: '📝',
      evaluation: '⭐',
      placement: '💼',
      approval: '✅',
      warning: '⚠️',
    };
    return icons[type] || '📌';
  };

  const getActivityColor = (type) => {
    const colors = {
      log: 'var(--blue-500)',
      evaluation: 'var(--amber-500)',
      placement: 'var(--green-500)',
      approval: 'var(--emerald-500)',
      warning: 'var(--red-500)',
    };
    return colors[type] || 'var(--gray-500)';
  };

  return (
    <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--ink)' }}>
          Recent Activity
        </Typography>
        
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="textSecondary">Loading activities...</Typography>
          </Box>
        ) : activities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="textSecondary">No recent activities</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activities.map((activity, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: `${getActivityColor(activity.type)}20`,
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--ink)' }}>
                      {activity.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)', display: 'block', mt: 0.5 }}>
                      {activity.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <TimeIcon sx={{ fontSize: 12, color: 'var(--gray-400)' }} />
                      <Typography variant="caption" sx={{ color: 'var(--gray-400)' }}>
                        {activity.time}
                      </Typography>
                      {activity.status && (
                        <Chip 
                          label={activity.status} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '10px',
                            bgcolor: activity.status === 'Completed' ? 'var(--green-50)' : 'var(--amber-50)',
                            color: activity.status === 'Completed' ? 'var(--green-700)' : 'var(--amber-700)',
                          }} 
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
                {index < activities.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;