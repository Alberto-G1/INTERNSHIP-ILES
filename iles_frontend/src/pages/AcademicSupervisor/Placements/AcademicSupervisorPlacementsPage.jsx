import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';

const AcademicSupervisorPlacementsPage = () => {
  return (
    <PageScaffold
      title="Academic Placements"
      subtitle="Ensure placements align with program outcomes and specialization pathways"
      stats={[
        { label: 'Mapped', value: '28', helper: 'Students assigned', accent: '#2E8B5B' },
        { label: 'Mismatch', value: '3', helper: 'Needs reassignment', accent: '#C0392B' },
        { label: 'Programs', value: '7', helper: 'Tracked courses', accent: '#5B82A6' },
        { label: 'Coverage', value: '91%', helper: 'Alignment score', accent: '#4DB87A' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Placement Alignment Matrix</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Compare host organization tasks with program competencies and mark exceptions for academic intervention.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default AcademicSupervisorPlacementsPage;
