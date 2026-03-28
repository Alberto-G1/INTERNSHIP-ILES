// frontend/src/pages/Reports/ReportsPage.jsx
import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';

const ReportsPage = () => {
  return (
    <PageScaffold
      title="Reports"
      subtitle="Generate analytics for submissions, evaluations, and placement outcomes"
      chips={['Export: PDF', 'Export: CSV', 'Term: Spring 2025']}
      stats={[
        { label: 'Submission Rate', value: '81%', helper: 'Across all units', accent: '#2E8B5B' },
        { label: 'Avg Score', value: '83.4', helper: 'Cohort score', accent: '#5B82A6' },
        { label: 'Completion', value: '74%', helper: 'Evaluations done', accent: '#F59E0B' },
        { label: 'Alerts', value: '6', helper: 'Require follow-up', accent: '#C0392B' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Analytics Workspace</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Build department-level and supervisor-level reports to support weekly management reviews.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default ReportsPage;