import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import AuthShell from '../../components/Auth/AuthShell';
import { authAPI } from '../../services/api';
import { notifySuccess } from '../../components/Common/AppToast';

/* ══════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════ */
const fieldSx = { mb: 2 };

const labelSx = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--gray-700)',
  mb: '6px',
  letterSpacing: '0.2px',
};

const baseInputSx = {
  width: '100%',
  padding: '11px 13px 11px 38px',
  border: '1.5px solid var(--input-border)',
  borderRadius: '10px',
  background: 'var(--input-bg)',
  color: 'var(--ink)',
  fontFamily: 'inherit',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  '&::placeholder': { color: 'var(--placeholder)' },
  '&:focus': {
    borderColor: 'var(--input-focus)',
    boxShadow: '0 0 0 3px rgba(46,139,91,0.12)',
    background: 'var(--panel-bg)',
  },
};

const submitBtnSx = {
  width: '100%',
  py: '13px',
  borderRadius: '10px',
  background: 'var(--green-900)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '15px',
  letterSpacing: '0.2px',
  boxShadow: '0 2px 8px rgba(26,92,58,0.3)',
  textTransform: 'none',
  mt: '6px',
  transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    background: 'var(--green-700)',
    boxShadow: '0 4px 16px rgba(26,92,58,0.4)',
    transform: 'translateY(-1px)',
  },
  '&:active': { transform: 'translateY(0)' },
  '&.Mui-disabled': { opacity: 0.7, pointerEvents: 'none', color: '#fff' },
};

/* ══════════════════════════════════════
   INLINE SVG ICONS
══════════════════════════════════════ */
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--placeholder)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--placeholder)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const MailCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const AlertCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15} style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15} style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const EyeOnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ══════════════════════════════════════
   REUSABLE SUB-COMPONENTS
══════════════════════════════════════ */

/* Step icon ring */
const StepIcon = ({ children }) => (
  <Box
    sx={{
      width: 52, height: 52,
      borderRadius: '14px',
      bgcolor: 'var(--green-50)',
      border: '1px solid var(--green-100)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      mb: 2,
    }}
  >
    {children}
  </Box>
);

/* Alert banner */
const AlertBanner = ({ type = 'error', children }) => {
  const styles = {
    error: {
      bg: 'var(--coral-100)', color: 'var(--coral-700)',
      border: '1px solid rgba(192,57,43,0.2)', icon: <AlertCircleIcon />,
    },
    info: {
      bg: 'var(--amber-100)', color: '#92400E',
      border: '1px solid rgba(245,158,11,0.2)', icon: <InfoIcon />,
    },
    success: {
      bg: 'var(--green-100)', color: 'var(--green-900)',
      border: '1px solid rgba(46,139,91,0.2)', icon: <AlertCircleIcon />,
    },
  };
  const s = styles[type];
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '11px 14px', borderRadius: '10px',
        fontSize: '13px', mb: 2.5, lineHeight: 1.4,
        background: s.bg, color: s.color, border: s.border,
        animation: 'slideIn 0.3s ease both',
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateY(-6px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {s.icon}
      <span>{children}</span>
    </Box>
  );
};

/* Icon-prefixed input */
const IconInput = ({ id, type = 'text', placeholder, value, onChange, icon, rightSlot }) => (
  <Box sx={inputWrapSx}>
    <Box component="span" sx={{ position: 'absolute', left: '13px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
      {icon}
    </Box>
    <Box
      component="input"
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      sx={{ ...baseInputSx, pr: rightSlot ? '42px' : '13px' }}
    />
    {rightSlot && (
      <Box component="span" sx={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center' }}>
        {rightSlot}
      </Box>
    )}
  </Box>
);

const inputWrapSx = { position: 'relative', display: 'flex', alignItems: 'center' };

/* Eye toggle button */
const EyeBtn = ({ show, onToggle }) => (
  <Box
    component="button"
    type="button"
    onClick={onToggle}
    sx={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: 'var(--gray-400)', p: '2px',
      display: 'flex', alignItems: 'center',
      transition: 'color 0.15s',
      '&:hover': { color: 'var(--gray-600)' },
    }}
  >
    {show ? <EyeOffIcon /> : <EyeOnIcon />}
  </Box>
);

/* Password strength meter */
const strengthColors = ['', '#C0392B', '#F59E0B', '#2E8B5B', '#1A5C3A'];
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

const getStrength = (v) => {
  let score = 0;
  if (v.length >= 8)            score++;
  if (/[A-Z]/.test(v))          score++;
  if (/[0-9]/.test(v))          score++;
  if (/[^A-Za-z0-9]/.test(v))   score++;
  return score;
};

const StrengthBar = ({ value }) => {
  const score = getStrength(value);
  const color = strengthColors[score] || 'var(--gray-200)';
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: '4px', mt: '8px' }}>
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1, height: '3px', borderRadius: '99px',
              background: i < score ? color : 'var(--gray-200)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </Box>
      {value.length > 0 && (
        <Typography sx={{ fontSize: '11px', color, textAlign: 'right', mt: '5px' }}>
          {strengthLabels[score]}
        </Typography>
      )}
    </Box>
  );
};

/* ══════════════════════════════════════
   FORGOT PASSWORD PAGE
══════════════════════════════════════ */
const ForgotPasswordPage = () => {
  const [step, setStep]                   = useState(1);
  const [email, setEmail]                 = useState('');
  const [otp, setOtp]                     = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  /* ── Step 1: request code ── */
  const requestCode = async (e, isResend = false) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPasswordRequest(email);
      notifySuccess('If the email exists, a reset code has been issued.', { title: 'Code Sent' });
      if (!isResend) {
        setStep(2);
        setOtp(['', '', '', '', '', '']);
      }
    } catch {
      setError('Unable to process request at the moment.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: verify OTP ── */
  const verifyOtp = (e) => {
    e.preventDefault();
    if (otp.join('').length < 6) {
      setError('Invalid code. Please enter all 6 digits.');
      return;
    }
    setError('');
    setStep(3);
  };

  /* ── Step 3: reset password ── */
  const resetPassword = async (e) => {
    e.preventDefault();
    const joinedCode = otp.join('');
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPasswordConfirm({
        email,
        code: joinedCode,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      notifySuccess('Password updated successfully.', { title: 'Password Updated' });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code or password details.');
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP input handlers ── */
  const handleOtpInput = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <AuthShell mode="forgot">

      {/* ════ STEP 1 — Email ════ */}
      {step === 1 && (
        <Box component="form" onSubmit={requestCode}>
          <StepIcon>
            <LockIcon style={{ width: 24, height: 24 }} />
          </StepIcon>

          <Typography sx={{ fontSize: '28px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.5px', lineHeight: 1.15, mb: '6px' }}>
            Reset password
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'var(--gray-500)', mb: 3.5, lineHeight: 1.5 }}>
            Enter your registered email address and we'll send you a verification code.
          </Typography>

          {error && <AlertBanner type="error">{error}</AlertBanner>}

          <Box sx={fieldSx}>
            <Box component="label" htmlFor="fp-email" sx={labelSx}>
              Email address <Box component="span" sx={{ color: 'var(--green-600)', ml: '2px' }}>*</Box>
            </Box>
            <IconInput
              id="fp-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<EmailIcon />}
            />
          </Box>

          <Button type="submit" disabled={loading} sx={submitBtnSx}>
            {loading ? 'Sending…' : 'Send Reset Code'}
          </Button>

          <Typography sx={{ mt: 2.5, textAlign: 'center', fontSize: '13.5px', color: 'var(--gray-500)' }}>
            <Link component={RouterLink} to="/login" sx={{ color: 'var(--green-600)', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              ← Back to Sign In
            </Link>
          </Typography>
        </Box>
      )}

      {/* ════ STEP 2 — OTP ════ */}
      {step === 2 && (
        <Box component="form" onSubmit={verifyOtp}>
          <StepIcon><MailCheckIcon /></StepIcon>

          <Typography sx={{ fontSize: '28px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.5px', lineHeight: 1.15, mb: '6px' }}>
            Check your email
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'var(--gray-500)', mb: 3.5, lineHeight: 1.5 }}>
            We sent a 6-digit code to{' '}
            <Box component="strong" sx={{ color: 'var(--ink)', fontWeight: 600 }}>{email || 'your email'}</Box>.
            {' '}Enter it below.
          </Typography>

          {error && <AlertBanner type="error">{error}</AlertBanner>}

          {/* OTP boxes */}
          <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'center', mb: 2.5 }}>
            {otp.map((value, index) => (
              <Box
                key={index}
                id={`otp-${index}`}
                component="input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handleOtpInput(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                sx={{
                  width: { xs: '44px', sm: '52px' },
                  height: { xs: '50px', sm: '56px' },
                  textAlign: 'center',
                  border: '1.5px solid var(--input-border)',
                  borderRadius: '10px',
                  bgcolor: 'var(--input-bg)',
                  color: 'var(--ink)',
                  fontFamily: 'monospace',
                  fontSize: { xs: '18px', sm: '20px' },
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:focus': {
                    borderColor: 'var(--input-focus)',
                    boxShadow: '0 0 0 3px rgba(46,139,91,0.12)',
                  },
                }}
              />
            ))}
          </Box>

          <Button type="submit" sx={submitBtnSx}>Verify Code</Button>

          <Typography sx={{ mt: 2, textAlign: 'center', fontSize: '13.5px', color: 'var(--gray-500)' }}>
            Didn&apos;t get a code?{' '}
            <Link
              component="button"
              type="button"
              onClick={(e) => requestCode(e, true)}
              sx={{ fontSize: '13.5px', color: 'var(--green-600)', fontWeight: 500, textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              Resend
            </Link>
          </Typography>
        </Box>
      )}

      {/* ════ STEP 3 — New password ════ */}
      {step === 3 && (
        <Box component="form" onSubmit={resetPassword}>
          <StepIcon><ShieldIcon /></StepIcon>

          <Typography sx={{ fontSize: '28px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.5px', lineHeight: 1.15, mb: '6px' }}>
            Set new password
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'var(--gray-500)', mb: 3.5, lineHeight: 1.5 }}>
            Choose a strong password you haven&apos;t used before.
          </Typography>

          {error && <AlertBanner type="error">{error}</AlertBanner>}

          {/* New password */}
          <Box sx={fieldSx}>
            <Box component="label" htmlFor="fp-newpw" sx={labelSx}>
              New Password <Box component="span" sx={{ color: 'var(--green-600)', ml: '2px' }}>*</Box>
            </Box>
            <IconInput
              id="fp-newpw"
              type={showNewPw ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<LockIcon />}
              rightSlot={<EyeBtn show={showNewPw} onToggle={() => setShowNewPw((v) => !v)} />}
            />
            <StrengthBar value={newPassword} />
          </Box>

          {/* Confirm password */}
          <Box sx={fieldSx}>
            <Box component="label" htmlFor="fp-confirmpw" sx={labelSx}>
              Confirm Password <Box component="span" sx={{ color: 'var(--green-600)', ml: '2px' }}>*</Box>
            </Box>
            <IconInput
              id="fp-confirmpw"
              type={showConfirmPw ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<LockIcon />}
              rightSlot={<EyeBtn show={showConfirmPw} onToggle={() => setShowConfirmPw((v) => !v)} />}
            />
          </Box>

          <Button type="submit" disabled={loading} sx={submitBtnSx}>
            {loading ? 'Updating…' : 'Update Password'}
          </Button>
        </Box>
      )}

      {/* ════ STEP 4 — Success ════ */}
      {step === 4 && (
        <Stack spacing={2.5} sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 52, height: 52,
              borderRadius: '14px',
              bgcolor: 'var(--green-100)',
              border: '1px solid var(--green-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto',
            }}
          >
            <CheckCircleIcon />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '28px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.5px', mb: '6px' }}>
              Password updated!
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: 1.5 }}>
              Your password has been changed successfully. You can now sign in with your new credentials.
            </Typography>
          </Box>

          <Button component={RouterLink} to="/login" sx={{ ...submitBtnSx, mt: 1 }}>
            Go to Sign In
          </Button>
        </Stack>
      )}

      {/* Back to sign-in (steps 1–3) */}
      {step !== 4 && (
        <Typography sx={{ mt: 3, textAlign: 'center', fontSize: '13.5px', color: 'var(--gray-500)' }}>
          <Link
            component={RouterLink}
            to="/login"
            sx={{ color: 'var(--green-600)', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            ← Back to Sign In
          </Link>
        </Typography>
      )}
    </AuthShell>
  );
};

export default ForgotPasswordPage;