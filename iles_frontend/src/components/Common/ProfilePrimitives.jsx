/**
 * ProfilePrimitives.jsx
 * Shared design primitives for all role Profile pages.
 * Faithfully ports the HTML profile design system into React/MUI-compatible components.
 * Uses CSS variables from index.css — no MUI theme overrides needed here.
 */
import { Box, Typography } from '@mui/material';

/* ══════════════════════════════════════
   KEYFRAME INJECTION
   Injects CSS animations once into <head>
══════════════════════════════════════ */
const ANIM_STYLE_ID = 'ailes-profile-animations';
if (typeof document !== 'undefined' && !document.getElementById(ANIM_STYLE_ID)) {
  const s = document.createElement('style');
  s.id = ANIM_STYLE_ID;
  s.textContent = `
    @keyframes profSlideUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
    @keyframes profSlideLeft { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
    @keyframes profFadeIn    { from { opacity:0; } to { opacity:1; } }
    @keyframes profCountPop  { 0% { transform:scale(.7);opacity:0; } 70% { transform:scale(1.08); } 100% { transform:scale(1);opacity:1; } }
    @keyframes profShimmer   { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    @keyframes profFloatUp   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
    @keyframes profGlowPulse { 0%,100% { box-shadow:0 0 0 0 rgba(45,175,131,0); } 50% { box-shadow:0 0 0 6px rgba(45,175,131,0.10); } }
    @keyframes profPulseDot  { 0%,100% { opacity:1; } 50% { opacity:.35; } }
    @keyframes profLineGrow  { from { width:0; } to { width:100%; } }
    @keyframes profFdIn      { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes profChipIn    { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
  `;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════
   COLOR CONFIG  per section variant
══════════════════════════════════════ */
export const SECTION_COLORS = {
  teal: {
    headGrad:    'linear-gradient(110deg, rgba(69,201,154,0.055) 0%, transparent 60%)',
    headOrb:     'rgba(69,201,154,0.06)',
    iconBg:      'var(--t100)',
    iconColor:   'var(--t700)',
    labelColor:  'var(--t600)',
    labelDot:    'var(--t500)',
    numColor:    'var(--t700)',
    shimmer:     'linear-gradient(90deg, transparent, rgba(45,175,131,0.40), transparent)',
    barColor:    'var(--t400)',
    borderFd:    'var(--t400)',
  },
  amber: {
    headGrad:    'linear-gradient(110deg, rgba(245,168,85,0.055) 0%, transparent 60%)',
    headOrb:     'rgba(240,140,48,0.06)',
    iconBg:      'var(--a100)',
    iconColor:   'var(--a700)',
    labelColor:  'var(--a600)',
    labelDot:    'var(--a500)',
    numColor:    'var(--a700)',
    shimmer:     'linear-gradient(90deg, transparent, rgba(240,140,48,0.40), transparent)',
    barColor:    'var(--a400)',
    borderFd:    'var(--a400)',
  },
  indigo: {
    headGrad:    'linear-gradient(110deg, rgba(115,137,234,0.055) 0%, transparent 60%)',
    headOrb:     'rgba(85,105,224,0.06)',
    iconBg:      'var(--i100)',
    iconColor:   'var(--i700)',
    labelColor:  'var(--i600)',
    labelDot:    'var(--i500)',
    numColor:    'var(--i700)',
    shimmer:     'linear-gradient(90deg, transparent, rgba(85,105,224,0.40), transparent)',
    barColor:    'var(--i400)',
    borderFd:    'var(--i400)',
  },
  violet: {
    headGrad:    'linear-gradient(110deg, rgba(168,85,247,0.055) 0%, transparent 60%)',
    headOrb:     'rgba(124,58,237,0.06)',
    iconBg:      'var(--violet-l)',
    iconColor:   'var(--violet)',
    labelColor:  'var(--violet)',
    labelDot:    'var(--violet)',
    numColor:    'var(--violet)',
    shimmer:     'linear-gradient(90deg, transparent, rgba(124,58,237,0.40), transparent)',
    barColor:    'var(--violet)',
    borderFd:    'var(--violet)',
  },
  danger: {
    headGrad:    'linear-gradient(110deg, rgba(232,69,69,0.055) 0%, transparent 60%)',
    headOrb:     'rgba(232,69,69,0.06)',
    iconBg:      'var(--danger-l)',
    iconColor:   'var(--danger)',
    labelColor:  'var(--danger)',
    labelDot:    'var(--danger)',
    numColor:    'var(--danger)',
    shimmer:     'linear-gradient(90deg, transparent, rgba(232,69,69,0.40), transparent)',
    barColor:    'var(--danger)',
    borderFd:    'var(--danger)',
  },
};

/* ══════════════════════════════════════
   INFO BLOCK  (section wrapper)
   variant: 'teal' | 'amber' | 'indigo' | 'violet' | 'danger'
   num: '01' | '02' etc.
   title, subtitle, icon: JSX, delay (s)
══════════════════════════════════════ */
export const InfoBlock = ({ variant = 'teal', num, title, subtitle, icon, children, delay = 0 }) => {
  const c = SECTION_COLORS[variant] || SECTION_COLORS.teal;

  return (
    <Box
      sx={{
        bgcolor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        overflow: 'hidden',
        mb: 2.5,
        boxShadow: 'var(--sh)',
        position: 'relative',
        zIndex: 1,
        opacity: 0,
        animation: `profSlideUp .5s cubic-bezier(.4,0,.2,1) ${delay}s forwards`,
        transition: 'box-shadow .3s, transform .3s',
        '&:hover': {
          boxShadow: 'var(--shl)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: '24px',
          pt: '18px',
          pb: '16px',
          position: 'relative',
          overflow: 'hidden',
          /* gradient band */
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: c.headGrad,
            opacity: 1,
            pointerEvents: 'none',
          },
          /* glow orb top-right */
          '&::after': {
            content: '""',
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            bgcolor: c.headOrb,
            opacity: 1,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Left: icon + text */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 40, height: 40,
              borderRadius: '12px',
              bgcolor: c.iconBg,
              color: c.iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              animation: 'profFloatUp 3s ease-in-out infinite',
              transition: 'transform .3s',
              '.MuiBox-root:hover &': { animation: 'none', transform: 'scale(1.1)' },
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx1)', letterSpacing: '-.2px' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ fontSize: '11px', color: 'var(--tx3)', mt: '2px' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Section number */}
        {num && (
          <Typography
            sx={{
              position: 'relative',
              zIndex: 1,
              fontFamily: "'Fraunces', 'Georgia', serif",
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-1px',
              color: c.numColor,
              opacity: 0.12,
              userSelect: 'none',
              animation: 'profCountPop .6s cubic-bezier(.34,1.56,.64,1) backwards',
            }}
          >
            {num}
          </Typography>
        )}
      </Box>

      {/* Shimmer divider */}
      <Box sx={{ height: '1px', mx: '24px', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, var(--border2) 30%, var(--border2) 70%, transparent)' }} />
        <Box sx={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: c.shimmer, animation: 'profShimmer 3s ease-in-out infinite' }} />
      </Box>

      {/* Body */}
      <Box sx={{ p: '22px 24px 24px' }}>
        {children}
      </Box>
    </Box>
  );
};

/* ══════════════════════════════════════
   FIELD GRID  (responsive field layout)
   cols: 1 | 2 | 3 | 4  (default auto)
══════════════════════════════════════ */
export const FieldGrid = ({ cols = 4, children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: cols >= 2 ? 'repeat(2, 1fr)' : '1fr',
        md: `repeat(${Math.min(cols, 4)}, 1fr)`,
      },
      gap: '16px 24px',
    }}
  >
    {children}
  </Box>
);

/* ══════════════════════════════════════
   FIELD CARD  (individual data cell)
   label, value, mono, empty, wide, full
   variant inherited from parent InfoBlock context via prop
══════════════════════════════════════ */
export const FieldCard = ({ label, value, mono = false, wide = false, full = false, variant = 'teal', delay = 0 }) => {
  const c = SECTION_COLORS[variant] || SECTION_COLORS.teal;
  const isEmpty = !value || value === 'N/A' || value === '—' || value === '';

  return (
    <Box
      sx={{
        gridColumn: full ? '1 / -1' : wide ? 'span 2' : 'span 1',
        position: 'relative',
        bgcolor: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        p: '12px 14px 11px',
        overflow: 'hidden',
        opacity: 0,
        animation: `profFdIn .4s cubic-bezier(.4,0,.2,1) ${delay}s forwards`,
        transition: 'border-color .2s, background .2s, box-shadow .2s',
        /* animated bottom accent bar */
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0, left: 0,
          height: '2px',
          width: 0,
          borderRadius: '0 0 12px 12px',
          background: c.barColor,
          transition: 'width .4s cubic-bezier(.4,0,.2,1)',
        },
        '.info-block-hover &::before, &:hover::before': { width: '100%' },
        '&:hover': {
          borderColor: 'var(--border2)',
          bgcolor: 'var(--surface)',
          boxShadow: '0 2px 12px rgba(13,16,32,.06)',
        },
      }}
    >
      {/* Label */}
      <Box
        sx={{
          fontSize: '9.5px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          mb: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          color: c.labelColor,
          /* tiny dot */
          '&::before': {
            content: '""',
            width: '5px', height: '5px',
            borderRadius: '50%',
            background: c.labelDot,
            flexShrink: 0,
            opacity: 0.5,
          },
        }}
      >
        {label}
      </Box>

      {/* Value */}
      <Typography
        sx={{
          fontSize: isEmpty ? '13px' : (mono ? '12.5px' : '14px'),
          fontWeight: isEmpty ? 400 : 600,
          color: isEmpty ? 'var(--tx3)' : 'var(--tx1)',
          fontStyle: isEmpty ? 'italic' : 'normal',
          fontFamily: mono ? "'SFMono-Regular', Consolas, monospace" : 'inherit',
          letterSpacing: mono ? '.3px' : 0,
          lineHeight: 1.35,
          wordBreak: 'break-word',
        }}
      >
        {isEmpty ? '—' : value}
      </Typography>
    </Box>
  );
};

/* ══════════════════════════════════════
   SECTION STACK  (vertical connector)
══════════════════════════════════════ */
export const SectionStack = ({ children }) => (
  <Box
    sx={{
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: '36px',
        top: 0, bottom: 0,
        width: '1px',
        background: 'linear-gradient(180deg, transparent 0%, var(--border2) 10%, var(--border2) 90%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      },
    }}
  >
    {children}
  </Box>
);

/* ══════════════════════════════════════
   PROFILE HERO
   Props: bannerGradient, avatarGradient, initials,
          name, role, chips (array of JSX), completionPct,
          completionColor, hintColor, hintText, actions
══════════════════════════════════════ */
export const ProfileHero = ({
  bannerGradient,
  avatarGradient,
  initials,
  avatarSrc,
  name,
  role,
  bannerTitle,
  bannerSubtitle,
  showIdentityInBody = true,
  chips = [],
  completionPct = 0,
  completionColor = 'linear-gradient(90deg, var(--t700), var(--t400))',
  completionPctColor = 'var(--tx1)',
  hintColor = 'var(--a700)',
  hintText,
  actions,
  decorCircles = [],
  delay = 0,
}) => (
  <Box
    sx={{
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
      mb: 3.5,
      boxShadow: 'var(--shl)',
      opacity: 0,
      animation: `profSlideUp .5s cubic-bezier(.4,0,.2,1) ${delay}s forwards`,
    }}
  >
    {/* Banner */}
    <Box
      sx={{
        height: '148px',
        position: 'relative',
        background: bannerGradient,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          opacity: .5,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 12px)',
        },
      }}
    >
      {(bannerTitle || bannerSubtitle) && (
        <Box
          sx={{
            position: 'absolute',
            left: '32px',
            bottom: '18px',
            zIndex: 2,
            maxWidth: '70%',
          }}
        >
          {bannerTitle && (
            <Typography sx={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '24px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.4px', lineHeight: 1.08 }}>
              {bannerTitle}
            </Typography>
          )}
          {bannerSubtitle && (
            <Typography sx={{ mt: '4px', fontSize: '12.5px', color: 'rgba(255,255,255,0.8)' }}>
              {bannerSubtitle}
            </Typography>
          )}
        </Box>
      )}
      {decorCircles.map((circle, i) => (
        <Box key={i} sx={{ position: 'absolute', borderRadius: '50%', border: '1px solid', pointerEvents: 'none', ...circle }} />
      ))}
    </Box>

    {/* Body */}
    <Box
      sx={{
        bgcolor: 'var(--surface)',
        px: '32px',
        pb: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
      }}
    >
      {/* Avatar + name */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '18px', mt: '-36px', position: 'relative', zIndex: 2 }}>
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          {avatarSrc ? (
            <Box
              component="img"
              src={avatarSrc}
              alt={name}
              sx={{
                width: 88, height: 88,
                borderRadius: '22px',
                objectFit: 'cover',
                border: '4px solid var(--surface)',
                boxShadow: 'var(--shl)',
              }}
            />
          ) : (
            <Box
              sx={{
                width: 88, height: 88,
                borderRadius: '22px',
                background: avatarGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', fontWeight: 700, color: '#fff',
                border: '4px solid var(--surface)',
                boxShadow: 'var(--shl)',
              }}
            >
              {initials}
            </Box>
          )}
          {/* Online dot */}
          <Box sx={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', bgcolor: '#22C55E', border: '3px solid var(--surface)', animation: 'profPulseDot 2.5s ease-in-out infinite' }} />
        </Box>

        {showIdentityInBody && (
          <Box sx={{ pb: '4px' }}>
            <Typography sx={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '22px', fontWeight: 700, color: 'var(--tx1)', letterSpacing: '-.3px', lineHeight: 1.1 }}>
              {name}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: 'var(--tx3)', mt: '3px' }}>{role}</Typography>
            {chips.length > 0 && (
              <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap', mt: '8px' }}>
                {chips}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Actions */}
      {actions && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', pt: '16px', flexShrink: 0 }}>
          {actions}
        </Box>
      )}
    </Box>

    {/* Completion bar */}
    <Box
      sx={{
        bgcolor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        px: '32px',
        py: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'var(--tx2)', whiteSpace: 'nowrap' }}>
        Profile Completion
      </Typography>
      <Box sx={{ flex: 1, height: '7px', bgcolor: 'var(--surface2)', borderRadius: '99px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <Box sx={{ height: '100%', borderRadius: '99px', background: completionColor, width: `${completionPct}%`, transition: 'width 1.2s cubic-bezier(.4,0,.2,1)' }} />
      </Box>
      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: completionPctColor, whiteSpace: 'nowrap', minWidth: '36px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {completionPct}%
      </Typography>
    </Box>

    {/* Hint */}
    {hintText && (
      <Box sx={{ bgcolor: 'var(--surface)', px: '32px', pb: '14px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: hintColor }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={12} height={12} style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <Typography sx={{ fontSize: '11px', color: hintColor }}>{hintText}</Typography>
        </Box>
      </Box>
    )}
  </Box>
);

/* ══════════════════════════════════════
   HERO CHIP  (small badge in hero)
══════════════════════════════════════ */
export const HeroChip = ({ children, color = 'var(--t800)', bg = 'var(--t100)', icon }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      px: '10px', py: '3px',
      borderRadius: '99px',
      fontSize: '10.5px', fontWeight: 600,
      bgcolor: bg, color,
      '& svg': { width: 10, height: 10, stroke: 'currentColor', fill: 'none', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    }}
  >
    {icon}{children}
  </Box>
);

/* ══════════════════════════════════════
   LIVE DOT
══════════════════════════════════════ */
export const LiveDot = ({ color = '#22C55E', size = 6 }) => (
  <Box component="span" sx={{ width: size, height: size, borderRadius: '50%', bgcolor: color, display: 'inline-block', animation: 'profPulseDot 2s ease-in-out infinite', mr: '2px' }} />
);

/* ══════════════════════════════════════
   PERMISSION CHIP
══════════════════════════════════════ */
export const PermChip = ({ label, granted = true, delay = 0 }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      px: '12px', py: '5px', pl: '8px',
      borderRadius: '9px',
      fontSize: '11.5px', fontWeight: 600,
      bgcolor: granted ? 'var(--t50)'    : 'var(--surface2)',
      color:   granted ? 'var(--t800)'   : 'var(--tx3)',
      border:  `1px solid ${granted ? 'var(--t200)' : 'var(--border)'}`,
      opacity: 0,
      animation: `profChipIn .4s cubic-bezier(.4,0,.2,1) ${delay}s forwards`,
      transition: 'all .18s cubic-bezier(.34,1.56,.64,1)',
      '&:hover': granted ? {
        transform: 'translateY(-2px) scale(1.03)',
        boxShadow: '0 3px 10px rgba(22,122,87,0.15)',
      } : {},
    }}
  >
    <Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: granted ? 'var(--t500)' : 'var(--tx3)', flexShrink: 0 }} />
    {label}
  </Box>
);

/* ══════════════════════════════════════
   ADMIN LEVEL INDICATOR (pip dots)
══════════════════════════════════════ */
const LEVEL_MAP = {
  standard: { on: 1, name: 'Standard' },
  staff:    { on: 2, name: 'Staff' },
  senior:   { on: 3, name: 'Senior Admin' },
  super:    { on: 5, name: 'Super Administrator' },
};
export const AdminLevelIndicator = ({ level = 'staff' }) => {
  const cfg = LEVEL_MAP[level] || LEVEL_MAP.staff;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mt: '2px' }}>
      <Box sx={{ display: 'flex', gap: '4px' }}>
        {[0,1,2,3,4].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: i < cfg.on ? 'var(--t500)' : 'var(--border2)',
              animation: i < cfg.on ? 'profGlowPulse 2.5s ease-in-out infinite' : 'none',
              animationDelay: `${i * 0.2}s`,
              transition: 'transform .2s',
              '&:hover': { transform: 'scale(1.3)' },
            }}
          />
        ))}
      </Box>
      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx1)' }}>
        {cfg.name}
      </Typography>
    </Box>
  );
};

/* ══════════════════════════════════════
   EDIT SECTION CARD  (form wrapper)
══════════════════════════════════════ */
export const EditSection = ({ title, sectionNum, icon, children, delay = 0 }) => (
  <Box
    sx={{
      bgcolor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '18px',
      boxShadow: 'var(--sh)',
      overflow: 'hidden',
      mb: 2,
      opacity: 0,
      animation: `profSlideUp .4s cubic-bezier(.4,0,.2,1) ${delay}s forwards`,
    }}
  >
    {/* Section header */}
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: '10px',
        px: '24px', py: '14px',
        borderBottom: '1px solid var(--border)',
        bgcolor: 'var(--surface2)',
      }}
    >
      {icon && (
        <Box sx={{ width: 32, height: 32, borderRadius: '9px', bgcolor: 'var(--t100)', color: 'var(--t700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </Box>
      )}
      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--tx1)', flex: 1 }}>
        {title}
      </Typography>
      {sectionNum && (
        <Typography sx={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '11px', color: 'var(--tx3)', fontStyle: 'italic' }}>
          Section {sectionNum}
        </Typography>
      )}
    </Box>

    {children}
  </Box>
);

/* ══════════════════════════════════════
   FORM GRID  (2-col or 3-col input layout)
══════════════════════════════════════ */
export const FormGrid = ({ cols = 2, children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: `repeat(${Math.min(cols, 3)}, 1fr)`,
      },
      gap: '16px 20px',
      p: '20px 24px',
    }}
  >
    {children}
  </Box>
);

/* ══════════════════════════════════════
   FORM FIELD  (label + native input)
   Used in edit pages — styled to match
   the HTML design's .form-input style.
══════════════════════════════════════ */
export const FormField = ({ label, required, children, fullWidth = false }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: fullWidth ? '1 / -1' : 'span 1' }}>
    <Box
      component="label"
      sx={{
        fontSize: '11px', fontWeight: 600,
        color: 'var(--tx2)', letterSpacing: '.3px',
        '& span': { color: 'var(--danger)', ml: '2px' },
      }}
    >
      {label}{required && <span>*</span>}
    </Box>
    {children}
  </Box>
);

/* ══════════════════════════════════════
   NATIVE INPUT / SELECT / TEXTAREA
   Styled to match the HTML .form-input
══════════════════════════════════════ */
export const NativeInput = ({ ...props }) => (
  <Box
    component="input"
    {...props}
    sx={{
      padding: '9px 13px',
      bgcolor: 'var(--surface2)',
      border: '1.5px solid var(--border)',
      borderRadius: '9px',
      fontSize: '13px', fontWeight: 400,
      color: 'var(--tx1)',
      fontFamily: 'inherit',
      outline: 'none', width: '100%',
      transition: 'border-color .18s, background .18s, box-shadow .18s',
      '&:focus': {
        borderColor: 'var(--t400)',
        bgcolor: 'var(--surface)',
        boxShadow: '0 0 0 3px rgba(45,175,131,0.10)',
      },
      '&:hover:not(:focus)': { borderColor: 'var(--border2)' },
      '&::placeholder': { color: 'var(--tx3)' },
      '&:disabled': { opacity: 0.55, cursor: 'not-allowed' },
      ...props.sx,
    }}
  />
);

export const NativeSelect = ({ children, ...props }) => (
  <Box
    component="select"
    {...props}
    sx={{
      padding: '9px 36px 9px 13px',
      bgcolor: 'var(--surface2)',
      border: '1.5px solid var(--border)',
      borderRadius: '9px',
      fontSize: '13px', fontWeight: 400,
      color: 'var(--tx1)',
      fontFamily: 'inherit',
      outline: 'none', width: '100%',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238A90B4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '14px',
      transition: 'border-color .18s, background .18s, box-shadow .18s',
      '&:focus': {
        borderColor: 'var(--t400)',
        bgcolor: 'var(--surface)',
        boxShadow: '0 0 0 3px rgba(45,175,131,0.10)',
      },
      ...props.sx,
    }}
  >
    {children}
  </Box>
);

export const NativeTextarea = ({ ...props }) => (
  <Box
    component="textarea"
    {...props}
    sx={{
      padding: '9px 13px',
      bgcolor: 'var(--surface2)',
      border: '1.5px solid var(--border)',
      borderRadius: '9px',
      fontSize: '13px', fontWeight: 400,
      color: 'var(--tx1)',
      fontFamily: 'inherit',
      outline: 'none', width: '100%',
      resize: 'vertical',
      minHeight: '88px',
      lineHeight: 1.55,
      transition: 'border-color .18s, background .18s, box-shadow .18s',
      '&:focus': {
        borderColor: 'var(--t400)',
        bgcolor: 'var(--surface)',
        boxShadow: '0 0 0 3px rgba(45,175,131,0.10)',
      },
      '&::placeholder': { color: 'var(--tx3)' },
      ...props.sx,
    }}
  />
);

/* ══════════════════════════════════════
   EDIT ACTIONS BAR  (sticky footer)
══════════════════════════════════════ */
export const EditActionsBar = ({ children }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      px: '24px', py: '18px',
      bgcolor: 'var(--surface2)',
      borderTop: '1px solid var(--border)',
      borderRadius: '0 0 18px 18px',
      position: 'sticky',
      bottom: 0,
      zIndex: 50,
    }}
  >
    {children}
  </Box>
);

/* ══════════════════════════════════════
   PROFILE BUTTON  (styled action btn)
  variant: 'primary' | 'outline' | 'danger'
══════════════════════════════════════ */
export const ProfileBtn = ({ children, variant = 'primary', icon, onClick, disabled, type = 'button', small = false }) => {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, var(--t700), var(--t500))',
      color: '#fff',
      border: 'none',
      boxShadow: '0 2px 10px rgba(22,122,87,0.28)',
      '&:hover:not(:disabled)': { transform: 'translateY(-1px)', boxShadow: '0 5px 18px rgba(22,122,87,0.38)' },
    },
    outline: {
      background: 'transparent',
      color: 'var(--tx2)',
      border: '1.5px solid var(--border2)',
      '&:hover:not(:disabled)': { bgcolor: 'var(--surface2)', color: 'var(--tx1)' },
    },
    danger: {
      background: 'transparent',
      color: 'var(--danger)',
      border: '1.5px solid rgba(232,69,69,.25)',
      '&:hover:not(:disabled)': { bgcolor: 'var(--danger-l)' },
    },
  };

  return (
    <Box
      component="button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        px: small ? '12px' : '18px',
        py: small ? '5px' : '8px',
        borderRadius: '9px',
        fontSize: small ? '11.5px' : '12.5px',
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .18s',
        opacity: disabled ? 0.65 : 1,
        '& svg': { width: 13, height: 13, stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
        ...styles[variant],
      }}
    >
      {icon}{children}
    </Box>
  );
};