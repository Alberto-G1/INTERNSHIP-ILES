// src/theme.js
import { createTheme } from '@mui/material/styles';

/* ══════════════════════════════════════
   AILES MUI Theme Factory
   Usage:  ailesMuiTheme('light' | 'dark')
   Called by AppShell in App.jsx with the
   current mode from ThemeModeContext.
══════════════════════════════════════ */
const ailesMuiTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({

    /* ── Palette ── */
    palette: {
      mode,
      primary: {
        main:         '#2E8B5B',
        dark:         '#1A5C3A',
        light:        '#4DB87A',
        contrastText: '#ffffff',
      },
      secondary: {
        main:         '#F59E0B',
        dark:         '#D97706',
        light:        '#FEF3C7',
        contrastText: '#ffffff',
      },
      error: {
        main:         '#DC2626',
        light:        '#FDE8E6',
        contrastText: '#ffffff',
      },
      warning: {
        main:         '#F59E0B',
        light:        '#FEF3C7',
        contrastText: '#ffffff',
      },
      info: {
        main:         '#2563EB',
        light:        '#DBEAFE',
        contrastText: '#ffffff',
      },
      success: {
        main:         '#2E8B5B',
        light:        '#D6F2E4',
        contrastText: '#ffffff',
      },
      text: {
        primary:   isDark ? '#F1F5F9' : '#111827',
        secondary: isDark ? '#CBD5E1' : '#6B7280',
        disabled:  isDark ? '#475569' : '#9CA3AF',
      },
      background: {
        default: isDark ? '#060E1A' : '#F7F8FA',
        paper:   isDark ? '#0D1929' : '#FFFFFF',
      },
      divider: isDark ? '#1E293B' : '#E5E7EB',
    },

    /* ── Typography — Poppins everywhere ── */
    typography: {
      fontFamily: "'Poppins', sans-serif",
      h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
      h2: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
      h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
      h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: '-0.3px' },
      h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
      h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
      body1:     { fontFamily: "'Poppins', sans-serif" },
      body2:     { fontFamily: "'Poppins', sans-serif" },
      subtitle1: { fontFamily: "'Poppins', sans-serif" },
      subtitle2: { fontFamily: "'Poppins', sans-serif" },
      button:    { fontFamily: "'Poppins', sans-serif", textTransform: 'none', fontWeight: 600 },
      caption:   { fontFamily: "'Poppins', sans-serif" },
      overline:  { fontFamily: "'Poppins', sans-serif" },
    },

    /* ── Shape ── */
    shape: { borderRadius: 10 },

    /* ── Component overrides ── */
    components: {

      /* CssBaseline */
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: isDark ? '#060E1A' : '#F7F8FA',
            color: isDark ? '#F1F5F9' : '#111827',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          '*': { fontFamily: "'Poppins', sans-serif" },
          'code, pre, kbd, samp': {
            fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
          },
        },
      },

      /* Button */
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: "'Poppins', sans-serif",
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            letterSpacing: '0.1px',
          },
          containedPrimary: {
            backgroundColor: '#1A5C3A',
            boxShadow: '0 2px 8px rgba(26,92,58,0.3)',
            '&:hover': {
              backgroundColor: '#236B44',
              boxShadow: '0 4px 16px rgba(26,92,58,0.4)',
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
          },
        },
      },

      /* OutlinedInput / TextField */
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontFamily: "'Poppins', sans-serif",
            borderRadius: '10px',
            backgroundColor: isDark ? '#0a1520' : '#F9FAFB',
            transition: 'background-color 0.2s, border-color 0.2s',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#1E3A5F' : '#D1D5DB',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#2E5A8F' : '#9CA3AF',
            },
            '&.Mui-focused': {
              backgroundColor: isDark ? '#0D1929' : '#FFFFFF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#4DB87A' : '#2E8B5B',
              borderWidth: '1.5px',
              boxShadow: '0 0 0 3px rgba(46,139,91,0.12)',
            },
          },
          input: {
            fontFamily: "'Poppins', sans-serif",
            color: isDark ? '#F1F5F9' : '#111827',
            '&::placeholder': {
              color: isDark ? '#4B6280' : '#9CA3AF',
              opacity: 1,
            },
          },
        },
      },

      /* InputLabel */
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontFamily: "'Poppins', sans-serif",
            color: isDark ? '#64748B' : '#6B7280',
            '&.Mui-focused': {
              color: isDark ? '#4DB87A' : '#2E8B5B',
            },
          },
        },
      },

      /* Typography */
      MuiTypography: {
        styleOverrides: {
          root: { fontFamily: "'Poppins', sans-serif" },
        },
      },

      /* Card */
      MuiCard: {
        styleOverrides: {
          root: {
            fontFamily: "'Poppins', sans-serif",
            borderRadius: '16px',
            border: `1px solid ${isDark ? '#1E293B' : '#E5E7EB'}`,
            backgroundColor: isDark ? '#0D1929' : '#FFFFFF',
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.4), 0 4px 18px rgba(0,0,0,0.25)'
              : '0 1px 3px rgba(13,16,32,0.05), 0 4px 18px rgba(13,16,32,0.06)',
          },
        },
      },

      /* Paper */
      MuiPaper: {
        styleOverrides: {
          root: {
            fontFamily: "'Poppins', sans-serif",
            borderRadius: '10px',
            backgroundColor: isDark ? '#0D1929' : '#FFFFFF',
          },
        },
      },

      /* AppBar */
      MuiAppBar: {
        styleOverrides: {
          root: { borderRadius: 0, boxShadow: 'none' },
        },
      },

      /* Dialog */
      MuiDialog: {
        styleOverrides: {
          paper: {
            fontFamily: "'Poppins', sans-serif",
            borderRadius: '20px',
            backgroundColor: isDark ? '#0D1929' : '#FFFFFF',
            border: `1px solid ${isDark ? '#1E293B' : '#E5E7EB'}`,
            boxShadow: isDark
              ? '0 24px 64px rgba(0,0,0,0.6)'
              : '0 24px 64px rgba(0,0,0,0.18)',
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            fontFamily: "'Poppins', sans-serif",
            color: isDark ? '#F1F5F9' : '#111827',
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: { fontFamily: "'Poppins', sans-serif" },
        },
      },

      /* Alert */
      MuiAlert: {
        styleOverrides: {
          root: {
            fontFamily: "'Poppins', sans-serif",
            borderRadius: '10px',
          },
        },
      },

      /* Checkbox */
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: isDark ? '#334155' : '#D1D5DB',
            '&.Mui-checked': {
              color: isDark ? '#4DB87A' : '#2E8B5B',
            },
          },
        },
      },

      /* Link */
      MuiLink: {
        styleOverrides: {
          root: {
            fontFamily: "'Poppins', sans-serif",
            color: isDark ? '#4DB87A' : '#2E8B5B',
            '&:hover': { color: isDark ? '#7dd8a8' : '#1A5C3A' },
          },
        },
      },

      /* Chip */
      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: "'Poppins', sans-serif",
            borderRadius: '8px',
          },
        },
      },

      /* LinearProgress */
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: '99px',
            backgroundColor: isDark ? '#1E293B' : '#E5E7EB',
            height: 6,
          },
          bar: {
            borderRadius: '99px',
            backgroundColor: isDark ? '#4DB87A' : '#2E8B5B',
          },
        },
      },

      /* Tooltip */
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '12px',
            backgroundColor: isDark ? '#1E293B' : '#1F2937',
            borderRadius: '8px',
            padding: '6px 10px',
          },
        },
      },

      /* TableCell */
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontFamily: "'Poppins', sans-serif",
            borderBottom: `1px solid ${isDark ? '#1E293B' : '#E5E7EB'}`,
            color: isDark ? '#F1F5F9' : '#111827',
          },
          head: {
            fontWeight: 600,
            color: isDark ? '#94A3B8' : '#4B5563',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            backgroundColor: isDark ? '#0D1929' : '#F9FAFB',
          },
        },
      },

      /* IconButton */
      MuiIconButton: {
        styleOverrides: {
          root: { fontFamily: "'Poppins', sans-serif" },
        },
      },

      /* FormControlLabel */
      MuiFormControlLabel: {
        styleOverrides: {
          label: { fontFamily: "'Poppins', sans-serif" },
        },
      },

      /* Select / MenuItem */
      MuiSelect: {
        styleOverrides: {
          root: { fontFamily: "'Poppins', sans-serif" },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { fontFamily: "'Poppins', sans-serif" },
        },
      },

      /* ListItemText */
      MuiListItemText: {
        styleOverrides: {
          primary:   { fontFamily: "'Poppins', sans-serif" },
          secondary: { fontFamily: "'Poppins', sans-serif" },
        },
      },

      /* Drawer (sidebar) */
      MuiDrawer: {
        styleOverrides: {
          paper: {
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: isDark ? '#071810' : '#1A5C3A',
          },
        },
      },
    },
  });
};

export default ailesMuiTheme;