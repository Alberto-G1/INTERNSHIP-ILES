import { useEffect, useMemo, useState } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';
import { logbookAPI } from '../../services/api';
import { notifyError } from '../../components/Common/AppToast';

const AdminLogsPage = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await logbookAPI.getAdminOverview();
        setOverview(response.data);
      } catch (err) {
        notifyError('Failed to load logbook overview', { title: 'Load Failed' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const data = overview || {};
    return [
      { label: 'Total Logs', value: String(data.total_logs || 0), helper: 'Current cohort', accent: '#2E8B5B' },
      { label: 'Pending', value: String(data.pending_review || 0), helper: 'Needs action', accent: '#F59E0B' },
      { label: 'Revisions', value: String(data.revisions || 0), helper: 'Revision requested', accent: '#C0392B' },
      { label: 'Approval Rate', value: `${data.approval_rate || 0}%`, helper: 'System average', accent: '#5B82A6' },
    ];
  }, [overview]);

  return (
    <PageScaffold
      title="Admin Logs Overview"
      subtitle="Monitor submission health, review turnaround, and quality signals platform-wide"
      stats={stats}
    >
      <Stack spacing={1}>
        {loading && <Alert severity="info">Loading logbook overview...</Alert>}
        <Typography sx={{ fontWeight: 600 }}>Audit Trail</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Filter by role, week, and status to inspect workflow bottlenecks and follow up with supervisors.
        </Typography>
        {overview && (
          <Typography sx={{ color: 'text.secondary' }}>
            Late submissions: {overview.late_submissions || 0} · Approved logs: {overview.approved || 0}
          </Typography>
        )}
      </Stack>
    </PageScaffold>
  );
};

export default AdminLogsPage;
