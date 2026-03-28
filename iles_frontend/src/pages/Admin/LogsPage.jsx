import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';

const AdminLogsPage = () => {
  return (
    <PageScaffold
      title="Admin Logs Overview"
      subtitle="Monitor submission health, review turnaround, and quality signals platform-wide"
      stats={[
        { label: 'Total Logs', value: '312', helper: 'Current cohort', accent: '#2E8B5B' },
        { label: 'Pending', value: '9', helper: 'Needs action', accent: '#F59E0B' },
        { label: 'Rejected', value: '4', helper: 'Revision needed', accent: '#C0392B' },
        { label: 'Approval', value: '87%', helper: 'System average', accent: '#5B82A6' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Audit Trail</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Filter by role, week, and status to inspect workflow bottlenecks and follow up with supervisors.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default AdminLogsPage;
