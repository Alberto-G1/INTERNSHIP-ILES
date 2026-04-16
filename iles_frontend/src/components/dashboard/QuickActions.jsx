// frontend/src/components/dashboard/QuickActions.jsx
import { Box, Typography, Grid } from '@mui/material';
import { T } from './DashboardComponents';

/* ── Button accent cycling — gives visual variety across actions ─ */
const ACCENTS = [
  { color: T.t700,   bg: T.t50,    border: T.t200  },
  { color: T.i700,   bg: T.i50,    border: T.i100  },
  { color: T.a700,   bg: T.a50,    border: T.a100  },
  { color: T.t600,   bg: T.t50,    border: T.t100  },
  { color: T.i600,   bg: T.i50,    border: T.i100  },
  { color: T.a600,   bg: T.a50,    border: T.a100  },
];

/* ─────────────────────────────────────────────────────────────── */
const QuickActions = ({ actions = [], loading = false }) => {
  if (!actions.length) return null;

  return (
    <Box
      sx={{
        bgcolor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(13,16,32,.05), 0 4px 18px rgba(13,16,32,.06)',
        animation: 'qaFadeUp .5s ease both',
        '@keyframes qaFadeUp': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center',
          px: '18px', py: '14px',
          borderBottom: `1px solid ${T.border}`,
          gap: '10px',
        }}
      >
        <Box
          sx={{
            width: 32, height: 32, borderRadius: '8px',
            bgcolor: T.surface2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.tx3,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
            strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </Box>
        <Typography
          sx={{
            fontSize: '13px', fontWeight: 600,
            color: T.tx1, fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Quick Actions
        </Typography>
      </Box>

      {/* Action buttons grid */}
      <Box sx={{ p: '14px 18px' }}>
        <Grid container spacing={1.5}>
          {actions.map((action, index) => {
            const accent = ACCENTS[index % ACCENTS.length];

            return (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Box
                  component="button"
                  onClick={action.onClick}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    px: '14px',
                    py: '10px',
                    borderRadius: '10px',
                    border: `1.5px solid ${accent.border}`,
                    bgcolor: accent.bg,
                    color: accent.color,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    fontWeight: 500,
                    textAlign: 'left',
                    transition: 'all .18s cubic-bezier(.4,0,.2,1)',
                    /* Staggered fade-in */
                    animation: `qaItemIn .35s ease ${index * 0.05}s both`,
                    '@keyframes qaItemIn': {
                      from: { opacity: 0, transform: 'translateX(-8px)' },
                      to:   { opacity: 1, transform: 'translateX(0)' },
                    },
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${accent.color}25`,
                      borderColor: accent.color,
                      bgcolor: T.surface,
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  {/* Icon wrapper */}
                  <Box
                    sx={{
                      width: 28, height: 28, borderRadius: '7px',
                      bgcolor: `${accent.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: accent.color,
                      flexShrink: 0,
                      transition: 'background .18s',
                    }}
                  >
                    {action.icon}
                  </Box>

                  {/* Label */}
                  <Typography
                    sx={{
                      fontSize: '13px', fontWeight: 500,
                      color: accent.color,
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.2,
                      flex: 1,
                    }}
                  >
                    {action.label}
                  </Typography>

                  {/* Arrow */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" width={12} height={12}
                    style={{ opacity: 0.5, flexShrink: 0 }}>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default QuickActions;