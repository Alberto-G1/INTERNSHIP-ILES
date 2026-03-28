// frontend/src/pages/Interns/InternsPage.jsx
import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';

const InternsPage = () => {
  return (
    <PageScaffold
      title="Interns"
      subtitle="View intern records, supervision mapping, and performance snapshots"
      stats={[
        { label: 'Total', value: '48', helper: 'Spring cohort', accent: '#2E8B5B' },
        { label: 'On Track', value: '38', helper: 'Progress healthy', accent: '#4DB87A' },
        { label: 'At Risk', value: '7', helper: 'Follow-up needed', accent: '#F59E0B' },
        { label: 'Critical', value: '3', helper: 'Immediate action', accent: '#C0392B' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Intern Directory</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Search by department, supervisor, and status to quickly locate interns requiring guidance.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default InternsPage;