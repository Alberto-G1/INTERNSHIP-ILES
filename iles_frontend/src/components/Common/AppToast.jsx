import { useEffect, useRef } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════
   CONSTANTS
══════════════════════════════════════ */
export const TOAST_DURATION = 4500;

/* ══════════════════════════════════════
   TYPE CONFIG
══════════════════════════════════════ */
const toastConfig = {
  success: {
    accent:      'var(--green-600)',
    iconBg:      'var(--green-100)',
    iconColor:   'var(--green-700)',
    progressFrom:'var(--green-600)',
    progressTo:  'var(--green-100)',
    actionColor: 'var(--green-700)',
    actionBorder:'var(--green-600)',
  },
  error: {
    accent:      'var(--coral-600)',
    iconBg:      'var(--coral-100)',
    iconColor:   'var(--coral-700)',
    progressFrom:'var(--coral-600)',
    progressTo:  'var(--coral-100)',
    actionColor: 'var(--coral-700)',
    actionBorder:'var(--coral-600)',
  },
  info: {
    accent:      'var(--blue-600)',
    iconBg:      'var(--blue-100)',
    iconColor:   'var(--blue-700)',
    progressFrom:'var(--blue-600)',
    progressTo:  'var(--blue-100)',
    actionColor: 'var(--blue-700)',
    actionBorder:'var(--blue-600)',
  },
  warning: {
    accent:      'var(--amber-500)',
    iconBg:      'var(--amber-100)',
    iconColor:   'var(--amber-600)',
    progressFrom:'var(--amber-500)',
    progressTo:  'var(--amber-100)',
    actionColor: 'var(--amber-600)',
    actionBorder:'var(--amber-500)',
  },
};

const defaultTitles = {
  success: 'Success',
  error:   'Error',
  info:    'Info',
  warning: 'Warning',
};

/* ══════════════════════════════════════
   INLINE SVG ICONS  (no MUI icon dep)
══════════════════════════════════════ */
const LogoSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width={10} height={10}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const SuccessSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ErrorSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const InfoSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const WarningSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CloseSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const typeIcons = {
  success: <SuccessSVG />,
  error:   <ErrorSVG />,
  info:    <InfoSVG />,
  warning: <WarningSVG />,
};

/* ══════════════════════════════════════
   PROGRESS BAR (CSS keyframe via style tag)
══════════════════════════════════════ */
const PROGRESS_STYLE_ID = 'ailes-toast-progress-keyframe';
if (typeof document !== 'undefined' && !document.getElementById(PROGRESS_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = PROGRESS_STYLE_ID;
  style.textContent = `
    @keyframes ailesProgress {
      from { transform: scaleX(1); }
      to   { transform: scaleX(0); }
    }
    @keyframes ailesSlideIn {
      from { opacity: 0; transform: translateX(calc(380px + 40px)) scale(0.95); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes ailesSlideOut {
      from { opacity: 1; transform: translateX(0) scale(1); }
      to   { opacity: 0; transform: translateX(calc(380px + 40px)) scale(0.95); }
    }
  `;
  document.head.appendChild(style);
}

/* ══════════════════════════════════════
   TOAST CARD COMPONENT
══════════════════════════════════════ */
const AppToastCard = ({ t, type = 'info', title, message, actionLabel, onAction, duration = TOAST_DURATION }) => {
  const cfg = toastConfig[type] || toastConfig.info;
  const progressRef = useRef(null);

  /* Kick off the progress animation once the element mounts */
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    el.style.animation = `ailesProgress ${duration}ms linear forwards`;
  }, [duration]);

  const dismiss = () => toast.dismiss(t.id);

  return (
    <Box
      sx={{
        width: { xs: 'calc(100vw - 32px)', sm: '380px' },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'var(--panel-bg)',
        border: '1px solid var(--gray-200)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        animation: t.visible
          ? 'ailesSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both'
          : 'ailesSlideOut 0.3s ease forwards',
      }}
    >
      {/* ── Left accent bar ── */}
      <Box
        sx={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 4, borderRadius: '4px 0 0 4px',
          bgcolor: cfg.accent,
        }}
      />

      {/* ── Main row ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: '16px 14px 20px 20px' }}>

        {/* Type icon bubble */}
        <Box
          sx={{
            width: 40, height: 40, borderRadius: '10px',
            bgcolor: cfg.iconBg, color: cfg.iconColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, mt: '2px',
          }}
        >
          {typeIcons[type]}
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* AILES brand row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '6px' }}>
            <Box
              sx={{
                width: 18, height: 18, borderRadius: '5px',
                bgcolor: 'var(--green-900)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LogoSVG />
            </Box>
            <Typography sx={{ fontSize: '10px', fontWeight: 600, color: 'var(--gray-400)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              AILES
            </Typography>
          </Box>

          {/* Title */}
          <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, mb: '3px' }}>
            {title}
          </Typography>

          {/* Message */}
          <Typography sx={{ fontSize: '12.5px', color: 'var(--gray-600)', lineHeight: 1.5 }}>
            {message}
          </Typography>

          {/* Optional action button */}
          {actionLabel && (
            <Button
              size="small"
              onClick={() => { dismiss(); if (onAction) onAction(); }}
              sx={{
                mt: 1.2, px: 1.5, py: '5px',
                borderRadius: '6px',
                border: `1.5px solid ${cfg.actionBorder}`,
                color: cfg.actionColor,
                bgcolor: 'transparent',
                fontSize: '12px', fontWeight: 500,
                minWidth: 0, textTransform: 'none',
                '&:hover': { opacity: 0.8, transform: 'translateY(-1px)' },
                transition: 'opacity 0.15s, transform 0.15s',
              }}
            >
              {actionLabel}
            </Button>
          )}
        </Box>

        {/* Close button */}
        <IconButton
          size="small"
          onClick={dismiss}
          sx={{
            width: 26, height: 26, borderRadius: '6px',
            border: 'none', bgcolor: 'transparent',
            color: 'var(--gray-400)', mt: '1px', flexShrink: 0,
            transition: 'background 0.15s, color 0.15s',
            '&:hover': { bgcolor: 'var(--gray-100)', color: 'var(--ink)' },
          }}
        >
          <CloseSVG />
        </IconButton>
      </Box>

      {/* ── Progress bar ── */}
      <Box
        ref={progressRef}
        sx={{
          position: 'absolute', bottom: 0, left: 4, right: 0,
          height: '3px', borderRadius: '0 0 16px 0',
          transformOrigin: 'left',
          background: `linear-gradient(90deg, ${cfg.progressFrom}, ${cfg.progressTo})`,
        }}
      />
    </Box>
  );
};

/* ══════════════════════════════════════
   PUBLIC NOTIFY API
══════════════════════════════════════ */
export const notify = ({
  type = 'info',
  title,
  message,
  duration = TOAST_DURATION,
  actionLabel,
  onAction,
} = {}) =>
  toast.custom(
    (t) => (
      <AppToastCard
        t={t}
        type={type}
        title={title || defaultTitles[type]}
        message={message}
        actionLabel={actionLabel}
        onAction={onAction}
        duration={duration}
      />
    ),
    { duration, position: 'top-right' }
  );

export const notifySuccess = (message, options = {}) =>
  notify({ type: 'success', title: options.title || 'Success', message, ...options });

export const notifyError = (message, options = {}) =>
  notify({ type: 'error', title: options.title || 'Error', message, ...options });

export const notifyInfo = (message, options = {}) =>
  notify({ type: 'info', title: options.title || 'Info', message, ...options });

export const notifyWarning = (message, options = {}) =>
  notify({ type: 'warning', title: options.title || 'Warning', message, ...options });

export default AppToastCard;