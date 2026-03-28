import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';

const WorkplaceSupervisorPlacementsPage = () => {
  return (
    <PageScaffold
      title="Workplace Placements"
      subtitle="Manage intern placement records within your company unit"
      stats={[
        { label: 'Assigned', value: '12', helper: 'Current interns', accent: '#2E8B5B' },
        { label: 'Departments', value: '4', helper: 'Active units', accent: '#5B82A6' },
        { label: 'Starts', value: '2', helper: 'Upcoming this week', accent: '#F59E0B' },
        { label: 'At Risk', value: '1', helper: 'Needs intervention', accent: '#C0392B' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Placement Assignment Board</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Confirm host team mappings, update supervisor assignments, and monitor each intern's progress level.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default WorkplaceSupervisorPlacementsPage;
