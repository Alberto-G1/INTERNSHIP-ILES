/**
 * AdminProfileEditPage.jsx
 * Editable admin profile form.
 * Design: faithfully ports the HTML edit-mode (photo upload, edit-sections,
 * form-grid, native inputs/selects, sticky edit-actions bar, toggle switches).
 * Logic: all original useState, useEffect, API calls, and navigation preserved exactly.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, LinearProgress, Typography, Switch } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { profileAPI } from '../../../services/api';
import { notifyError, notifySuccess } from '../../../components/Common/AppToast';
import { buildProfileUpdateFormData } from '../../../utils/profileFormData';
import { resolveMediaUrl } from '../../../utils/mediaUrl';

import {
  EditSection,
  FormGrid,
  FormField,
  NativeInput,
  NativeSelect,
  EditActionsBar,
  ProfileBtn,
} from '../../../components/Common/ProfilePrimitives';

/* ── Inline SVGs ── */
const SaveSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const CancelSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CameraSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const UploadSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const UserSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const BriefSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const LockSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

/* ══════════════════════════════════════
   PHOTO UPLOAD SECTION
══════════════════════════════════════ */
const PhotoUploadSection = ({ src, initials, gradient, onFileChange, onRemove }) => {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(src || null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileChange(e);
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
    onRemove?.();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px', p: '20px 24px' }}>
      {/* Avatar with camera overlay */}
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        {preview ? (
          <Box component="img" src={preview} alt="Profile" sx={{ width: 80, height: 80, borderRadius: '20px', objectFit: 'cover', border: '3px solid var(--border2)', boxShadow: 'var(--sh)' }} />
        ) : (
          <Box sx={{ width: 80, height: 80, borderRadius: '20px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', border: '3px solid var(--border2)', boxShadow: 'var(--sh)' }}>
            {initials}
          </Box>
        )}
        {/* Camera overlay */}
        <Box
          onClick={() => fileRef.current?.click()}
          sx={{
            position: 'absolute', inset: 0, borderRadius: '20px',
            bgcolor: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, cursor: 'pointer',
            transition: 'opacity .2s',
            color: '#fff',
            '&:hover': { opacity: 1 },
          }}
        >
          <CameraSVG />
        </Box>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={handleFile} />
      </Box>

      {/* Info + actions */}
      <Box>
        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--tx1)', mb: '6px' }}>
          Upload a profile photo
        </Typography>
        <Typography sx={{ fontSize: '11.5px', color: 'var(--tx3)', mb: '12px' }}>
          JPG or PNG · max 2MB · min 200×200px
        </Typography>
        <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <ProfileBtn variant="outline" icon={<UploadSVG />} onClick={() => fileRef.current?.click()} small>
            Change Photo
          </ProfileBtn>
          <ProfileBtn variant="danger" onClick={handleRemove} small>
            Remove
          </ProfileBtn>
        </Box>
      </Box>
    </Box>
  );
};

/* ══════════════════════════════════════
   PERMISSION TOGGLE ROW
══════════════════════════════════════ */
const PermToggle = ({ label, name, checked, onChange }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: '14px', py: '11px',
      borderRadius: '10px',
      bgcolor: checked ? 'var(--t50)' : 'var(--surface2)',
      border: `1px solid ${checked ? 'var(--t200)' : 'var(--border)'}`,
      transition: 'all .2s',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: checked ? 'var(--t500)' : 'var(--border2)', transition: 'background .2s' }} />
      <Typography sx={{ fontSize: '13px', fontWeight: 500, color: checked ? 'var(--t800)' : 'var(--tx2)' }}>
        {label}
      </Typography>
    </Box>
    <Switch
      checked={checked}
      onChange={onChange}
      name={name}
      size="small"
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--t600)' },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'var(--t400)' },
      }}
    />
  </Box>
);

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
const AdminProfileEditPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [formData, setFormData] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  /* ── Original fetch logic — unchanged ── */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      if (user?.role !== 'admin') {
        navigate('/dashboard');
        notifyError('Access denied', { title: 'Permission Denied' });
        return;
      }
      setProfile(response.data);
      setFormData(response.data);
    } catch {
      setError('Failed to load profile');
      notifyError('Failed to load profile', { title: 'Profile Error' });
    } finally {
      setLoading(false);
    }
  };

  /* ── Original handlers — unchanged ── */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, admin_profile: { ...prev.admin_profile, [name]: value } }));
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, profile_picture: file }));
  };

  const handleAdminToggle = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, admin_profile: { ...prev.admin_profile, [name]: checked } }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await profileAPI.updateProfile(buildProfileUpdateFormData(formData));
      setProfile(response.data);
      setFormData(response.data);
      updateUser(response.data);
      notifySuccess('Profile updated successfully', { title: 'Profile Saved' });
      navigate('/profile');
    } catch {
      notifyError('Failed to update profile', { title: 'Save Failed' });
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <Box>
        <LinearProgress sx={{ borderRadius: '99px', bgcolor: 'var(--surface2)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--t500)' } }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          {[100, 260, 220, 200].map((h, i) => (
            <Box key={i} sx={{ height: h, borderRadius: '18px', bgcolor: 'var(--surface2)', border: '1px solid var(--border)', animation: 'profGlowPulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.12}s` }} />
          ))}
        </Box>
      </Box>
    );
  }

  /* ── Error state ── */
  if (!profile) {
    return (
      <Box sx={{ p: '24px', bgcolor: 'var(--danger-l)', border: '1px solid rgba(232,69,69,.2)', borderRadius: '12px', color: 'var(--danger)', fontSize: '13.5px' }}>
        {error || 'Profile could not be loaded.'}
      </Box>
    );
  }

  const adminProfile = formData?.admin_profile || profile.admin_profile || {};
  const initials     = (formData?.first_name?.[0] || 'A') + (formData?.last_name?.[0] || 'D');

  return (
    <Box sx={{ width: '100%', maxWidth: 'none' }}>

      {/* ── Page title ── */}
      <Box sx={{ mb: 3, opacity: 0, animation: 'profSlideUp .4s cubic-bezier(.4,0,.2,1) 0s forwards' }}>
        <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--tx1)', letterSpacing: '-.4px', mb: '4px' }}>
          Edit Administrator Profile
        </Typography>
        <Typography sx={{ fontSize: '13px', color: 'var(--tx3)' }}>
          Update your account information and permissions.
        </Typography>
      </Box>

      {/* ══ § Photo ══ */}
      <EditSection
        title="Profile Picture"
        icon={<CameraSVG />}
        delay={0.04}
      >
        <PhotoUploadSection
          src={resolveMediaUrl(profile.profile_picture)}
          initials={initials}
          gradient="linear-gradient(135deg, #1A7A57, #2DAF83)"
          onFileChange={handleProfilePictureChange}
          onRemove={() => setFormData((p) => ({ ...p, profile_picture: null }))}
        />
      </EditSection>

      {/* ══ § Core Identity & Contact ══ */}
      <EditSection title="Core Identity & Contact" sectionNum="01" icon={<UserSVG />} delay={0.09}>
        <FormGrid cols={2}>
          <FormField label="First Name" required>
            <NativeInput type="text" name="first_name" placeholder="Enter first name" value={formData?.first_name || ''} onChange={handleUserInputChange} />
          </FormField>
          <FormField label="Last Name" required>
            <NativeInput type="text" name="last_name" placeholder="Enter last name" value={formData?.last_name || ''} onChange={handleUserInputChange} />
          </FormField>
          <FormField label="Other Names">
            <NativeInput type="text" name="other_names" placeholder="Middle or other names" value={formData?.other_names || ''} onChange={handleUserInputChange} />
          </FormField>
          <FormField label="Phone Number">
            <NativeInput type="tel" name="phone" placeholder="+256…" value={formData?.phone || ''} onChange={handleUserInputChange} />
          </FormField>
          <FormField label="Alternative Phone">
            <NativeInput type="tel" name="alternative_phone" placeholder="+256…" value={formData?.alternative_phone || ''} onChange={handleUserInputChange} />
          </FormField>
          <FormField label="Email" required>
            <NativeInput type="email" name="email" value={formData?.email || ''} disabled />
          </FormField>
          <FormField label="Country">
            <NativeInput type="text" name="country" placeholder="Country" value={formData?.country || ''} onChange={handleUserInputChange} />
          </FormField>
          <FormField label="City">
            <NativeInput type="text" name="city" placeholder="City" value={formData?.city || ''} onChange={handleUserInputChange} />
          </FormField>
        </FormGrid>
      </EditSection>

      {/* ══ § Admin Information ══ */}
      <EditSection title="Admin Information" sectionNum="02" icon={<BriefSVG />} delay={0.14}>
        <FormGrid cols={2}>
          <FormField label="Department">
            <NativeInput type="text" name="department" placeholder="Assigned department" value={adminProfile.department || ''} onChange={handleInputChange} />
          </FormField>
          <FormField label="Admin Level">
            <NativeSelect name="admin_level" value={adminProfile.admin_level || 'staff'} onChange={handleInputChange}>
              <option value="standard">Standard</option>
              <option value="staff">Staff</option>
              <option value="senior">Senior Admin</option>
              <option value="super">Super Admin</option>
            </NativeSelect>
          </FormField>
        </FormGrid>
      </EditSection>

      {/* ══ § Permissions ══ */}
      <EditSection title="Permissions" sectionNum="03" icon={<LockSVG />} delay={0.19}>
        <Box sx={{ p: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Can Manage Users',      name: 'can_manage_users',       checked: Boolean(adminProfile.can_manage_users) },
            { label: 'Can Assign Placements', name: 'can_assign_placements',  checked: Boolean(adminProfile.can_assign_placements) },
            { label: 'Can View Reports',      name: 'can_view_reports',       checked: Boolean(adminProfile.can_view_reports) },
            { label: 'Can Manage Settings',   name: 'can_manage_settings',    checked: Boolean(adminProfile.can_manage_settings) },
            { label: 'Access Audit Logs',     name: 'can_access_audit_logs',  checked: Boolean(adminProfile.can_access_audit_logs) },
          ].map((p) => (
            <PermToggle
              key={p.name}
              label={p.label}
              name={p.name}
              checked={p.checked}
              onChange={handleAdminToggle}
            />
          ))}
        </Box>

        {/* Sticky save/cancel */}
        <EditActionsBar>
          <ProfileBtn
            variant="outline"
            icon={<CancelSVG />}
            onClick={() => navigate('/profile')}
            disabled={saving}
          >
            Cancel
          </ProfileBtn>
          <ProfileBtn
            variant="primary"
            icon={<SaveSVG />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </ProfileBtn>
        </EditActionsBar>
      </EditSection>

    </Box>
  );
};

export default AdminProfileEditPage;