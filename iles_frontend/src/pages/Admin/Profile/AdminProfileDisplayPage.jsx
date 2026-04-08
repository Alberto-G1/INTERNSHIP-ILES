/**
 * AdminProfileDisplayPage.jsx
 * Read-only admin profile view.
 * Design: faithfully ports the HTML profile system (hero, info-blocks, field cards,
 * section connector, permission chips, level indicator, shimmer dividers).
 * Logic: all original API calls, auth checks, and navigation preserved exactly.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { profileAPI } from '../../../services/api';
import { notifyError } from '../../../components/Common/AppToast';
import { resolveMediaUrl } from '../../../utils/mediaUrl';

import {
  ProfileHero,
  HeroChip,
  LiveDot,
  SectionStack,
  InfoBlock,
  FieldGrid,
  FieldCard,
  PermChip,
  AdminLevelIndicator,
  ProfileBtn,
} from '../../../components/Common/ProfilePrimitives';

/* ── Inline SVGs ── */
const EditSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const UserSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={17} height={17}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const BriefSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={17} height={17}>
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const LockSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={17} height={17}>
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const CheckSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={10} height={10}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ── Admin level label helper ── */
const getAdminLevelKey = (level) => {
  const map = { standard: 'standard', staff: 'staff', senior: 'senior', super: 'super' };
  return map[level] || 'staff';
};

/* ── Completion percentage helper ── */
const calcCompletion = (profile, adminProfile) => {
  const checks = [
    profile?.first_name, profile?.last_name, profile?.phone,
    profile?.country, profile?.city, profile?.email,
    adminProfile?.department, adminProfile?.admin_level,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
};

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
const AdminProfileDisplayPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { fetchProfile(); }, []);

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
    } catch {
      setError('Failed to load profile');
      notifyError('Failed to load profile', { title: 'Profile Error' });
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <Box>
        <LinearProgress sx={{ borderRadius: '99px', bgcolor: 'var(--surface2)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--t500)' } }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3 }}>
          {[148, 120, 100, 80].map((h, i) => (
            <Box key={i} sx={{ height: h, borderRadius: '18px', bgcolor: 'var(--surface2)', border: '1px solid var(--border)', animation: 'profGlowPulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
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

  const adminProfile  = profile.admin_profile || {};
  const completionPct = calcCompletion(profile, adminProfile);
  const fullName      = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Administrator';
  const initials      = (profile.first_name?.[0] || 'A') + (profile.last_name?.[0] || 'D');
  const avatarSrc     = resolveMediaUrl(profile.profile_picture);

  /* Permissions list */
  const permissions = [
    { label: 'Can Manage Users',       granted: Boolean(adminProfile.can_manage_users) },
    { label: 'Can Assign Placements',  granted: Boolean(adminProfile.can_assign_placements) },
    { label: 'Can View Reports',       granted: Boolean(adminProfile.can_view_reports) },
    { label: 'Can Manage Settings',    granted: Boolean(adminProfile.can_manage_settings) },
    { label: 'Access Audit Logs',      granted: Boolean(adminProfile.can_access_audit_logs) },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 'none' }}>

      {/* ══ HERO ══ */}
      <ProfileHero
        bannerGradient="linear-gradient(135deg, #0F1635 0%, #1A2D5A 60%, #162840 100%)"
        avatarGradient="linear-gradient(135deg, #1A7A57, #2DAF83)"
        avatarSrc={avatarSrc}
        initials={initials}
        name={fullName}
        role={`System Administrator · ${profile.email || ''}`}
        completionPct={completionPct}
        completionColor="linear-gradient(90deg, var(--t700), var(--t400))"
        hintColor={completionPct < 80 ? 'var(--a700)' : 'var(--t700)'}
        hintText={
          completionPct < 80
            ? 'Complete remaining fields to unlock all system features'
            : 'Your profile is looking great!'
        }
        decorCircles={[
          { right: '60px', top: '20px', width: '100px', height: '100px', borderColor: 'rgba(45,175,131,0.25)' },
          { right: '20px', top: '-10px', width: '160px', height: '160px', borderColor: 'rgba(85,105,224,0.15)' },
        ]}
        chips={[
          <HeroChip key="admin" color="var(--t800)" bg="var(--t100)" icon={<CheckSVG />}>
            Super Admin
          </HeroChip>,
          <HeroChip key="session" color="var(--i700)" bg="var(--i100)">
            <LiveDot />&nbsp;Active Session
          </HeroChip>,
        ]}
        actions={
          <ProfileBtn
            variant="primary"
            icon={<EditSVG />}
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </ProfileBtn>
        }
        delay={0}
      />

      {/* ══ SECTIONS ══ */}
      <SectionStack>

        {/* § 01 — Core Identity & Contact */}
        <InfoBlock
          variant="teal"
          num="01"
          title="Core Identity & Contact"
          subtitle="Personal and contact information"
          icon={<UserSVG />}
          delay={0.08}
        >
          <FieldGrid cols={4}>
            <FieldCard variant="teal" label="First Name"       value={profile.first_name}       delay={0.10} />
            <FieldCard variant="teal" label="Last Name"        value={profile.last_name}        delay={0.13} />
            <FieldCard variant="teal" label="Other Names"      value={profile.other_names}      delay={0.16} />
            <FieldCard variant="teal" label="Phone Number"     value={profile.phone}            delay={0.19} mono />
            <FieldCard variant="teal" label="Alternative Phone"value={profile.alternative_phone}delay={0.22} mono />
            <FieldCard variant="teal" label="Email Address"    value={profile.email}            delay={0.25} mono wide />
            <FieldCard variant="teal" label="Country"          value={profile.country}          delay={0.28} />
            <FieldCard variant="teal" label="City"             value={profile.city}             delay={0.31} />
          </FieldGrid>
        </InfoBlock>

        {/* § 02 — Admin Information */}
        <InfoBlock
          variant="indigo"
          num="02"
          title="Admin Information"
          subtitle="Role and access level"
          icon={<BriefSVG />}
          delay={0.18}
        >
          <FieldGrid cols={2}>
            {/* Admin level with pip indicator */}
            <Box
              sx={{
                position: 'relative',
                bgcolor: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                p: '12px 14px 11px',
                transition: 'all .2s',
                '&:hover': { bgcolor: 'var(--surface)', borderColor: 'var(--border2)', boxShadow: '0 2px 12px rgba(13,16,32,.06)' },
              }}
            >
              <Box sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: '8px', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--i600)', '&::before': { content: '""', width: '5px', height: '5px', borderRadius: '50%', bgcolor: 'var(--i500)', opacity: .5, flexShrink: 0 } }}>
                Admin Level
              </Box>
              <AdminLevelIndicator level={getAdminLevelKey(adminProfile.admin_level)} />
            </Box>

            <FieldCard variant="indigo" label="Department" value={adminProfile.department} delay={0.22} />
          </FieldGrid>
        </InfoBlock>

        {/* § 03 — Permissions */}
        <InfoBlock
          variant="violet"
          num="03"
          title="Permissions"
          subtitle="System access rights granted to this account"
          icon={<LockSVG />}
          delay={0.28}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {permissions.map((p, i) => (
              <PermChip key={p.label} label={p.label} granted={p.granted} delay={0.30 + i * 0.08} />
            ))}
          </Box>
        </InfoBlock>

      </SectionStack>
    </Box>
  );
};

export default AdminProfileDisplayPage;