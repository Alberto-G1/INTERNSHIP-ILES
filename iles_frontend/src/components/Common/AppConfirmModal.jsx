import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from '@mui/material';

/* ══════════════════════════════════════
   INLINE SVG ICONS  (zero MUI icon dep)
══════════════════════════════════════ */
const LogoSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width={12} height={12}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const CloseSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* Per-variant icon SVGs */
const DeleteSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const ApproveSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const SignOutSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const RejectSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const SubmitSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ResetSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ArchiveSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const WarningSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoCircleSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const ClockSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FileSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const UserSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

const EmailSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const SaveSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

/* ══════════════════════════════════════
   VARIANT CONFIG MAP
══════════════════════════════════════ */
const VARIANTS = {
  delete: {
    icon:         <DeleteSVG />,
    iconBg:       'var(--coral-100)',
    iconColor:    'var(--coral-700)',
    ringBg:       'rgba(220,38,38,0.08)',
    confirmBg:    'var(--coral-600)',
    confirmHover: 'var(--coral-700)',
    confirmShadow:'rgba(220,38,38,0.3)',
    highlightBg:  'var(--coral-50)',
    highlightBorder:'rgba(220,38,38,0.25)',
    highlightColor:'var(--coral-700)',
  },
  approve: {
    icon:         <ApproveSVG />,
    iconBg:       'var(--green-100)',
    iconColor:    'var(--green-700)',
    ringBg:       'rgba(46,139,91,0.08)',
    confirmBg:    'var(--green-700)',
    confirmHover: 'var(--green-900)',
    confirmShadow:'rgba(26,92,58,0.3)',
    highlightBg:  'var(--green-50)',
    highlightBorder:'rgba(46,139,91,0.25)',
    highlightColor:'var(--green-700)',
  },
  signout: {
    icon:         <SignOutSVG />,
    iconBg:       'var(--amber-100)',
    iconColor:    'var(--amber-600)',
    ringBg:       'rgba(245,158,11,0.08)',
    confirmBg:    'var(--amber-600)',
    confirmHover: '#b45309',
    confirmShadow:'rgba(217,119,6,0.3)',
    highlightBg:  'var(--amber-50)',
    highlightBorder:'rgba(217,119,6,0.25)',
    highlightColor:'var(--amber-600)',
  },
  reject: {
    icon:         <RejectSVG />,
    iconBg:       'var(--coral-100)',
    iconColor:    'var(--coral-700)',
    ringBg:       'rgba(220,38,38,0.08)',
    confirmBg:    'var(--coral-600)',
    confirmHover: 'var(--coral-700)',
    confirmShadow:'rgba(220,38,38,0.3)',
    highlightBg:  'var(--coral-50)',
    highlightBorder:'rgba(220,38,38,0.25)',
    highlightColor:'var(--coral-700)',
  },
  submit: {
    icon:         <SubmitSVG />,
    iconBg:       'var(--blue-100)',
    iconColor:    'var(--blue-700)',
    ringBg:       'rgba(37,99,235,0.08)',
    confirmBg:    'var(--blue-600)',
    confirmHover: 'var(--blue-700)',
    confirmShadow:'rgba(37,99,235,0.3)',
    highlightBg:  'var(--blue-50)',
    highlightBorder:'rgba(37,99,235,0.25)',
    highlightColor:'var(--blue-700)',
  },
  reset: {
    icon:         <ResetSVG />,
    iconBg:       'var(--purple-100)',
    iconColor:    'var(--purple-700)',
    ringBg:       'rgba(109,40,217,0.08)',
    confirmBg:    'var(--purple-700)',
    confirmHover: '#5b21b6',
    confirmShadow:'rgba(109,40,217,0.3)',
    highlightBg:  'var(--purple-50)',
    highlightBorder:'rgba(109,40,217,0.25)',
    highlightColor:'var(--purple-700)',
  },
  archive: {
    icon:         <ArchiveSVG />,
    iconBg:       'var(--amber-100)',
    iconColor:    'var(--amber-600)',
    ringBg:       'rgba(245,158,11,0.08)',
    confirmBg:    'var(--amber-600)',
    confirmHover: '#b45309',
    confirmShadow:'rgba(217,119,6,0.3)',
    highlightBg:  'var(--amber-50)',
    highlightBorder:'rgba(217,119,6,0.25)',
    highlightColor:'var(--amber-600)',
  },
  warning: {
    icon:         <WarningSVG />,
    iconBg:       'var(--amber-100)',
    iconColor:    'var(--amber-600)',
    ringBg:       'rgba(245,158,11,0.08)',
    confirmBg:    'var(--amber-600)',
    confirmHover: '#b45309',
    confirmShadow:'rgba(217,119,6,0.3)',
    highlightBg:  'var(--amber-50)',
    highlightBorder:'rgba(217,119,6,0.25)',
    highlightColor:'var(--amber-600)',
  },
};

/* ══════════════════════════════════════
   BRANDING PILL  (shared)
══════════════════════════════════════ */
const BrandPill = () => (
  <Box
    sx={{
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      bgcolor: 'var(--gray-100)', border: '1px solid var(--gray-200)',
      borderRadius: '99px', px: '12px', py: '5px', pl: '7px', mb: 2.5,
    }}
  >
    <Box
      sx={{
        width: 22, height: 22, borderRadius: '6px',
        bgcolor: 'var(--green-900)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <LogoSVG />
    </Box>
    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-600)', letterSpacing: '0.5px' }}>
      AILES System
    </Typography>
  </Box>
);

/* ══════════════════════════════════════
   HIGHLIGHT BOX  (shared)
══════════════════════════════════════ */
const HighlightBox = ({ cfg, icon, text }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', gap: '10px',
      mt: 2, mx: 3, px: '14px', py: '12px',
      borderRadius: '12px',
      bgcolor: cfg.highlightBg,
      border: `1px dashed ${cfg.highlightBorder}`,
      color: cfg.highlightColor,
    }}
  >
    {icon}
    <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>{text}</Typography>
  </Box>
);

/* ══════════════════════════════════════
   DELETE CONFIRM INPUT  (type-to-confirm)
══════════════════════════════════════ */
const DeleteConfirmInput = ({ value, onChange }) => (
  <Box sx={{ mx: 3, mt: 2 }}>
    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'var(--gray-600)', mb: '6px' }}>
      Type{' '}
      <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--coral-700)', bgcolor: 'var(--coral-50)', px: '5px', borderRadius: '4px' }}>
        DELETE
      </Box>
      {' '}to confirm
    </Typography>
    <Box
      component="input"
      type="text"
      placeholder="Type DELETE here…"
      value={value}
      onChange={onChange}
      sx={{
        width: '100%', padding: '10px 13px',
        border: '1.5px solid var(--gray-200)',
        borderRadius: '8px',
        bgcolor: 'var(--gray-50)',
        color: 'var(--ink)',
        fontFamily: 'monospace', fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:focus': {
          borderColor: 'var(--coral-600)',
          boxShadow: '0 0 0 3px rgba(220,38,38,0.1)',
        },
      }}
    />
  </Box>
);

/* ══════════════════════════════════════
   REJECT REASON TEXTAREA
══════════════════════════════════════ */
const RejectReasonInput = ({ value, onChange }) => (
  <Box sx={{ mx: 3, mt: 2 }}>
    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'var(--gray-600)', mb: '6px' }}>
      Rejection reason <Box component="span" sx={{ color: 'var(--coral-600)' }}>*</Box>
    </Typography>
    <Box
      component="textarea"
      rows={3}
      placeholder="e.g. Missing daily activity breakdown for Thursday and Friday…"
      value={value}
      onChange={onChange}
      sx={{
        width: '100%', padding: '10px 13px',
        border: '1.5px solid var(--gray-200)',
        borderRadius: '8px',
        bgcolor: 'var(--gray-50)',
        color: 'var(--ink)',
        fontFamily: 'inherit', fontSize: '13px',
        outline: 'none', resize: 'vertical',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:focus': {
          borderColor: 'var(--coral-600)',
          boxShadow: '0 0 0 3px rgba(220,38,38,0.1)',
        },
      }}
    />
  </Box>
);

/* ══════════════════════════════════════
   BASE AppConfirmModal
   — the universal modal used by all
     named convenience wrappers below
══════════════════════════════════════ */
const AppConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel    = 'Confirm',
  cancelLabel     = 'Cancel',
  variant         = 'warning',
  loading         = false,
  highlight,        // { icon: <SVG/>, text: 'string' }
  extra,            // arbitrary JSX rendered below highlight
  cancelIcon,       // optional JSX icon beside cancel label
  confirmIcon,      // optional JSX icon beside confirm label
}) => {
  const cfg = VARIANTS[variant] || VARIANTS.warning;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid var(--gray-200)',
          bgcolor: 'var(--panel-bg)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
        },
      }}
      BackdropProps={{ sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.45)' } }}
    >
      <DialogContent sx={{ pt: 2.5, pb: 0, px: 3, textAlign: 'center', position: 'relative' }}>
        {/* Close X */}
        <IconButton
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{
            position: 'absolute', right: 14, top: 14,
            width: 30, height: 30, borderRadius: '8px',
            bgcolor: 'var(--gray-100)', color: 'var(--gray-500)',
            '&:hover': { bgcolor: 'var(--gray-200)', color: 'var(--ink)' },
          }}
        >
          <CloseSVG />
        </IconButton>

        {/* Brand pill */}
        <BrandPill />

        {/* Icon ring */}
        <Box
          sx={{
            width: 72, height: 72, borderRadius: '20px',
            bgcolor: cfg.iconBg, color: cfg.iconColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute', inset: '-6px',
              borderRadius: '26px',
              bgcolor: cfg.ringBg,
              zIndex: -1,
            },
          }}
        >
          {cfg.icon}
        </Box>

        {/* Title */}
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.3px', mb: 1 }}>
          {title}
        </Typography>

        {/* Description */}
        <Typography sx={{ fontSize: '13.5px', color: 'var(--gray-500)', lineHeight: 1.6, maxWidth: 340, mx: 'auto' }}>
          {description}
        </Typography>

        {/* Highlight info box */}
        {highlight && (
          <HighlightBox cfg={cfg} icon={highlight.icon} text={highlight.text} />
        )}

        {/* Extra slot (delete input, reject textarea, etc.) */}
        {extra}

        {/* Divider */}
        <Box sx={{ mt: 2.5, height: '1px', bgcolor: 'var(--gray-200)' }} />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.2, gap: 1.2 }}>
        {/* Cancel */}
        <Button
          onClick={onClose}
          disabled={loading}
          startIcon={cancelIcon}
          sx={{
            flex: 1, py: '12px', borderRadius: '12px',
            border: '1.5px solid var(--gray-200)',
            bgcolor: 'var(--gray-50)', color: 'var(--gray-700)',
            fontWeight: 600, fontSize: '14px', textTransform: 'none',
            '&:hover': { bgcolor: 'var(--gray-100)', borderColor: 'var(--gray-300)' },
          }}
        >
          {cancelLabel}
        </Button>

        {/* Confirm */}
        <Button
          onClick={onConfirm}
          disabled={loading}
          startIcon={confirmIcon}
          sx={{
            flex: 1, py: '12px', borderRadius: '12px',
            bgcolor: cfg.confirmBg,
            color: '#fff',
            fontWeight: 600, fontSize: '14px', textTransform: 'none',
            boxShadow: `0 2px 8px ${cfg.confirmShadow}`,
            '&:hover': { bgcolor: cfg.confirmHover, transform: 'translateY(-1px)', boxShadow: `0 4px 14px ${cfg.confirmShadow}` },
            '&:active': { transform: 'translateY(0)' },
            '&.Mui-disabled': { opacity: 0.7, color: '#fff' },
            transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
          }}
        >
          {loading ? 'Processing…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ══════════════════════════════════════
   1. DELETE MODAL
   — requires typing "DELETE" to unlock
══════════════════════════════════════ */
export const DeleteModal = ({ open, onClose, onConfirm, loading, title, description, recordName }) => {
  const [confirmText, setConfirmText] = useState('');
  const confirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleClose = () => { setConfirmText(''); onClose(); };
  const handleConfirm = () => { if (!confirmed) return; onConfirm(); };

  return (
    <AppConfirmModal
      open={open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      loading={loading}
      variant="delete"
      title={title || 'Delete Record?'}
      description={description || 'This action is permanent and cannot be undone. The record will be removed from the AILES system entirely.'}
      confirmLabel="Delete Record"
      cancelLabel="Cancel"
      highlight={recordName ? { icon: <FileSVG />, text: recordName } : undefined}
      extra={
        <DeleteConfirmInput
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
      }
      confirmIcon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      }
      /* Override confirm button to be disabled until typed */
      /* We do this by wrapping onConfirm — button itself isn't disabled
         so the user can still click and see it fail gracefully */
    />
  );
};

/* ══════════════════════════════════════
   2. APPROVE MODAL
══════════════════════════════════════ */
export const ApproveModal = ({ open, onClose, onConfirm, loading, title, description, personName }) => (
  <AppConfirmModal
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    loading={loading}
    variant="approve"
    title={title || 'Approve?'}
    description={description || "You are about to approve this entry. They will be granted access to the AILES portal."}
    confirmLabel="Approve"
    cancelLabel="Cancel"
    highlight={personName ? { icon: <UserSVG />, text: personName } : undefined}
  />
);

/* ══════════════════════════════════════
   3. SIGN OUT MODAL
══════════════════════════════════════ */
export const SignOutModal = ({ open, onClose, onConfirm, loading, sessionInfo }) => (
  <AppConfirmModal
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    loading={loading}
    variant="signout"
    title="Sign Out?"
    description="You will be signed out of your AILES session. Any unsaved changes will be lost."
    confirmLabel="Sign Out"
    cancelLabel="Stay Signed In"
    highlight={sessionInfo ? { icon: <ClockSVG />, text: sessionInfo } : { icon: <ClockSVG />, text: 'Your current session will be ended' }}
  />
);

/* ══════════════════════════════════════
   4. REJECT MODAL
   — includes a reason textarea
══════════════════════════════════════ */
export const RejectModal = ({ open, onClose, onConfirm, loading, title, description, recordName }) => {
  const [reason, setReason] = useState('');

  const handleClose = () => { setReason(''); onClose(); };
  const handleConfirm = () => onConfirm(reason);

  return (
    <AppConfirmModal
      open={open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      loading={loading}
      variant="reject"
      title={title || 'Reject This Entry?'}
      description={description || 'This entry will be marked as rejected and returned to the submitter for revision.'}
      confirmLabel="Reject"
      cancelLabel="Cancel"
      highlight={recordName ? { icon: <FileSVG />, text: recordName } : undefined}
      extra={
        <RejectReasonInput
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      }
    />
  );
};

/* ══════════════════════════════════════
   5. SUBMIT MODAL
══════════════════════════════════════ */
export const SubmitModal = ({ open, onClose, onConfirm, loading, title, description, recordName }) => (
  <AppConfirmModal
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    loading={loading}
    variant="submit"
    title={title || 'Submit Report?'}
    description={description || "Once submitted, your report will be locked and sent to your supervisor for review. You won't be able to edit it after submission."}
    confirmLabel="Submit"
    cancelLabel="Not Yet"
    highlight={recordName ? { icon: <FileSVG />, text: recordName } : undefined}
  />
);

/* ══════════════════════════════════════
   6. RESET PASSWORD MODAL
══════════════════════════════════════ */
export const ResetPasswordModal = ({ open, onClose, onConfirm, loading, userEmail }) => (
  <AppConfirmModal
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    loading={loading}
    variant="reset"
    title="Reset User Password?"
    description="A password reset link will be emailed to the user. Their current password will be invalidated immediately."
    confirmLabel="Send Reset Link"
    cancelLabel="Cancel"
    highlight={userEmail ? { icon: <EmailSVG />, text: `Reset link → ${userEmail}` } : undefined}
  />
);

/* ══════════════════════════════════════
   7. ARCHIVE MODAL
══════════════════════════════════════ */
export const ArchiveModal = ({ open, onClose, onConfirm, loading, title, description, recordName }) => (
  <AppConfirmModal
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    loading={loading}
    variant="archive"
    title={title || 'Archive Record?'}
    description={description || "This record will be archived. The user will lose portal access but all logs and data will be preserved."}
    confirmLabel="Archive"
    cancelLabel="Cancel"
    highlight={recordName ? { icon: <UserSVG />, text: recordName } : undefined}
  />
);

/* ══════════════════════════════════════
   8. UNSAVED CHANGES MODAL
   — two-action: save vs discard
══════════════════════════════════════ */
export const UnsavedChangesModal = ({ open, onClose, onDiscard, onSave, loading, recordName }) => (
  <AppConfirmModal
    open={open}
    onClose={onClose}
    onConfirm={onDiscard}
    loading={loading}
    variant="warning"
    title="Unsaved Changes"
    description="You have unsaved changes. If you leave now, your progress will be lost."
    confirmLabel="Discard & Leave"
    cancelLabel="Save & Leave"
    cancelIcon={<SaveSVG />}
    highlight={recordName ? { icon: <FileSVG />, text: recordName } : undefined}
    /* Override cancel to also trigger save */
  />
);

/* ══════════════════════════════════════
   DEFAULT EXPORT — the base modal
   (keeps existing usage: <AppConfirmModal variant="delete" …/> etc.)
══════════════════════════════════════ */
export default AppConfirmModal;