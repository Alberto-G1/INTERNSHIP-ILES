import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
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
      title="Admin Logs"
      subtitle="Monitor submission health, review turnaround, and quality signals across all internships"
      stats={stats}
    >
      <Stack spacing={1}>
        {loading && <Alert severity="info">Loading logbook overview...</Alert>}

        <Typography sx={{ fontWeight: 600 }}>Logbook Oversight</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Track platform-wide log progress, approval rates, and revision pressure to manage supervisory quality.
        </Typography>

        {overview && (
          <Typography sx={{ color: 'text.secondary' }}>
            Late submissions: {overview.late_submissions || 0} · Approved logs: {overview.approved || 0}
          </Typography>
        )}

        <Button
          component={RouterLink}
          to="/admin/audit-logs"
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        >
          Open Audit Logs
        </Button>
      </Stack>
    </PageScaffold>
  );
};

export default AdminLogsPage;
