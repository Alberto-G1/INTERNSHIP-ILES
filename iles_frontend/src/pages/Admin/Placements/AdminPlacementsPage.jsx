import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';

const AdminPlacementsPage = () => {
  return (
    <PageScaffold
      title="Admin Placements Management"
      subtitle="Coordinate organizations, student matching, and placement lifecycle governance"
      stats={[
        { label: 'Active', value: '48', helper: 'Current placements', accent: '#2E8B5B' },
        { label: 'Open Slots', value: '12', helper: 'Available positions', accent: '#5B82A6' },
        { label: 'Pending Match', value: '7', helper: 'Awaiting assignment', accent: '#F59E0B' },
        { label: 'Escalations', value: '2', helper: 'Critical issues', accent: '#C0392B' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Placement Command Center</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Manage placement records, confirm supervisor links, and resolve conflicts before internship start dates.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default AdminPlacementsPage;
