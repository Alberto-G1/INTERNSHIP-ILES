// frontend/src/components/Dashboard/DashboardComponents.jsx
import { Box, Typography, Card as MuiCard, CardContent, LinearProgress, Avatar, Chip, Divider, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Styled components matching the HTML design
export const GreetingCard = styled(Box)(({ theme, role }) => ({
  borderRadius: '20px',
  padding: '28px 32px',
  marginBottom: '22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '20px',
  position: 'relative',
  overflow: 'hidden',
  background: role === 'admin' 
    ? 'linear-gradient(135deg, #0F1635 0%, #1A2D5A 50%, #162840 100%)'
    : role === 'workplace'
    ? 'linear-gradient(135deg, #1A1050 0%, #2C1A6E 50%, #1A2A5E 100%)'
    : role === 'academic'
    ? 'linear-gradient(135deg, #2A0A5E 0%, #1A1050 50%, #0F1635 100%)'
    : 'linear-gradient(135deg, #0A2B1A 0%, #0F3522 50%, #0A2520 100%)',
  color: '#fff',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 280px 180px at 80% 50%, rgba(45,175,131,0.15) 0%, transparent 60%)',
    pointerEvents: 'none',
  }
}));

export const MetricCard = styled(MuiCard)(({ theme, color }) => ({
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '18px 18px 16px',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: 'var(--sh)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  cursor: 'default',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: 'var(--shl)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    borderRadius: '14px 14px 0 0',
    background: color === 'teal' ? 'linear-gradient(90deg, var(--t700), var(--t400))'
      : color === 'amber' ? 'linear-gradient(90deg, var(--a700), var(--a400))'
      : color === 'indigo' ? 'linear-gradient(90deg, var(--i700), var(--i400))'
      : 'linear-gradient(90deg, #C0392B, #EF4444)',
  }
}));

export const MetricIcon = styled(Box)(({ color }) => ({
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '14px',
  background: color === 'teal' ? 'var(--t100)' : color === 'amber' ? 'var(--a100)' : color === 'indigo' ? 'var(--i100)' : 'var(--danger-l)',
  color: color === 'teal' ? 'var(--t700)' : color === 'amber' ? 'var(--a700)' : color === 'indigo' ? 'var(--i700)' : 'var(--danger)',
}));

export const StyledCard = styled(MuiCard)({
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  boxShadow: 'var(--sh)',
  overflow: 'hidden',
});

export const CardHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 18px',
  borderBottom: '1px solid var(--border)',
});

export const CardTitle = styled(Typography)({
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--tx1)',
});

export const CardSubtitle = styled(Typography)({
  fontSize: '11.5px',
  color: 'var(--tx3)',
  marginTop: '1px',
});

export const CardLink = styled('span')({
  fontSize: '12px',
  color: 'var(--t600)',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'color 0.14s',
  '&:hover': {
    color: 'var(--t800)',
  },
});

export const StatusBadge = styled(Box)(({ status }) => {
  const colors = {
    approved: { bg: 'var(--t100)', color: 'var(--t800)', dot: 'var(--t600)' },
    pending: { bg: 'var(--a100)', color: 'var(--a800)', dot: 'var(--a600)' },
    rejected: { bg: 'var(--danger-l)', color: 'var(--danger)', dot: 'var(--danger)' },
    active: { bg: 'var(--t100)', color: 'var(--t800)', dot: 'var(--t600)' },
    completed: { bg: 'var(--i100)', color: 'var(--i700)', dot: 'var(--i600)' },
    'at-risk': { bg: 'var(--danger-l)', color: 'var(--danger)', dot: 'var(--danger)' },
  };
  const s = colors[status?.toLowerCase()] || colors.pending;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 9px',
    borderRadius: '99px',
    fontSize: '10.5px',
    fontWeight: 600,
    background: s.bg,
    color: s.color,
    '&::before': {
      content: '""',
      width: '5px',
      height: '5px',
      borderRadius: '50%',
      background: s.dot,
    },
  };
});

export const ProgressRow = ({ label, value, total, color = 'teal' }) => {
  const percentage = total ? Math.round((value / total) * 100) : value;
  const colors = {
    teal: { bg: 'var(--t700)', light: 'var(--t400)' },
    amber: { bg: 'var(--a700)', light: 'var(--a400)' },
    indigo: { bg: 'var(--i700)', light: 'var(--i400)' },
    violet: { bg: 'var(--violet)', light: '#A855F7' },
  };
  const c = colors[color] || colors.teal;
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'var(--tx2)' }}>{label}</Typography>
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--tx1)' }}>{percentage}%</Typography>
      </Box>
      <Box sx={{ background: 'var(--surface2)', borderRadius: '99px', height: '7px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Box sx={{ height: '100%', borderRadius: '99px', width: `${percentage}%`, background: `linear-gradient(90deg, ${c.bg}, ${c.light})`, transition: 'width 1s ease' }} />
      </Box>
    </Box>
  );
};

export const PersonRow = ({ name, subtitle, score, status, avatarColor, onView }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)', '&:last-child': { borderBottom: 'none' } }}>
    <Avatar sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: avatarColor || 'var(--t700)', fontSize: '11px', fontWeight: 700 }}>{name.charAt(0)}</Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--tx1)' }}>{name}</Typography>
      <Typography sx={{ fontSize: '11px', color: 'var(--tx3)', mt: '1px' }}>{subtitle}</Typography>
    </Box>
    {score && <Typography sx={{ fontSize: '16px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--t700)' }}>{score}</Typography>}
    {status && <StatusBadge status={status}>{status}</StatusBadge>}
    {onView && <Button size="small" variant="outlined" onClick={onView} sx={{ textTransform: 'none', fontSize: '11px' }}>View</Button>}
  </Box>
);

export const TimelineItem = ({ title, time, status, dotColor }) => (
  <Box sx={{ position: 'relative', mb: 2, pl: '20px' }}>
    <Box sx={{ position: 'absolute', left: '5px', top: '4px', width: '11px', height: '11px', borderRadius: '50%', border: '2.5px solid var(--surface)', boxShadow: '0 0 0 1.5px var(--border2)', background: dotColor || 'var(--t500)' }} />
    <Typography sx={{ fontSize: '12px', color: 'var(--tx2)', lineHeight: 1.5 }}>
      <strong style={{ color: 'var(--tx1)' }}>{title}</strong>
    </Typography>
    <Typography sx={{ fontSize: '10.5px', color: 'var(--tx3)', mt: '1px' }}>{time}</Typography>
    {status && <StatusBadge status={status} sx={{ mt: 0.5 }}>{status}</StatusBadge>}
  </Box>
);

export const NotificationItem = ({ title, description, time, dotColor }) => (
  <Box sx={{ display: 'flex', gap: '10px', padding: '9px 0', borderBottom: '1px solid var(--border)', '&:last-child': { borderBottom: 'none' } }}>
    <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor || 'var(--a500)', flexShrink: 0, mt: '4px' }} />
    <Box>
      <Typography sx={{ fontSize: '12.5px', color: 'var(--tx1)', lineHeight: 1.45 }}>{title}</Typography>
      {description && <Typography sx={{ fontSize: '10.5px', color: 'var(--tx3)', mt: '2px' }}>{description}</Typography>}
      <Typography sx={{ fontSize: '10.5px', color: 'var(--tx3)', mt: '2px' }}>{time}</Typography>
    </Box>
  </Box>
);

export const WeekPill = ({ week, status, isCurrent, onClick }) => {
  const getStyles = () => {
    if (isCurrent) return { bg: 'var(--t700)', color: '#fff', boxShadow: '0 2px 8px rgba(22,122,87,0.35)' };
    if (status === 'submitted') return { bg: 'var(--t100)', color: 'var(--t800)' };
    if (status === 'late') return { bg: 'var(--a100)', color: 'var(--a800)' };
    if (status === 'missed') return { bg: 'var(--danger-l)', color: 'var(--danger)' };
    return { bg: 'var(--surface2)', color: 'var(--tx3)', border: '1px solid var(--border)' };
  };
  const styles = getStyles();
  return (
    <Box
      onClick={onClick}
      sx={{
        aspectRatio: '1',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.15s ease',
        '&:hover': { transform: 'scale(1.1)' },
        ...styles,
      }}
    >
      {week}
    </Box>
  );
};