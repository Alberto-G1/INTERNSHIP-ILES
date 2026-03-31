// frontend/src/components/Dashboard/StatCard.jsx
import { Card, CardContent, Box, Typography, IconButton, LinearProgress, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = 'primary',
  progress,
  actionLabel,
  onAction,
  loading = false,
  trend,
  trendValue
}) => {
  const colorMap = {
    primary: { main: 'var(--green-600)', light: 'var(--green-50)' },
    warning: { main: '#F59E0B', light: '#FEF3C7' },
    success: { main: '#10B981', light: '#D1FAE5' },
    info: { main: '#3B82F6', light: '#DBEAFE' },
    error: { main: '#EF4444', light: '#FEE2E2' },
  };

  const colors = colorMap[color];

  if (loading) {
    return (
      <Card sx={{ height: '100%', border: '1px solid var(--gray-200)' }}>
        <CardContent>
          <Skeleton variant="rectangular" height={100} />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          height: '100%', 
          border: '1px solid var(--gray-200)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px -12px rgba(0,0,0,0.15)',
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  p: 1, 
                  borderRadius: '10px', 
                  bgcolor: colors.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon sx={{ color: colors.main, fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle2" sx={{ color: 'var(--gray-600)', fontWeight: 500 }}>
                {title}
              </Typography>
            </Box>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: trend > 0 ? 'var(--green-600)' : 'var(--red-500)' }}>
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--gray-400)' }}>vs last month</Typography>
              </Box>
            )}
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'var(--ink)' }}>
            {value}
          </Typography>

          <Typography variant="caption" sx={{ color: 'var(--gray-500)', display: 'block', mb: progress ? 2 : 0 }}>
            {subtitle}
          </Typography>

          {progress !== undefined && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: colors.light,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: colors.main,
                    borderRadius: 3,
                  }
                }} 
              />
            </Box>
          )}

          {actionLabel && onAction && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                sx={{ 
                  color: colors.main, 
                  cursor: 'pointer',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={onAction}
              >
                {actionLabel} →
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;