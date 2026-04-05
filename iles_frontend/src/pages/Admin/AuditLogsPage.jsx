import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';
import { auditingAPI } from '../../services/api';
import { notifyError } from '../../components/Common/AppToast';

const AdminAuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await auditingAPI.getAdminAuditLogs({
        action: actionFilter || undefined,
        entity_type: entityFilter || undefined,
        search: search || undefined,
      });
      setAuditLogs(response.data || []);
    } catch (_err) {
      notifyError('Failed to load audit logs', { title: 'Load Failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, entityFilter, search]);

  return (
    <PageScaffold
      title="Audit Logs"
      subtitle="Track user actions and system-level events for accountability and troubleshooting"
      stats={[
        { label: 'Entries', value: String(auditLogs.length), helper: 'Current result set', accent: '#2E8B5B' },
        {
          label: 'User Actions',
          value: String(auditLogs.filter((log) => !!log.actor).length),
          helper: 'Triggered by users',
          accent: '#5B82A6',
        },
        {
          label: 'System Events',
          value: String(auditLogs.filter((log) => !log.actor).length),
          helper: 'Automated/system',
          accent: '#F59E0B',
        },
        {
          label: 'Filtered',
          value: actionFilter || entityFilter || search ? 'Yes' : 'No',
          helper: 'Search or filters active',
          accent: '#C0392B',
        },
      ]}
    >
      <Stack spacing={1.3}>
        {loading && <Alert severity="info">Loading audit logs...</Alert>}

        <Typography sx={{ fontWeight: 600 }}>Audit Trail Explorer</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Filter by action, entity type, or free text search to inspect activity history.
        </Typography>

        <Grid container spacing={1.2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Action"
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="CREATE">Create</MenuItem>
              <MenuItem value="UPDATE">Update</MenuItem>
              <MenuItem value="DELETE">Delete</MenuItem>
              <MenuItem value="SUBMIT">Submit</MenuItem>
              <MenuItem value="APPROVE">Approve</MenuItem>
              <MenuItem value="REJECT">Reject</MenuItem>
              <MenuItem value="LOGIN">Login</MenuItem>
              <MenuItem value="LOGOUT">Logout</MenuItem>
              <MenuItem value="FINALIZE">Finalize</MenuItem>
              <MenuItem value="COMPUTE">Compute</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Entity"
              value={entityFilter}
              onChange={(event) => setEntityFilter(event.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="WeeklyLog">Logbook</MenuItem>
              <MenuItem value="PlacementEvaluation">Evaluation</MenuItem>
              <MenuItem value="FinalInternshipScore">Score</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by actor or entity description"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Grid>
        </Grid>

        <Stack spacing={1}>
          {!loading && auditLogs.length === 0 ? (
            <Alert severity="info">No audit logs found for current filters.</Alert>
          ) : (
            auditLogs.map((log) => (
              <Box
                key={log.id}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                  <Chip size="small" label={log.action} color="primary" variant="outlined" />
                  <Chip size="small" label={log.entity_type} variant="outlined" />
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>#{log.entity_id}</Typography>
                </Stack>
                <Typography sx={{ fontWeight: 600 }}>
                  {log.actor_name} ({log.actor_role || 'system'})
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                  {log.entity_description || 'No description'}
                </Typography>
                <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.3 }}>
                  {new Date(log.action_time).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      </Stack>
    </PageScaffold>
  );
};

export default AdminAuditLogsPage;
