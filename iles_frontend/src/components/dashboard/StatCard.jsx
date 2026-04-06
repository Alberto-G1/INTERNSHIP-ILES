// frontend/src/components/dashboard/StatCard.jsx
//
// Supports BOTH prop APIs so no consumer needs changing:
//   Original: icon (Component), title, subtitle, color, actionLabel, onAction, progress, loading, trend
//   New:      icon (Element),   label, sub,      variant, actionLabel, onClick,  progress, loading, trend
//
import { Box, Typography, Skeleton } from '@mui/material';

/* ─── Design tokens ──────────────────────────────────────────── */
const T = {
  t900:'#0D3D2E',t800:'#155E44',t700:'#1A7A57',t600:'#22916A',
  t500:'#2DAF83',t400:'#45C99A',t200:'#A8EDDB',t100:'#D4F7EE',t50:'#EDFBF7',
  a700:'#C05500',a600:'#D96B0E',a500:'#F08C30',a400:'#F5A855',a100:'#FEF0DC',a50:'#FFF8EF',
  i700:'#2F3DAA',i600:'#3D51C8',i500:'#5569E0',i400:'#7389EA',i100:'#E0E5FB',i50:'#F0F3FF',
  danger:'#E84545',dangerL:'#FDEAEA',
  violet:'#7C3AED',violetL:'#EDE9FE',
  tx1:'#0D1020',tx2:'#3D4466',tx3:'#8A90B4',
  border:'rgba(55,65,120,0.08)',
  surface:'#FFFFFF',surface2:'#F6F7FC',
};

/* ── variant / color → design token set ──────────────────────── */
const VARIANT_MAP = {
  /* Named variants (new API) */
  teal:   { top: `linear-gradient(90deg,${T.t700},${T.t400})`, iconBg: T.t100, iconColor: T.t700 },
  amber:  { top: `linear-gradient(90deg,${T.a700},${T.a400})`, iconBg: T.a100, iconColor: T.a700 },
  indigo: { top: `linear-gradient(90deg,${T.i700},${T.i400})`, iconBg: T.i100, iconColor: T.i700 },
  danger: { top: 'linear-gradient(90deg,#C0392B,#EF4444)',      iconBg: T.dangerL, iconColor: T.danger },
  violet: { top: `linear-gradient(90deg,${T.violet},#A855F7)`,  iconBg: T.violetL, iconColor: T.violet },
  /* Original color prop aliases */
  primary: { top: `linear-gradient(90deg,${T.t700},${T.t400})`, iconBg: T.t100, iconColor: T.t700 },
  success: { top: `linear-gradient(90deg,${T.t700},${T.t400})`, iconBg: T.t100, iconColor: T.t700 },
  warning: { top: `linear-gradient(90deg,${T.a700},${T.a400})`, iconBg: T.a100, iconColor: T.a700 },
  info:    { top: `linear-gradient(90deg,${T.i700},${T.i400})`, iconBg: T.i100, iconColor: T.i700 },
  error:   { top: 'linear-gradient(90deg,#C0392B,#EF4444)',      iconBg: T.dangerL, iconColor: T.danger },
};

/* ─────────────────────────────────────────────────────────────── */
const StatCard = (props) => {
  const {
    /* icon can be either a React element (new API) or a component (original) */
    icon,
    /* title / label  — accept either */
    title,    label,
    /* subtitle / sub — accept either */
    subtitle, sub,
    /* color / variant — accept either */
    color = 'primary', variant,
    /* action handler — accept either */
    onAction, onClick,
    actionLabel,
    progress,
    loading = false,
    trend,
    trendValue,
    delay = 0,
  } = props;

  const displayLabel    = label    || title    || '';
  const displaySubtitle = sub      || subtitle || '';
  const handleClick     = onClick  || onAction;
  const colorKey        = variant  || color || 'primary';
  const c               = VARIANT_MAP[colorKey] || VARIANT_MAP.primary;

  /* Render icon — element or component */
  const renderIcon = () => {
    if (!icon) return null;
    /* If it's a React element (JSX already), render it directly */
    if (icon && typeof icon === 'object' && icon.$$typeof) return icon;
    /* If it's a component (function/class), instantiate it */
    const IconComp = icon;
    return <IconComp sx={{ fontSize: 17 }} />;
  };

  /* ── Loading skeleton ─────────────────────────────────────── */
  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: '14px',
          p: '18px 18px 16px',
          height: '100%',
          boxShadow: '0 1px 3px rgba(13,16,32,.05)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            borderRadius: '14px 14px 0 0',
            background: c.top,
          },
        }}
      >
        <Skeleton variant="rectangular" width={38} height={38}
          sx={{ borderRadius: '10px', mb: 2, bgcolor: c.iconBg }} />
        <Skeleton variant="text" width="55%" height={13} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="30%" height={34} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={12} />
      </Box>
    );
  }

  /* ── Card ────────────────────────────────────────────────── */
  return (
    <Box
      onClick={handleClick}
      sx={{
        bgcolor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: '14px',
        p: '18px 18px 16px',
        cursor: handleClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        boxShadow: '0 1px 3px rgba(13,16,32,.05), 0 4px 18px rgba(13,16,32,.06)',
        transition: 'transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1)',
        animation: `statFadeUp .5s ease ${delay}s both`,
        '@keyframes statFadeUp': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': handleClick ? {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 30px rgba(13,16,32,.10)',
        } : {},
        /* Coloured top stripe */
        '&::before': {
          content: '""',
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          borderRadius: '14px 14px 0 0',
          background: c.top,
        },
        /* Decorative background circle */
        '&::after': {
          content: '""',
          position: 'absolute', bottom: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: c.iconColor, opacity: 0.06,
          transition: 'opacity .25s',
        },
        '&:hover::after': handleClick ? { opacity: 0.10 } : {},
      }}
    >
      {/* Icon row + optional trend */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '14px' }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: '10px',
          bgcolor: c.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: c.iconColor, flexShrink: 0,
        }}>
          {renderIcon()}
        </Box>

        {/* Trend badge (both APIs) */}
        {(trend !== undefined || trendValue !== undefined) && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '3px',
            px: '8px', py: '3px', borderRadius: '6px',
            bgcolor: (trend ?? trendValue ?? 0) > 0 ? T.t50 : T.dangerL,
            color:   (trend ?? trendValue ?? 0) > 0 ? T.t700 : T.danger,
            fontSize: '11px', fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {(trend ?? trendValue ?? 0) > 0 ? '↑' : '↓'} {Math.abs(trend ?? trendValue ?? 0)}%
          </Box>
        )}
      </Box>

      {/* Label */}
      <Typography sx={{
        fontSize: '10.5px', fontWeight: 600, color: T.tx3,
        textTransform: 'uppercase', letterSpacing: '.6px', mb: '3px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {displayLabel}
      </Typography>

      {/* Value */}
      <Typography sx={{
        fontSize: '28px', fontWeight: 700, color: T.tx1,
        letterSpacing: '-1px', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {props.value}
      </Typography>

      {/* Subtitle */}
      {displaySubtitle && (
        <Typography sx={{
          fontSize: '11.5px', color: T.tx3, mt: '6px', lineHeight: 1.4,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {displaySubtitle}
        </Typography>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <Box sx={{ mt: '12px' }}>
          <Box sx={{
            height: '6px', borderRadius: '99px',
            bgcolor: T.surface2, border: `1px solid ${T.border}`,
            overflow: 'hidden',
          }}>
            <Box sx={{
              height: '100%', borderRadius: '99px',
              background: `linear-gradient(90deg,${c.iconColor},${c.iconColor}cc)`,
              width: `${Math.min(100, Math.max(0, progress))}%`,
              transition: 'width 1s cubic-bezier(.34,1.2,.64,1)',
            }} />
          </Box>
        </Box>
      )}

      {/* Action link */}
      {actionLabel && handleClick && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: '5px',
          mt: '14px', pt: '12px',
          borderTop: `1px solid ${T.border}`,
          color: c.iconColor,
          fontSize: '12px', fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          position: 'relative', zIndex: 1,
        }}>
          {actionLabel}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </Box>
      )}
    </Box>
  );
};

export default StatCard;