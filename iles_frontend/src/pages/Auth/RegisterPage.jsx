import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Checkbox, CircularProgress, FormControlLabel, Link, Stack, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/Auth/AuthShell';
import { notifyError, notifyInfo } from '../../components/Common/AppToast';

/* ══════════════════════════════════════
   SHARED STYLE TOKENS
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

const noIconInputSx = { ...baseInputSx, padding: '11px 13px' };

const inputWrapSx = { position: 'relative', display: 'flex', alignItems: 'center' };

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
   INLINE SVGS
══════════════════════════════════════ */
const svgBase = { fill: 'none', stroke: 'var(--placeholder)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const UserIcon = () => (
  <svg viewBox="0 0 24 24" {...svgBase} width={15} height={15}>
    <circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
  </svg>
);
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" {...svgBase} width={15} height={15}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" {...svgBase} width={15} height={15}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
  </svg>
);
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" {...svgBase} width={15} height={15}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" {...svgBase} width={15} height={15}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" {...svgBase} width={15} height={15}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" {...svgBase} width={15} height={15}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
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

/* Role card icons */
const GraduateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const SupervisorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const AcademicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/* ══════════════════════════════════════
   REUSABLE SUB-COMPONENTS
══════════════════════════════════════ */

/* Icon-prefixed input */
const IconInput = ({ id, type = 'text', placeholder, value, onChange, name, icon, rightSlot }) => (
  <Box sx={inputWrapSx}>
    <Box component="span" sx={{ position: 'absolute', left: '13px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
      {icon}
    </Box>
    <Box
      component="input"
      id={id}
      name={name}
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

/* No-icon input */
const PlainInput = ({ id, type = 'text', placeholder, value, onChange, name }) => (
  <Box component="input"
    id={id} name={name} type={type} placeholder={placeholder}
    value={value} onChange={onChange}
    sx={noIconInputSx}
  />
);

/* Eye toggle button */
const EyeBtn = ({ show, onToggle }) => (
  <Box component="button" type="button" onClick={onToggle}
    sx={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', p: '2px', display: 'flex', alignItems: 'center', transition: 'color 0.15s', '&:hover': { color: 'var(--gray-600)' } }}
  >
    {show ? <EyeOffIcon /> : <EyeOnIcon />}
  </Box>
);

/* Password strength bar */
const strengthColors = ['', '#C0392B', '#F59E0B', '#2E8B5B', '#1A5C3A'];
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const getStrength = (v) => {
  let s = 0;
  if (v.length >= 8)           s++;
  if (/[A-Z]/.test(v))         s++;
  if (/[0-9]/.test(v))         s++;
  if (/[^A-Za-z0-9]/.test(v))  s++;
  return s;
};
const StrengthBar = ({ value }) => {
  const score = getStrength(value);
  const color = strengthColors[score] || 'var(--gray-200)';
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: '4px', mt: '8px' }}>
        {[0, 1, 2, 3].map((i) => (
          <Box key={i} sx={{ flex: 1, height: '3px', borderRadius: '99px', background: i < score ? color : 'var(--gray-200)', transition: 'background 0.3s' }} />
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

/* Field wrapper with label */
const Field = ({ label, required: req, children, half }) => (
  <Box sx={{ ...fieldSx, ...(half ? {} : {}) }}>
    <Box component="label" sx={labelSx}>
      {label}{req && <Box component="span" sx={{ color: 'var(--green-600)', ml: '2px' }}>*</Box>}
    </Box>
    {children}
  </Box>
);

/* Two-column grid row */
const FieldRow = ({ children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '12px' }}>
    {children}
  </Box>
);

/* Role cards data */
const ROLES = [
  { value: 'student',              label: 'Student Intern',       icon: <GraduateIcon /> },
  { value: 'workplace_supervisor', label: 'Supervisor',           icon: <SupervisorIcon /> },
  { value: 'academic_supervisor',  label: 'Academic Supervisor',  icon: <AcademicIcon /> },
];

/* ══════════════════════════════════════
   REGISTER PAGE
══════════════════════════════════════ */
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', password2: '',
    first_name: '', last_name: '', other_names: '',
    role: 'student', phone: '', alternative_phone: '',
    country: '', city: '', department: '',
    organization_name: '', position: '', company: '',
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPw, setShowPw]           = useState(false);
  const [showPw2, setShowPw2]         = useState(false);
  const [loading, setLoading]         = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!acceptTerms) {
      notifyError('You must agree to the Terms of Service and Privacy Policy.', { title: 'Registration Failed' });
      setLoading(false);
      return;
    }

    const submitData = {
      username: formData.username, email: formData.email,
      password: formData.password, password2: formData.password2,
      first_name: formData.first_name, last_name: formData.last_name,
      other_names: formData.other_names, role: formData.role,
      phone: formData.phone, alternative_phone: formData.alternative_phone,
      country: formData.country, city: formData.city,
    };

    if (formData.role === 'student') {
      submitData.department = formData.department;
    } else if (formData.role === 'academic_supervisor') {
      submitData.organization_name = formData.organization_name;
      submitData.position          = formData.position;
      submitData.department        = formData.department;
    } else if (formData.role === 'workplace_supervisor') {
      submitData.organization_name = formData.organization_name;
      submitData.position          = formData.position;
      submitData.company           = formData.company;
    }

    try {
      const result = await register(submitData);
      if (result?.approval_required) {
        notifyInfo('You can login once now. Further access requires admin approval.', { title: 'Approval Required' });
        navigate('/login');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data) {
        const errs = [];
        for (const [field, messages] of Object.entries(err.response.data)) {
          errs.push(Array.isArray(messages) ? `${field}: ${messages.join(', ')}` : messages);
        }
        notifyError(errs.join(' | '), { title: 'Registration Failed' });
      } else {
        notifyError('Registration failed. Please try again.', { title: 'Registration Failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  const r = formData.role;

  return (
    <AuthShell mode="signup">
      {/* Title */}
      <Typography sx={{ fontSize: '28px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.5px', lineHeight: 1.15, mb: '6px' }}>
        Create account
      </Typography>
      <Typography sx={{ fontSize: '14px', color: 'var(--gray-500)', mb: 3.5, lineHeight: 1.5 }}>
        Fill in your details to get started with AILES.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>

        {/* ── Role cards ── */}
        <Box component="span" sx={labelSx}>
          Select your role <Box component="span" sx={{ color: 'var(--green-600)', ml: '2px' }}>*</Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', mb: 2.5 }}>
          {ROLES.map(({ value, label, icon }) => {
            const selected = formData.role === value;
            return (
              <Box
                key={value}
                onClick={() => setFormData({ ...formData, role: value })}
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', padding: '14px 8px',
                  border: '1.5px solid',
                  borderColor: selected ? 'var(--green-600)' : 'var(--input-border)',
                  borderRadius: '10px',
                  bgcolor: selected ? 'var(--green-50)' : 'var(--input-bg)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  userSelect: 'none',
                  transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s',
                  boxShadow: selected ? '0 0 0 3px rgba(46,139,91,0.12)' : 'none',
                  '&:hover': {
                    borderColor: 'var(--green-400)',
                    bgcolor: 'var(--green-50)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(26,92,58,0.1)',
                  },
                }}
              >
                {/* Icon bubble */}
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: selected ? 'var(--green-100)' : 'var(--gray-100)',
                    color: selected ? 'var(--green-700)' : 'var(--gray-500)',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {icon}
                </Box>
                <Typography sx={{ fontSize: '11.5px', fontWeight: 500, color: selected ? 'var(--green-900)' : 'var(--gray-600)', lineHeight: 1.2 }}>
                  {label}
                </Typography>
                {/* Check dot */}
                <Box
                  sx={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '1.5px solid',
                    borderColor: selected ? 'var(--green-600)' : 'var(--gray-300)',
                    bgcolor: selected ? 'var(--green-600)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {selected && (
                    <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={8} height={8}>
                      <polyline points="1.5,5 4,7.5 8.5,2" />
                    </svg>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── Name row ── */}
        <FieldRow>
          <Field label="First Name" required>
            <PlainInput id="su-firstname" name="first_name" placeholder="First name" value={formData.first_name} onChange={handleChange} />
          </Field>
          <Field label="Last Name" required>
            <PlainInput id="su-lastname" name="last_name" placeholder="Last name" value={formData.last_name} onChange={handleChange} />
          </Field>
        </FieldRow>

        {/* ── Other names ── */}
        <Field label="Other Names">
          <PlainInput id="su-othernames" name="other_names" placeholder="Middle / other names" value={formData.other_names} onChange={handleChange} />
        </Field>

        {/* ── Username + Email ── */}
        <FieldRow>
          <Field label="Username" required>
            <IconInput id="su-username" name="username" placeholder="Choose username" value={formData.username} onChange={handleChange} icon={<UserIcon />} />
          </Field>
          <Field label="Email" required>
            <IconInput id="su-email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} icon={<EmailIcon />} />
          </Field>
        </FieldRow>

        {/* ── Phone ── */}
        <FieldRow>
          <Field label="Phone" required>
            <IconInput id="su-phone" name="phone" type="tel" placeholder="+233 XX XXX XXXX" value={formData.phone} onChange={handleChange} icon={<PhoneIcon />} />
          </Field>
          <Field label="Alternative Phone">
            <IconInput id="su-altphone" name="alternative_phone" type="tel" placeholder="Optional" value={formData.alternative_phone} onChange={handleChange} icon={<PhoneIcon />} />
          </Field>
        </FieldRow>

        {/* ── Country + City ── */}
        <FieldRow>
          <Field label="Country" required>
            <IconInput id="su-country" name="country" placeholder="e.g. Ghana" value={formData.country} onChange={handleChange} icon={<HomeIcon />} />
          </Field>
          <Field label="City">
            <IconInput id="su-city" name="city" placeholder="e.g. Accra" value={formData.city} onChange={handleChange} icon={<HomeIcon />} />
          </Field>
        </FieldRow>

        {/* ── Role-specific fields ── */}
        {r === 'student' && (
          <Field label="Department">
            <IconInput id="su-dept" name="department" placeholder="e.g. Engineering, Finance…" value={formData.department} onChange={handleChange} icon={<BuildingIcon />} />
          </Field>
        )}

        {r === 'academic_supervisor' && (
          <>
            <Field label="Institution / University" required>
              <IconInput id="su-org" name="organization_name" placeholder="e.g. KNUST, UG…" value={formData.organization_name} onChange={handleChange} icon={<BuildingIcon />} />
            </Field>
            <Field label="Department" required>
              <IconInput id="su-dept" name="department" placeholder="e.g. Computer Science" value={formData.department} onChange={handleChange} icon={<BuildingIcon />} />
            </Field>
            <Field label="Position / Title" required>
              <IconInput id="su-pos" name="position" placeholder="e.g. Senior Lecturer" value={formData.position} onChange={handleChange} icon={<BriefcaseIcon />} />
            </Field>
          </>
        )}

        {r === 'workplace_supervisor' && (
          <>
            <Field label="Company Name" required>
              <IconInput id="su-org" name="organization_name" placeholder="e.g. Ashesi University" value={formData.organization_name} onChange={handleChange} icon={<BuildingIcon />} />
            </Field>
            <FieldRow>
              <Field label="Position" required>
                <IconInput id="su-pos" name="position" placeholder="e.g. HR Manager" value={formData.position} onChange={handleChange} icon={<BriefcaseIcon />} />
              </Field>
              <Field label="Company Department">
                <IconInput id="su-company" name="company" placeholder="e.g. Operations" value={formData.company} onChange={handleChange} icon={<BuildingIcon />} />
              </Field>
            </FieldRow>
          </>
        )}

        {/* ── Passwords ── */}
        <FieldRow>
          <Field label="Password" required>
            <IconInput
              id="su-password" name="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={formData.password} onChange={handleChange}
              icon={<LockIcon />}
              rightSlot={<EyeBtn show={showPw} onToggle={() => setShowPw((v) => !v)} />}
            />
            <StrengthBar value={formData.password} />
          </Field>
          <Field label="Confirm Password" required>
            <IconInput
              id="su-confirm" name="password2"
              type={showPw2 ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={formData.password2} onChange={handleChange}
              icon={<LockIcon />}
              rightSlot={<EyeBtn show={showPw2} onToggle={() => setShowPw2((v) => !v)} />}
            />
          </Field>
        </FieldRow>

        {/* ── Terms ── */}
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              size="small"
              sx={{ color: 'var(--gray-300)', '&.Mui-checked': { color: 'var(--green-600)' }, p: '4px 8px 4px 4px' }}
            />
          }
          label={
            <Typography sx={{ fontSize: '13px', color: 'var(--gray-500)' }}>
              I agree to the{' '}
              <Link href="#" sx={{ color: 'var(--green-600)' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" sx={{ color: 'var(--green-600)' }}>Privacy Policy</Link>
            </Typography>
          }
          sx={{ mb: 1, alignItems: 'flex-start', '& .MuiFormControlLabel-root': { alignItems: 'flex-start' } }}
        />

        {/* ── Submit ── */}
        <Button type="submit" disabled={loading} sx={submitBtnSx}>
          {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Create Account'}
        </Button>
      </Box>

      {/* Switch to sign in */}
      <Typography sx={{ mt: 2.5, textAlign: 'center', fontSize: '13.5px', color: 'var(--gray-500)' }}>
        Already have an account?{' '}
        <Link
          component={RouterLink}
          to="/login"
          sx={{ color: 'var(--green-600)', fontWeight: 500, textDecoration: 'none', '&:hover': { color: 'var(--green-900)', textDecoration: 'underline' } }}
        >
          Sign In
        </Link>
      </Typography>
    </AuthShell>
  );
};

export default RegisterPage;