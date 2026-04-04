// frontend/src/pages/Settings/SettingsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageScaffold from '../../components/Common/PageScaffold';
import { adminAPI, adminUsersAPI, authAPI, logbookAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [overview, setOverview] = useState({
    total_logs: 0,
    pending_review: 0,
    approved: 0,
    revisions: 0,
    late_submissions: 0,
    approval_rate: 0,
  });
  const [users, setUsers] = useState([]);
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        setLoading(true);
        const [profileRes, usersRes, approvalsRes, overviewRes] = await Promise.allSettled([
          authAPI.getProfile(),
          adminUsersAPI.getUsers(),
          adminAPI.getSupervisorApprovals(),
          logbookAPI.getAdminOverview(),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data || null);
        }
        if (usersRes.status === 'fulfilled') {
          setUsers(Array.isArray(usersRes.value.data) ? usersRes.value.data : []);
        }
        if (approvalsRes.status === 'fulfilled') {
          setApprovals(Array.isArray(approvalsRes.value.data) ? approvalsRes.value.data : []);
        }
        if (overviewRes.status === 'fulfilled') {
          setOverview((current) => ({ ...current, ...overviewRes.value.data }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettingsData();
  }, []);

  const stats = useMemo(() => {
    const activeUsers = users.filter((item) => item.is_active).length;
    const pendingApprovals = approvals.filter((item) => !item.admin_approved).length;
    return [
      { label: 'Users', value: `${users.length}`, helper: `${activeUsers} active accounts`, accent: '#2E8B5B' },
      { label: 'Security', value: 'JWT', helper: `${pendingApprovals} pending approvals`, accent: '#5B82A6' },
      { label: 'Environment', value: import.meta.env.MODE || 'development', helper: 'Current runtime mode', accent: '#F59E0B' },
      {
        label: 'Health',
        value: `${Math.round(overview.approval_rate || 0)}%`,
        helper: 'Log approval performance',
        accent: '#4DB87A',
      },
    ];
  }, [users, approvals, overview]);

  return (
    <PageScaffold
      title="Settings"
      subtitle="Configure system preferences, workflow defaults, and account controls"
      stats={stats}
    >
      <Stack spacing={1.4}>
        {loading && <Alert severity="info">Loading system settings snapshot...</Alert>}

        <Typography sx={{ fontWeight: 600 }}>Configuration Hub</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Manage visual preferences, approval policies, and default notifications for each user role.
        </Typography>

        <Divider />

        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Current Account Configuration</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`Role: ${profile?.role || user?.role || 'unknown'}`} />
          <Chip label={`Email verified: ${profile?.email_verified ? 'Yes' : 'No'}`} color={profile?.email_verified ? 'success' : 'warning'} />
          <Chip label={`Account active: ${profile?.is_active ? 'Yes' : 'No'}`} color={profile?.is_active ? 'success' : 'default'} />
          {typeof profile?.admin_approved === 'boolean' && (
            <Chip
              label={`Admin approved: ${profile.admin_approved ? 'Yes' : 'No'}`}
              color={profile.admin_approved ? 'success' : 'warning'}
            />
          )}
        </Stack>

        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Workflow Signals</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
          Pending reviews: {overview.pending_review || 0} · Revisions requested: {overview.revisions || 0} · Late submissions: {overview.late_submissions || 0}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/profile/edit')}>Update Profile</Button>
          <Button variant="outlined" onClick={() => navigate('/admin/approvals')}>Manage Approvals</Button>
          <Button variant="outlined" onClick={() => navigate('/logs')}>Review Logs</Button>
        </Stack>
      </Stack>
    </PageScaffold>
  );
};

export default SettingsPage;