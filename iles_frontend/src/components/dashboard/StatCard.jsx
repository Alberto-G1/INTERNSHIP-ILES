// frontend/src/components/Dashboard/StatCard.jsx
import { Card, CardContent, Box, Typography, LinearProgress, Skeleton } from '@mui/material';
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
}) => {
  const colorMap = {
    primary: { main: 'var(--t700, #1A7A57)', light: 'var(--t100, #D4F7EE)', gradient: 'linear-gradient(90deg, var(--t700), var(--t400))', class: 'm-teal' },
    warning: { main: 'var(--a600, #D96B0E)', light: 'var(--a100, #FEF0DC)', gradient: 'linear-gradient(90deg, var(--a700), var(--a400))', class: 'm-amber' },
    success: { main: 'var(--t600, #22916A)', light: 'var(--t100, #D4F7EE)', gradient: 'linear-gradient(90deg, var(--t700), var(--t400))', class: 'm-teal' },
    info: { main: 'var(--i600, #3D51C8)', light: 'var(--i100, #E0E5FB)', gradient: 'linear-gradient(90deg, var(--i700), var(--i400))', class: 'm-indigo' },
    error: { main: 'var(--danger, #E84545)', light: 'var(--danger-l, #FDEAEA)', gradient: 'linear-gradient(90deg, #C0392B, #EF4444)', class: 'm-danger' },
    violet: { main: 'var(--violet, #7C3AED)', light: 'var(--violet-l, #EDE9FE)', gradient: 'linear-gradient(90deg, var(--violet), #A855F7)', class: 'm-violet' },
  };

  const colors = colorMap[color] || colorMap.primary;

  if (loading) {
    return (
      <Card sx={{ height: '100%', border: '1px solid var(--border)', bgcolor: 'var(--surface)' }}>
        <CardContent>
          <Skeleton variant="rectangular" height={100} />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card 
        sx={{ 
          height: '100%', 
          border: '1px solid var(--border)', 
          bgcolor: 'var(--surface)',
          borderRadius: '14px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: 'var(--shl, 0 8px 30px rgba(13,16,32,.10))',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: colors.gradient,
            borderRadius: '14px 14px 0 0',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: colors.main,
            opacity: 0.06,
            transition: 'opacity 0.25s',
          },
          '&:hover::after': {
            opacity: 0.1,
          },
        }}
      >
        <CardContent sx={{ p: '18px 18px 16px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box 
              sx={{ 
                width: 38, 
                height: 38, 
                borderRadius: '10px', 
                bgcolor: colors.light,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.main,
              }}
            >
              <Icon sx={{ fontSize: 17 }} />
            </Box>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: trend > 0 ? 'var(--t600)' : 'var(--danger)' }}>
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--tx3)' }}>vs last month</Typography>
              </Box>
            )}
          </Box>

          <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.6px', mb: '3px' }}>
            {title}
          </Typography>
          
          <Typography sx={{ fontSize: '28px', fontWeight: 700, color: 'var(--tx1)', letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </Typography>

          <Typography variant="caption" sx={{ color: 'var(--tx3)', display: 'block', mt: '6px', fontSize: '11.5px' }}>
            {subtitle}
          </Typography>

          {progress !== undefined && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 7, 
                  borderRadius: 99,
                  bgcolor: 'var(--surface2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: colors.main,
                    borderRadius: 99,
                  }
                }} 
              />
            </Box>
          )}

          {actionLabel && onAction && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid var(--border)' }}>
              <Typography
                variant="caption"
                sx={{ 
                  color: colors.main, 
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={onAction}
              >
                {actionLabel}
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;