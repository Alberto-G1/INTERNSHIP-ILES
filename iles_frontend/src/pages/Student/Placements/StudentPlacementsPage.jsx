import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';

const StudentPlacementsPage = () => {
  return (
    <PageScaffold
      title="Student Placements"
      subtitle="View assigned organization, supervisor pairing, and internship period"
      stats={[
        { label: 'Placements', value: '1', helper: 'Current assignment', accent: '#2E8B5B' },
        { label: 'Duration', value: '16w', helper: 'Total internship', accent: '#5B82A6' },
        { label: 'Supervisor', value: '1', helper: 'Assigned mentor', accent: '#F59E0B' },
        { label: 'Status', value: 'Active', helper: 'In progress', accent: '#4DB87A' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Placement Details</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Your placement summary, reporting chain, and expected outcomes will appear here.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default StudentPlacementsPage;
