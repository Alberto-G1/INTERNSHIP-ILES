import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useThemeMode } from '../../context/ThemeModeContext';

/* ── Per-page left-panel content ── */
const LEFT_CONTENT = {
  signin: {
    headline: ['Track every step of your', 'internship journey.'],
    desc: 'AILES gives interns, supervisors, and administrators a unified space to log progress, evaluate performance, and generate insights — in real time.',
    stats: [
      { value: '48+', label: 'Active interns' },
      { value: '312', label: 'Logs submitted' },
      { value: '83.4', label: 'Avg. score' },
    ],
  },
  signup: {
    headline: ['Your internship,', 'documented with purpose.'],
    desc: 'Join AILES as an intern, supervisor, or administrator. Build a complete record of your internship experience — tracked, evaluated, and ready for review.',
    stats: [
      { value: '3',    label: 'User roles' },
      { value: '16',   label: 'Week coverage' },
      { value: '100%', label: 'Transparent' },
    ],
  },
  forgot: {
    headline: ['Locked out?', "We've got you covered."],
    desc: "Password resets are quick and secure. Enter your registered email and we'll send you a 6-digit code to verify your identity and set a new password.",
    stats: [
      { value: '2 min',  label: 'Reset time' },
      { value: '256-bit', label: 'Encrypted' },
    ],
  },
};

/* ── AILES logo SVG paths (reused) ── */
const LogoSVG = ({ size = 22, stroke = 'white', strokeWidth = 2 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

/* ── Moon / Sun icons ── */
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

/* ══════════════════════════════════════
   LEFT PANEL — decorative SVG art
══════════════════════════════════════ */
const LeftArtLight = () => (
  <svg
    viewBox="0 0 600 800"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
  >
    <ellipse cx="520" cy="120" rx="260" ry="260" fill="rgba(255,255,255,0.04)" />
    <ellipse cx="80"  cy="680" rx="200" ry="200" fill="rgba(255,255,255,0.03)" />
    <ellipse cx="300" cy="400" rx="300" ry="300" fill="rgba(77,184,122,0.06)" />
    <path d="M480 760 Q520 680 460 620 Q400 680 480 760Z" fill="rgba(77,184,122,0.12)" />
    <path d="M500 780 Q560 700 500 640 Q440 700 500 780Z" fill="rgba(77,184,122,0.08)" />
    <path d="M100 100 Q60 200 130 240 Q160 180 100 100Z" fill="rgba(255,255,255,0.06)" />
    <path d="M70 120 Q20 220 90 270 Q130 200 70 120Z"   fill="rgba(255,255,255,0.04)" />
    <g fill="rgba(255,255,255,0.07)">
      <circle cx="40"  cy="40"  r="2" /><circle cx="80"  cy="40"  r="2" /><circle cx="120" cy="40"  r="2" />
      <circle cx="40"  cy="80"  r="2" /><circle cx="80"  cy="80"  r="2" /><circle cx="120" cy="80"  r="2" />
      <circle cx="40"  cy="120" r="2" /><circle cx="80"  cy="120" r="2" /><circle cx="120" cy="120" r="2" />
    </g>
    <path d="M-20 500 Q200 300 500 400" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
    <path d="M-20 560 Q200 360 500 460" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
  </svg>
);

const LeftArtDark = () => (
  <svg
    viewBox="0 0 600 800"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
  >
    <ellipse cx="300" cy="400" rx="350" ry="350" fill="rgba(77,184,122,0.04)" />
    <ellipse cx="500" cy="100" rx="180" ry="180" fill="rgba(93,130,166,0.06)" />
    <g fill="rgba(255,255,255,0.35)">
      <circle cx="120" cy="180" r="1.5" /><circle cx="220" cy="130" r="2.5" /><circle cx="360" cy="200" r="1.5" />
      <circle cx="460" cy="140" r="2"   /><circle cx="500" cy="280" r="1.5" /><circle cx="390" cy="340" r="2"   />
      <circle cx="240" cy="300" r="1.5" /><circle cx="140" cy="380" r="2"   /><circle cx="80"  cy="500" r="1.5" />
      <circle cx="180" cy="560" r="2.5" /><circle cx="320" cy="520" r="1.5" /><circle cx="460" cy="480" r="2"   />
      <circle cx="540" cy="600" r="1.5" /><circle cx="420" cy="680" r="2"   /><circle cx="280" cy="700" r="1.5" />
    </g>
    <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" fill="none">
      <line x1="120" y1="180" x2="220" y2="130" /><line x1="220" y1="130" x2="360" y2="200" />
      <line x1="360" y1="200" x2="460" y2="140" /><line x1="460" y1="140" x2="500" y2="280" />
      <line x1="500" y1="280" x2="390" y2="340" /><line x1="390" y1="340" x2="240" y2="300" />
      <line x1="240" y1="300" x2="140" y2="380" /><line x1="140" y1="380" x2="80"  y2="500" />
      <line x1="80"  y1="500" x2="180" y2="560" /><line x1="180" y1="560" x2="320" y2="520" />
      <line x1="320" y1="520" x2="460" y2="480" /><line x1="460" y1="480" x2="540" y2="600" />
    </g>
    <circle cx="300" cy="280" r="80" fill="rgba(46,139,91,0.08)" />
    <circle cx="300" cy="280" r="40" fill="rgba(46,139,91,0.10)" />
  </svg>
);

/* ══════════════════════════════════════
   AUTH SHELL
══════════════════════════════════════ */
const AuthShell = ({ mode = 'signin', children }) => {
  const { mode: themeMode, toggleMode } = useThemeMode();
  const content = LEFT_CONTENT[mode] || LEFT_CONTENT.signin;
  const isDark   = themeMode === 'dark';

  /* italic second line of headline */
  const [line1, line2] = content.headline;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        bgcolor: 'var(--surface)',
        color: 'var(--ink)',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {/* ══ LEFT PANEL ══ */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: '36px 48px',
          minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(160deg, #0d1f29 0%, #0a1a2e 60%, #050d18 100%)'
            : 'linear-gradient(160deg, #1A5C3A 0%, #0d3d26 60%, #071f14 100%)',
          transition: 'background 0.4s',
        }}
      >
        {/* Decorative art */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {isDark ? <LeftArtDark /> : <LeftArtLight />}
        </Box>

        {/* Logo */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            position: 'relative',
            zIndex: 2,
            animation: 'fadeUp 0.6s ease both',
            '@keyframes fadeUp': {
              from: { opacity: 0, transform: 'translateY(14px)' },
              to:   { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Box
            sx={{
              width: 60, height: 60,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <LogoSVG size={32} stroke="white" strokeWidth={2} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '20px', lineHeight: 1.1, letterSpacing: '0.5px' }}>
              AILES
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', mt: '1px' }}>
              Internship Logging &amp; Evaluation
            </Typography>
          </Box>
        </Stack>

        {/* Headline + stats */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            animation: 'fadeUp 0.7s ease 0.1s both',
            '@keyframes fadeUp': {
              from: { opacity: 0, transform: 'translateY(14px)' },
              to:   { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Typography
            sx={{
              color: '#fff',
              fontSize: 'clamp(26px, 3vw, 38px)',
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
              mb: 2,
            }}
          >
            {line1}
            <br />
            <Box component="em" sx={{ fontStyle: 'italic', color: '#7dd8a8' }}>{line2}</Box>
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '14.5px',
              lineHeight: 1.7,
              maxWidth: 360,
              mb: 4,
            }}
          >
            {content.desc}
          </Typography>

          <Stack direction="row" spacing={3.5}>
            {content.stats.map((s) => (
              <Box key={s.label}>
                <Typography sx={{ color: '#fff', fontSize: '22px', fontWeight: 500, fontFamily: 'monospace' }}>
                  {s.value}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', mt: '1px' }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Footer */}
        <Typography
          sx={{
            position: 'relative',
            zIndex: 2,
            color: 'rgba(255,255,255,0.3)',
            fontSize: '11.5px',
            animation: 'fadeUp 0.7s ease 0.2s both',
          }}
        >
          © 2025 AILES System · All rights reserved
        </Typography>
      </Box>

      {/* ══ RIGHT PANEL ══ */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: '60px 24px 40px', md: '40px 32px' },
          bgcolor: 'var(--panel-bg)',
          minHeight: '100vh',
          overflowY: 'auto',
          transition: 'background 0.3s',
        }}
      >
        {/* Theme toggle */}
        <IconButton
          onClick={toggleMode}
          title="Toggle theme"
          sx={{
            position: 'absolute',
            top: { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            width: 50, height: 50,
            borderRadius: '50%',
            border: '1px solid var(--gray-200)',
            bgcolor: 'var(--input-bg)',
            color: 'var(--gray-500)',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'var(--gray-100)',
              transform: 'rotate(20deg)',
            },
          }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </IconButton>

        {/* Mobile logo (hidden on md+) */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.2}
          sx={{
            display: { xs: 'flex', md: 'none' },
            mb: 3.5,
            alignSelf: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: 34, height: 34,
              bgcolor: 'var(--green-900)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <LogoSVG size={18} stroke="white" strokeWidth={2} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '18px', color: 'var(--ink)' }}>AILES</Typography>
        </Stack>

        {/* Form content */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 700,
            animation: 'fadeUp 0.5s ease both',
            '@keyframes fadeUp': {
              from: { opacity: 0, transform: 'translateY(14px)' },
              to:   { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthShell;