import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';

const StudentLogsPage = () => {
  return (
    <PageScaffold
      title="Student Logs"
      subtitle="Track submissions week by week and keep your internship record complete"
      chips={['Current Week: W11', 'Status: Pending Review']}
      stats={[
        { label: 'Submitted', value: '10/16', helper: 'Weeks completed', accent: '#2E8B5B' },
        { label: 'Pending', value: '1', helper: 'Awaiting supervisor', accent: '#F59E0B' },
        { label: 'Revisions', value: '1', helper: 'Needs update', accent: '#C0392B' },
        { label: 'Average', value: '83', helper: 'Score so far', accent: '#5B82A6' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Log Timeline</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Submit your weekly summary, tasks completed, key learnings, and supporting notes for supervisor evaluation.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default StudentLogsPage;
