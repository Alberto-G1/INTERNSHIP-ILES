// frontend/src/pages/Evaluations/EvaluationsPage.jsx
import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';

const EvaluationsPage = () => {
  return (
    <PageScaffold
      title="Evaluations"
      subtitle="Assess intern performance across competencies and track approval progress"
      stats={[
        { label: 'Pending', value: '3', helper: 'Need scoring', accent: '#F59E0B' },
        { label: 'Completed', value: '41', helper: 'This term', accent: '#2E8B5B' },
        { label: 'Avg Score', value: '83.4', helper: 'Cohort baseline', accent: '#5B82A6' },
        { label: 'At Risk', value: '5', helper: 'Below threshold', accent: '#C0392B' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Evaluation Queue</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Open intern records, provide criteria-based ratings, and submit detailed qualitative feedback.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default EvaluationsPage;