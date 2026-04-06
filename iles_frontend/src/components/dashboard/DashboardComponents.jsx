// frontend/src/components/Dashboard/DashboardComponents.jsx
// Shared primitive components for all dashboard pages — styled to match AILES design system
import { Box, Typography, Button } from '@mui/material';

/* ─── Design tokens (mirrored from styles_base.txt) ─────────────── */
export const T = {
  t900:'var(--t900)',t800:'var(--t800)',t700:'var(--t700)',t600:'var(--t600)',
  t500:'var(--t500)',t400:'var(--t400)',t300:'var(--t300)',t200:'var(--t200)',t100:'var(--t100)',t50:'var(--t50)',
  a700:'var(--a700)',a600:'var(--a600)',a500:'var(--a500)',a400:'var(--a400)',a300:'var(--a300)',a100:'var(--a100)',a50:'var(--a50)',
  i700:'var(--i700)',i600:'var(--i600)',i500:'var(--i500)',i400:'var(--i400)',i200:'var(--i200)',i100:'var(--i100)',i50:'var(--i50)',
  danger:'var(--danger)',dangerL:'var(--danger-l)',
  violet:'var(--violet)',violetL:'var(--violet-l)',
  tx1:'var(--tx1)',tx2:'var(--tx2)',tx3:'var(--tx3)',
  border:'var(--border)',border2:'var(--border2)',
  surface:'var(--surface)',surface2:'var(--surface2)',bg:'var(--bg)',
};

/* ══════════════════════════════════════
   ARROW RIGHT ICON
══════════════════════════════════════ */
export const ArrowRightSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ══════════════════════════════════════
   DASH GREETING HEADER
   Per-role gradient backgrounds from styles_base greeting variants:
   admin     → linear-gradient(135deg, #0F1635, #1A2D5A, #162840)
   workplace → linear-gradient(135deg, #1A1050, #2C1A6E, #1A2A5E)
   academic  → linear-gradient(135deg, #2A0A5E, #1A1050, #0F1635)
   student   → linear-gradient(135deg, #0A2B1A, #0F3522, #0A2520)
══════════════════════════════════════ */
const GREETING_GRADIENTS = {
  admin:                'linear-gradient(135deg, #0F1635 0%, #1A2D5A 50%, #162840 100%)',
  workplace_supervisor: 'linear-gradient(135deg, #1A1050 0%, #2C1A6E 50%, #1A2A5E 100%)',
  academic_supervisor:  'linear-gradient(135deg, #2A0A5E 0%, #1A1050 50%, #0F1635 100%)',
  student:              'linear-gradient(135deg, #0A2B1A 0%, #0F3522 50%, #0A2520 100%)',
};

const GREETING_OVERLAYS = {
  admin:
    'radial-gradient(ellipse 280px 180px at 80% 50%, rgba(45,175,131,0.15) 0%, transparent 60%), radial-gradient(ellipse 200px 200px at 20% 80%, rgba(85,105,224,0.12) 0%, transparent 60%)',
  workplace_supervisor:
    'radial-gradient(ellipse 280px 200px at 90% 40%, rgba(85,105,224,0.20) 0%, transparent 60%), radial-gradient(ellipse 200px 180px at 10% 80%, rgba(45,175,131,0.10) 0%, transparent 60%)',
  academic_supervisor:
    'radial-gradient(ellipse 260px 180px at 85% 45%, rgba(124,58,237,0.20) 0%, transparent 60%), radial-gradient(ellipse 220px 200px at 15% 70%, rgba(240,140,48,0.10) 0%, transparent 60%)',
  student:
    'radial-gradient(ellipse 280px 200px at 85% 40%, rgba(45,175,131,0.18) 0%, transparent 60%), radial-gradient(ellipse 200px 180px at 15% 80%, rgba(240,140,48,0.08) 0%, transparent 60%)',
};

export const DashGreeting = ({
  greeting = 'Good morning',
  name = '',
  sub = '',
  roleTag = '',
  roleColor = T.t400,
  role = 'admin',
  stats = [],  // [{ num, label }]
}) => (
  <Box
    sx={{
      borderRadius: '20px',
      p: { xs: '24px 22px', sm: '28px 32px' },
      mb: '22px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
      position: 'relative', overflow: 'hidden', color: '#fff',
      background: GREETING_GRADIENTS[role] || GREETING_GRADIENTS.admin,
      animation: 'dashFadeUp 0.5s ease both',
      '@keyframes dashFadeUp': {
        from: { opacity: 0, transform: 'translateY(12px)' },
        to:   { opacity: 1, transform: 'translateY(0)' },
      },
      '&::before': {
        content: '""', position: 'absolute', inset: 0, pointerEvents: 'none',
        background: GREETING_OVERLAYS[role] || GREETING_OVERLAYS.admin,
      },
    }}
  >
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Eye-row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '6px' }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22C55E', animation: 'pulseDot 2s ease-in-out infinite', '@keyframes pulseDot': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.4, transform: 'scale(0.8)' } } }} />
        <Typography sx={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', color: T.t300, fontFamily: "'DM Sans', sans-serif" }}>
          {roleTag}
        </Typography>
      </Box>

      {/* Main greeting */}
      <Typography
        sx={{
          fontFamily: "'Fraunces', serif",
          fontSize: { xs: '20px', sm: '27px' },
          fontWeight: 700, lineHeight: 1.15, mb: '6px', color: '#fff',
        }}
      >
        {greeting}{name ? `, ${name}` : ''}.
      </Typography>

      {sub && (
        <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, maxWidth: 440, fontFamily: "'DM Sans', sans-serif" }}>
          {sub}
        </Typography>
      )}

      {/* Inline stats */}
      {stats.length > 0 && (
        <Box sx={{ display: 'flex', gap: '24px', mt: '18px', flexWrap: 'wrap' }}>
          {stats.map((s, i) => (
            <Box key={i}>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: i === 0 ? '#fff' : i === 1 ? T.t300 : i === 2 ? T.a300 : '#fff', fontFamily: "'DM Sans', sans-serif" }}>
                {s.num}
              </Typography>
              <Typography sx={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.8px', mt: '2px', color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif" }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>

    {/* Decorative SVG art */}
    <Box sx={{ flexShrink: 0, position: 'relative', zIndex: 1, display: { xs: 'none', sm: 'block' } }}>
      <svg viewBox="0 0 80 80" fill="none" width={80} height={80}>
        <circle cx="40" cy="40" r="36" stroke="rgba(45,175,131,0.4)" strokeWidth="1"/>
        <circle cx="40" cy="40" r="26" stroke="rgba(85,105,224,0.3)" strokeWidth="1"/>
        <circle cx="40" cy="40" r="16" fill="rgba(45,175,131,0.15)"/>
        <path d="M40 4v72M4 40h72" stroke="rgba(45,175,131,0.2)" strokeWidth="1"/>
        <path d="M40 4A36 36 0 0176 40" stroke="rgba(45,175,131,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </Box>
  </Box>
);

/* ══════════════════════════════════════
   STAT / METRIC CARD
   Matches .metric design token classes
══════════════════════════════════════ */
const METRIC_COLORS = {
  teal:   { top: `linear-gradient(90deg, ${T.t700}, ${T.t400})`, bg: T.surface, icon: T.t100, iconColor: T.t700 },
  amber:  { top: `linear-gradient(90deg, ${T.a700}, ${T.a400})`, bg: T.surface, icon: T.a100, iconColor: T.a700 },
  indigo: { top: `linear-gradient(90deg, ${T.i700}, ${T.i400})`, bg: T.surface, icon: T.i100, iconColor: T.i700 },
  danger: { top: 'linear-gradient(90deg, #C0392B, #EF4444)',      bg: T.surface, icon: T.dangerL, iconColor: T.danger },
  violet: { top: `linear-gradient(90deg, ${T.violet}, #A855F7)`,  bg: T.surface, icon: T.violetL, iconColor: T.violet },
};

export const StatCard = ({
  value, label, sub, icon,
  variant = 'teal',   // teal | amber | indigo | danger | violet
  accentColor,
  accentBg,
  borderColor,
  onClick,
  delay = 0,
  actionLabel,
  trend,
  loading = false,
}) => {
  const c = METRIC_COLORS[variant] || METRIC_COLORS.teal;
  const topGradient = c.top;
  const iconBg = accentBg || c.icon;
  const iconCol = accentColor || c.iconColor;

  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: T.surface,
        border: `1px solid ${borderColor || T.border}`,
        borderRadius: '14px',
        p: '18px 18px 16px',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(13,16,32,.05), 0 4px 18px rgba(13,16,32,.06)',
        transition: 'transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1)',
        animation: `dashFadeUp 0.5s ease ${delay}s both`,
        '@keyframes dashFadeUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        '&:hover': onClick ? { transform: 'translateY(-3px)', boxShadow: '0 8px 30px rgba(13,16,32,.10)' } : {},
        /* Top accent stripe */
        '&::before': {
          content: '""',
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          borderRadius: '14px 14px 0 0',
          background: topGradient,
        },
        /* Decorative circle */
        '&::after': {
          content: '""',
          position: 'absolute', bottom: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: iconCol, opacity: 0.06,
          transition: 'opacity .25s',
        },
        '&:hover::after': onClick ? { opacity: 0.10 } : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '14px' }}>
        {/* Icon */}
        <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconCol, flexShrink: 0 }}>
          {icon}
        </Box>
        {/* Trend badge */}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', px: '8px', py: '3px', borderRadius: '6px', bgcolor: trend.up ? T.t50 : T.dangerL, color: trend.up ? T.t700 : T.danger, fontSize: '11px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </Box>
        )}
      </Box>

      {/* Label above value */}
      <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: T.tx3, textTransform: 'uppercase', letterSpacing: '.6px', mb: '3px', fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </Typography>

      <Typography sx={{ fontSize: '28px', fontWeight: 700, color: T.tx1, letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>
        {loading ? '—' : value}
      </Typography>

      {sub && (
        <Typography sx={{ fontSize: '11.5px', color: T.tx3, mt: '6px', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '3px', fontFamily: "'DM Sans', sans-serif" }}>
          {sub}
        </Typography>
      )}

      {actionLabel && onClick && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '14px', pt: '12px', borderTop: `1px solid ${T.border}`, color: iconCol, fontSize: '12px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
          {actionLabel} <ArrowRightSVG />
        </Box>
      )}
    </Box>
  );
};

/* ══════════════════════════════════════
   SECTION / PANEL CARD
══════════════════════════════════════ */
export const SectionCard = ({ title, subtitle, icon, children, action, delay = 0, noPad = false }) => (
  <Box
    sx={{
      bgcolor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(13,16,32,.05), 0 4px 18px rgba(13,16,32,.06)',
      animation: `dashFadeUp 0.5s ease ${delay}s both`,
      '@keyframes dashFadeUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    }}
  >
    {(title || icon) && (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '18px', py: '14px', borderBottom: `1px solid ${T.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon && (
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.tx3 }}>
              {icon}
            </Box>
          )}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: T.tx1, lineHeight: 1.2, fontFamily: "'DM Sans', sans-serif" }}>{title}</Typography>
            {subtitle && <Typography sx={{ fontSize: '11.5px', color: T.tx3, fontFamily: "'DM Sans', sans-serif" }}>{subtitle}</Typography>}
          </Box>
        </Box>
        {action}
      </Box>
    )}
    <Box sx={noPad ? {} : { p: '14px 18px' }}>{children}</Box>
  </Box>
);

/* ══════════════════════════════════════
   PROGRESS ROW
══════════════════════════════════════ */
export const ProgressRow = ({ label, value = 0, color = T.t600, count, total, delay = 0 }) => (
  <Box sx={{ mb: '12px', '&:last-child': { mb: 0 } }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '5px' }}>
      <Typography sx={{ fontSize: '12px', fontWeight: 500, color: T.tx2, fontFamily: "'DM Sans', sans-serif" }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {(count !== undefined || total !== undefined) && (
          <Typography sx={{ fontSize: '12px', color: T.tx3, fontFamily: "'DM Sans', sans-serif" }}>
            {count ?? 0}{total !== undefined ? ` / ${total}` : ''}
          </Typography>
        )}
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: T.tx1, fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{value}%</Typography>
      </Box>
    </Box>
    <Box sx={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '99px', height: '7px', overflow: 'hidden' }}>
      <Box sx={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${color}, ${color}cc)`, width: `${value}%`, transition: 'width 1s cubic-bezier(.34,1.2,.64,1)' }} />
    </Box>
  </Box>
);

/* ══════════════════════════════════════
   MINI STAT PILL
══════════════════════════════════════ */
export const MiniStat = ({ value, label, color = T.tx1, bg = T.surface2, delay = 0 }) => (
  <Box sx={{ textAlign: 'center', p: '16px 8px', borderRadius: '12px', bgcolor: bg, border: `1px solid ${T.border}`, animation: `dashFadeUp 0.5s ease ${delay}s both`, '@keyframes dashFadeUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
    <Typography sx={{ fontSize: '24px', fontWeight: 700, color, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>{value}</Typography>
    <Typography sx={{ fontSize: '11px', color: T.tx3, mt: '4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'DM Sans', sans-serif" }}>{label}</Typography>
  </Box>
);

/* ══════════════════════════════════════
   QUICK ACTION BUTTON
══════════════════════════════════════ */
export const QuickBtn = ({ label, icon, onClick, color = T.t700, bg = T.t50, border = T.t200 }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      px: '14px', py: '9px', borderRadius: '10px',
      border: `1.5px solid ${border}`, bgcolor: bg, color,
      fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500,
      cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
      '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${color}25`, borderColor: color },
      '&:active': { transform: 'translateY(0)' },
    }}
  >
    {icon}{label}
  </Box>
);

/* ══════════════════════════════════════
   INFO ROW (label: value pairs)
══════════════════════════════════════ */
export const InfoRow = ({ label, value, emptyText = 'Not set', icon }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', py: '11px', borderBottom: `1px solid ${T.border}`, '&:last-child': { borderBottom: 'none' } }}>
    {icon && <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.tx3, flexShrink: 0 }}>{icon}</Box>}
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: '11px', color: T.tx3, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, mb: '1px', fontFamily: "'DM Sans', sans-serif" }}>{label}</Typography>
      <Typography sx={{ fontSize: '13.5px', fontWeight: value ? 500 : 400, color: value ? T.tx1 : T.tx3, fontStyle: value ? 'normal' : 'italic', fontFamily: "'DM Sans', sans-serif" }}>{value || emptyText}</Typography>
    </Box>
  </Box>
);

/* ══════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════ */
export const StatusBadge = ({ status }) => {
  const map = {
    pending:   { color: T.a700, bg: T.a100, label: 'Pending' },
    approved:  { color: T.t700, bg: T.t100, label: 'Approved' },
    rejected:  { color: T.danger, bg: T.dangerL, label: 'Rejected' },
    active:    { color: T.t700, bg: T.t100, label: 'Active' },
    completed: { color: T.i700, bg: T.i100, label: 'Completed' },
  };
  const s = map[status?.toLowerCase()] || map.pending;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px', px: '9px', py: '3px', borderRadius: '99px', bgcolor: s.bg, color: s.color, fontSize: '10.5px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
      {s.label}
    </Box>
  );
};