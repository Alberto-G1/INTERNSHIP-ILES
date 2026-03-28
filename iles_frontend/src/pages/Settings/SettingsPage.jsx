// frontend/src/pages/Settings/SettingsPage.jsx
import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';

const SettingsPage = () => {
  return (
    <PageScaffold
      title="Settings"
      subtitle="Configure system preferences, workflow defaults, and account controls"
      stats={[
        { label: 'Users', value: '4 roles', helper: 'RBAC enabled', accent: '#2E8B5B' },
        { label: 'Security', value: 'JWT', helper: 'Token-based auth', accent: '#5B82A6' },
        { label: 'Environment', value: 'Live', helper: 'Current workspace', accent: '#F59E0B' },
        { label: 'Health', value: 'OK', helper: 'Checks passing', accent: '#4DB87A' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Configuration Hub</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Manage visual preferences, approval policies, and default notifications for each user role.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default SettingsPage;