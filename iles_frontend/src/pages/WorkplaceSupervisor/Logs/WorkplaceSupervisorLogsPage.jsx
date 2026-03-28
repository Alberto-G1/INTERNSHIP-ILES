import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';

const WorkplaceSupervisorLogsPage = () => {
  return (
    <PageScaffold
      title="Workplace Supervisor Logs"
      subtitle="Review intern log quality, provide feedback, and approve weekly entries"
      stats={[
        { label: 'Pending', value: '3', helper: 'Awaiting review', accent: '#F59E0B' },
        { label: 'Approved', value: '24', helper: 'This month', accent: '#2E8B5B' },
        { label: 'Revisions', value: '2', helper: 'Sent back', accent: '#C0392B' },
        { label: 'Avg Score', value: '84', helper: 'Team average', accent: '#5B82A6' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Review Queue</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Open each submission to check work quality, attendance notes, and progress evidence before publishing a decision.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default WorkplaceSupervisorLogsPage;
