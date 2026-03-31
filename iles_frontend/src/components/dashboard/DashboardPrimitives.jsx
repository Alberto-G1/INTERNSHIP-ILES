import { Box, Typography, Button } from '@mui/material';

/* ══════════════════════════════════════
   INLINE SVG HELPERS
══════════════════════════════════════ */
export const ArrowRightSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ══════════════════════════════════════
   DASH GREETING HEADER
   greeting: string, name: string, sub: string, role: string
══════════════════════════════════════ */
export const DashGreeting = ({ greeting = 'Good morning', name = '', sub = '', roleTag = '', roleColor = 'var(--green-600)', roleBg = 'var(--green-50)' }) => (
  <Box
    sx={{
      mb: 4,
      pb: 3,
      borderBottom: '1px solid var(--gray-200)',
      display: 'flex',
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      flexDirection: { xs: 'column', sm: 'row' },
      gap: 2,
      animation: 'dashFadeUp 0.5s ease both',
      '@keyframes dashFadeUp': {
        from: { opacity: 0, transform: 'translateY(12px)' },
        to:   { opacity: 1, transform: 'translateY(0)' },
      },
    }}
  >
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <Typography
          sx={{
            fontSize: { xs: '22px', sm: '26px' },
            fontWeight: 700,
            color: 'var(--ink)',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}
        >
          {greeting}{name ? `, ${name}` : ''}.
        </Typography>
        {roleTag && (
          <Box
            sx={{
              display: 'inline-flex', alignItems: 'center',
              px: '10px', py: '3px',
              borderRadius: '99px',
              bgcolor: roleBg,
              border: `1px solid ${roleColor}30`,
              color: roleColor,
              fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap',
            }}
          >
            {roleTag}
          </Box>
        )}
      </Box>
      {sub && (
        <Typography sx={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: 1.5 }}>
          {sub}
        </Typography>
      )}
    </Box>

    {/* Date badge */}
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: '8px',
        px: '14px', py: '8px',
        borderRadius: '10px',
        border: '1px solid var(--gray-200)',
        bgcolor: 'var(--panel-bg)',
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <Typography sx={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 500 }}>
        {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
      </Typography>
    </Box>
  </Box>
);

/* ══════════════════════════════════════
   STAT CARD
   value, label, sub, icon, accentColor, accentBg, onClick, delay
══════════════════════════════════════ */
export const StatCard = ({
  value,
  label,
  sub,
  icon,
  accentColor = 'var(--green-700)',
  accentBg    = 'var(--green-50)',
  borderColor,
  onClick,
  delay       = 0,
  actionLabel,
  trend,        // { value: '+12%', up: true }
}) => (
  <Box
    onClick={onClick}
    sx={{
      bgcolor: 'var(--panel-bg)',
      border: `1px solid ${borderColor || 'var(--gray-200)'}`,
      borderRadius: '16px',
      p: '20px 22px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
      animation: `dashFadeUp 0.5s ease ${delay}s both`,
      position: 'relative',
      overflow: 'hidden',
      '@keyframes dashFadeUp': {
        from: { opacity: 0, transform: 'translateY(12px)' },
        to:   { opacity: 1, transform: 'translateY(0)' },
      },
      '&:hover': onClick ? {
        boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
        transform: 'translateY(-2px)',
        borderColor: accentColor + '60',
      } : {},
      /* subtle top accent line */
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0, left: '20px', right: '20px',
        height: '2px',
        borderRadius: '0 0 2px 2px',
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
        opacity: 0.6,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
      {/* Icon bubble */}
      <Box
        sx={{
          width: 44, height: 44, borderRadius: '12px',
          bgcolor: accentBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor, flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      {/* Trend badge */}
      {trend && (
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: '4px',
            px: '8px', py: '3px', borderRadius: '6px',
            bgcolor: trend.up ? 'var(--green-50)' : 'var(--coral-100)',
            color: trend.up ? 'var(--green-700)' : 'var(--coral-700)',
            fontSize: '11px', fontWeight: 600,
          }}
        >
          {trend.up ? '↑' : '↓'} {trend.value}
        </Box>
      )}
    </Box>

    <Typography
      sx={{
        fontSize: '32px', fontWeight: 700,
        color: 'var(--ink)', lineHeight: 1,
        letterSpacing: '-1px', mb: '6px',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </Typography>

    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', mb: '2px' }}>
      {label}
    </Typography>

    {sub && (
      <Typography sx={{ fontSize: '12px', color: 'var(--gray-500)', lineHeight: 1.4 }}>
        {sub}
      </Typography>
    )}

    {actionLabel && onClick && (
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: '5px',
          mt: 2, pt: 2,
          borderTop: '1px solid var(--gray-200)',
          color: accentColor, fontSize: '12px', fontWeight: 500,
        }}
      >
        {actionLabel} <ArrowRightSVG />
      </Box>
    )}
  </Box>
);

/* ══════════════════════════════════════
   SECTION CARD  (generic panel wrapper)
══════════════════════════════════════ */
export const SectionCard = ({ title, subtitle, icon, children, action, delay = 0, noPad = false }) => (
  <Box
    sx={{
      bgcolor: 'var(--panel-bg)',
      border: '1px solid var(--gray-200)',
      borderRadius: '16px',
      overflow: 'hidden',
      animation: `dashFadeUp 0.5s ease ${delay}s both`,
      '@keyframes dashFadeUp': {
        from: { opacity: 0, transform: 'translateY(12px)' },
        to:   { opacity: 1, transform: 'translateY(0)' },
      },
    }}
  >
    {/* Card header */}
    {(title || icon) && (
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: '22px', py: '16px',
          borderBottom: '1px solid var(--gray-200)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon && (
            <Box
              sx={{
                width: 32, height: 32, borderRadius: '8px',
                bgcolor: 'var(--gray-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gray-500)',
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ fontSize: '11.5px', color: 'var(--gray-500)' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {action}
      </Box>
    )}
    <Box sx={noPad ? {} : { p: '20px 22px' }}>
      {children}
    </Box>
  </Box>
);

/* ══════════════════════════════════════
   PROGRESS ROW  (label + bar + value)
══════════════════════════════════════ */
export const ProgressRow = ({ label, value = 0, color = 'var(--green-600)', count, total, delay = 0 }) => (
  <Box sx={{ mb: 2.5, animation: `dashFadeUp 0.5s ease ${delay}s both`, '@keyframes dashFadeUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '6px' }}>
      <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--gray-700)' }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {(count !== undefined || total !== undefined) && (
          <Typography sx={{ fontSize: '12px', color: 'var(--gray-500)' }}>
            {count ?? 0}{total !== undefined ? ` / ${total}` : ''}
          </Typography>
        )}
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{value}%</Typography>
      </Box>
    </Box>
    <Box sx={{ height: '6px', borderRadius: '99px', bgcolor: 'var(--gray-200)', overflow: 'hidden' }}>
      <Box
        sx={{
          height: '100%', borderRadius: '99px',
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          width: `${value}%`,
          transition: 'width 0.8s cubic-bezier(0.34,1.2,0.64,1)',
        }}
      />
    </Box>
  </Box>
);

/* ══════════════════════════════════════
   MINI STAT PILL  (for system overview rows)
══════════════════════════════════════ */
export const MiniStat = ({ value, label, color = 'var(--ink)', bg = 'var(--gray-50)', delay = 0 }) => (
  <Box
    sx={{
      textAlign: 'center', p: '16px 8px',
      borderRadius: '12px', bgcolor: bg,
      border: '1px solid var(--gray-200)',
      animation: `dashFadeUp 0.5s ease ${delay}s both`,
      '@keyframes dashFadeUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    }}
  >
    <Typography sx={{ fontSize: '24px', fontWeight: 700, color, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: '11px', color: 'var(--gray-500)', mt: '4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </Typography>
  </Box>
);

/* ══════════════════════════════════════
   QUICK ACTION BUTTON
══════════════════════════════════════ */
export const QuickBtn = ({ label, icon, onClick, color = 'var(--green-700)', bg = 'var(--green-50)', border = 'var(--green-200)' }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      px: '14px', py: '9px',
      borderRadius: '10px',
      border: `1.5px solid ${border}`,
      bgcolor: bg, color,
      fontFamily: 'inherit', fontSize: '13px', fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.18s',
      whiteSpace: 'nowrap',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 12px ${color}25`,
        borderColor: color,
      },
      '&:active': { transform: 'translateY(0)' },
    }}
  >
    {icon}
    {label}
  </Box>
);

/* ══════════════════════════════════════
   INFO ROW  (label: value pairs)
══════════════════════════════════════ */
export const InfoRow = ({ label, value, emptyText = 'Not set', icon }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', gap: '12px',
      py: '11px',
      borderBottom: '1px solid var(--gray-200)',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    {icon && (
      <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', flexShrink: 0 }}>
        {icon}
      </Box>
    )}
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, mb: '1px' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '13.5px', fontWeight: value ? 500 : 400, color: value ? 'var(--ink)' : 'var(--gray-400)', fontStyle: value ? 'normal' : 'italic' }}>
        {value || emptyText}
      </Typography>
    </Box>
  </Box>
);

/* ══════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════ */
export const StatusBadge = ({ status }) => {
  const map = {
    pending:   { color: 'var(--amber-600)',  bg: 'var(--amber-50)',  label: 'Pending' },
    approved:  { color: 'var(--green-700)',  bg: 'var(--green-50)',  label: 'Approved' },
    rejected:  { color: 'var(--coral-700)',  bg: 'var(--coral-50)',  label: 'Rejected' },
    active:    { color: 'var(--green-700)',  bg: 'var(--green-50)',  label: 'Active' },
    completed: { color: 'var(--blue-700)',   bg: 'var(--blue-50)',   label: 'Completed' },
  };
  const s = map[status?.toLowerCase()] || map.pending;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px', px: '9px', py: '3px', borderRadius: '6px', bgcolor: s.bg, color: s.color, fontSize: '11.5px', fontWeight: 600 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
      {s.label}
    </Box>
  );
};