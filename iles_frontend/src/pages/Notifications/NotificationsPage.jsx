// frontend/src/pages/Notifications/NotificationsPage.jsx
import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';

const NotificationsPage = () => {
  return (
    <PageScaffold
      title="Notifications"
      subtitle="Stay updated on review deadlines, submissions, and workflow alerts"
      stats={[
        { label: 'Unread', value: '5', helper: 'Needs attention', accent: '#F59E0B' },
        { label: 'Today', value: '12', helper: 'Incoming events', accent: '#2E8B5B' },
        { label: 'Escalated', value: '2', helper: 'Critical alerts', accent: '#C0392B' },
        { label: 'Resolved', value: '18', helper: 'This week', accent: '#5B82A6' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Notification Center</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Prioritize unread items, then review reminders tied to evaluations, logs, and placement milestones.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default NotificationsPage;