import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Checkbox, FormControlLabel, Link, Stack, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/Auth/AuthShell';

/* ── Shared field style ── */
const fieldSx = {
  mb: 2,
  '& label': {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--gray-700)',
    mb: '6px',
    letterSpacing: '0.2px',
  },
};

const inputWrapSx = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const inputSx = {
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
  appearance: 'none',
  '&::placeholder': { color: 'var(--placeholder)' },
  '&:focus': {
    borderColor: 'var(--input-focus)',
    boxShadow: '0 0 0 3px rgba(46,139,91,0.12)',
    background: 'var(--panel-bg)',
  },
};

/* ── Inline SVG icon helpers ── */
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--placeholder)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--placeholder)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const EyeOnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const AlertCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15} style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ── Icon-prefixed input ── */
const IconInput = ({ id, type = 'text', placeholder, value, onChange, icon, rightSlot }) => (
  <Box component="div" sx={inputWrapSx}>
    <Box
      component="span"
      sx={{
        position: 'absolute',
        left: '13px',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
        color: 'var(--placeholder)',
        transition: 'color 0.2s',
      }}
    >
      {icon}
    </Box>
    <Box
      component="input"
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      sx={{
        ...inputSx,
        pr: rightSlot ? '42px' : '13px',
      }}
    />
    {rightSlot && (
      <Box
        component="span"
        sx={{
          position: 'absolute',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {rightSlot}
      </Box>
    )}
  </Box>
);

/* ══════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════ */
const LoginPage = () => {
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const { login }                     = useAuth();
  const navigate                      = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell mode="signin">
      {/* Title */}
      <Typography
        sx={{
          fontSize: '28px',
          fontWeight: 600,
          color: 'var(--ink)',
          letterSpacing: '-0.5px',
          lineHeight: 1.15,
          mb: '6px',
        }}
      >
        Welcome back
      </Typography>
      <Typography sx={{ fontSize: '14px', color: 'var(--gray-500)', mb: 3.5, lineHeight: 1.5 }}>
        Sign in to your AILES account to continue.
      </Typography>

      {/* Error alert */}
      {error && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '11px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            mb: 2.5,
            lineHeight: 1.4,
            background: 'var(--coral-100)',
            color: 'var(--coral-700)',
            border: '1px solid rgba(192,57,43,0.2)',
            animation: 'slideIn 0.3s ease both',
            '@keyframes slideIn': {
              from: { opacity: 0, transform: 'translateY(-6px)' },
              to:   { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <AlertCircleIcon />
          <span>{error}</span>
        </Box>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        {/* Username */}
        <Box sx={fieldSx}>
          <Box component="label" htmlFor="signin-username">
            Username <Box component="span" sx={{ color: 'var(--green-600)', ml: '2px' }}>*</Box>
          </Box>
          <IconInput
            id="signin-username"
            type="text"
            placeholder="e.g. Eddy-Iles"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<UserIcon />}
          />
        </Box>

        {/* Password */}
        <Box sx={{ ...fieldSx, mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '6px' }}>
            <Box component="label" htmlFor="signin-password" sx={{ fontSize: '12px', fontWeight: 500, color: 'var(--gray-700)', letterSpacing: '0.2px' }}>
              Password <Box component="span" sx={{ color: 'var(--green-600)', ml: '2px' }}>*</Box>
            </Box>
            <Link
              component={RouterLink}
              to="/forgot-password"
              sx={{
                fontSize: '12px',
                color: 'var(--green-600)',
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': { color: 'var(--green-900)', textDecoration: 'underline' },
              }}
            >
              Forgot password?
            </Link>
          </Box>
          <IconInput
            id="signin-password"
            type={showPw ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockIcon />}
            rightSlot={
              <Box
                component="button"
                type="button"
                onClick={() => setShowPw((v) => !v)}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--gray-400)',
                  p: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                  '&:hover': { color: 'var(--gray-600)' },
                }}
              >
                {showPw ? <EyeOffIcon /> : <EyeOnIcon />}
              </Box>
            }
          />
        </Box>

        {/* Remember me */}
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              sx={{
                color: 'var(--gray-300)',
                '&.Mui-checked': { color: 'var(--green-600)' },
                p: '4px 8px 4px 4px',
              }}
            />
          }
          label="Remember me for 30 days"
          sx={{
            mb: 2,
            '& .MuiFormControlLabel-label': { fontSize: '13px', color: 'var(--gray-500)' },
          }}
        />

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          disabled={loading}
          sx={{
            py: '13px',
            borderRadius: '10px',
            background: loading ? 'rgba(26,92,58,0.7)' : 'var(--green-900)',
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
          }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </Box>

      {/* Divider */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2.5 }}>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'var(--gray-200)' }} />
        <Typography sx={{ fontSize: '12px', color: 'var(--placeholder)' }}>or</Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'var(--gray-200)' }} />
      </Box>

      {/* Switch to sign up */}
      <Typography sx={{ textAlign: 'center', fontSize: '13.5px', color: 'var(--gray-500)' }}>
        Don&apos;t have an account?{' '}
        <Link
          component={RouterLink}
          to="/register"
          sx={{ color: 'var(--green-600)', fontWeight: 500, textDecoration: 'none', '&:hover': { color: 'var(--green-900)', textDecoration: 'underline' } }}
        >
          Sign Up
        </Link>
      </Typography>
    </AuthShell>
  );
};

export default LoginPage;