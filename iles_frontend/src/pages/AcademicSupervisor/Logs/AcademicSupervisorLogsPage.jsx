import { Stack, Typography } from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';

const AcademicSupervisorLogsPage = () => {
  return (
    <PageScaffold
      title="Academic Supervisor Logs"
      subtitle="Track weekly submissions against academic learning outcomes"
      stats={[
        { label: 'Pending Eval', value: '5', helper: 'Need grading', accent: '#F59E0B' },
        { label: 'Reviewed', value: '18', helper: 'This cycle', accent: '#2E8B5B' },
        { label: 'Flagged', value: '2', helper: 'Quality concerns', accent: '#C0392B' },
        { label: 'Completion', value: '78%', helper: 'Cohort average', accent: '#5B82A6' },
      ]}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 600 }}>Academic Review View</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Validate learning reflection quality, theory-practice alignment, and competency progression before final scoring.
        </Typography>
      </Stack>
    </PageScaffold>
  );
};

export default AcademicSupervisorLogsPage;
