import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageScaffold from '../Common/PageScaffold';
import { notifyError, notifySuccess } from '../Common/AppToast';
import { logbookAPI } from '../../services/api';

const SupervisorLogReviewBoard = ({ title, subtitle }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [reviewModal, setReviewModal] = useState({
    open: false,
    log: null,
    decision: 'approve',
    comments: '',
    rating: '',
  });
  const [reviewing, setReviewing] = useState(false);
  const [auditModal, setAuditModal] = useState({ open: false, data: null, loading: false });

  const fetchData = async (targetPage = page) => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: targetPage,
        page_size: 10,
      };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const response = await logbookAPI.getSupervisorLogs(params);
      const payload = response.data;
      const results = payload.results || [];
      const count = payload.count || results.length;

      setLogs(results);
      setTotalCount(count);
      setPage(targetPage);
      setTotalPages(Math.max(1, Math.ceil(count / 10)));
    } catch (err) {
      setError('Failed to load assigned weekly logs.');
      notifyError('Failed to load assigned weekly logs', { title: 'Load Failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const stats = [
    {
      label: 'Pending',
      value: String(logs.filter((l) => ['pending', 'under_review'].includes(l.review_status)).length),
      helper: 'Awaiting review',
      accent: '#F59E0B',
    },
    {
      label: 'Approved',
      value: String(logs.filter((l) => l.review_status === 'approved').length),
      helper: 'Validated logs',
      accent: '#2E8B5B',
    },
    {
      label: 'Revision',
      value: String(logs.filter((l) => l.review_status === 'needs_revision').length),
      helper: 'Returned logs',
      accent: '#C0392B',
    },
    {
      label: 'Loaded',
      value: String(totalCount),
      helper: 'Total assigned logs',
      accent: '#5B82A6',
    },
  ];

  const openReview = (log) => {
    setReviewModal({
      open: true,
      log,
      decision: 'approve',
      comments: '',
      rating: '',
    });
  };

  const startReviewThenOpen = async (log) => {
    try {
      if (log.workflow_state === 'submitted') {
        await logbookAPI.startSupervisorLogReview(log.id);
      }
      openReview(log);
      await fetchData(page);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to start review.';
      notifyError(msg, { title: 'Start Review Failed' });
    }
  };

  const openAuditTrail = async (log) => {
    try {
      setAuditModal({ open: true, data: null, loading: true });
      const response = await logbookAPI.getLogAuditTrail(log.id);
      setAuditModal({ open: true, data: response.data, loading: false });
    } catch (err) {
      setAuditModal({ open: false, data: null, loading: false });
      const msg = err.response?.data?.error || 'Failed to load audit trail.';
      notifyError(msg, { title: 'Audit Trail Failed' });
    }
  };

  const submitReview = async () => {
    if (!reviewModal.log) return;

    try {
      setReviewing(true);

      const payload = {
        decision: reviewModal.decision,
        comments: reviewModal.comments,
      };

      if (reviewModal.rating !== '') {
        payload.rating = Number(reviewModal.rating);
      }

      await logbookAPI.reviewSupervisorLog(reviewModal.log.id, payload);
      notifySuccess('Weekly log review saved.', { title: 'Review Saved' });
      setReviewModal({ open: false, log: null, decision: 'approve', comments: '', rating: '' });
      await fetchData(page);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save review.';
      notifyError(msg, { title: 'Review Failed' });
    } finally {
      setReviewing(false);
    }
  };

  return (
    <PageScaffold title={title} subtitle={subtitle} stats={stats}>
      <Stack spacing={2}>
        {loading && <Alert severity="info">Loading review queue...</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            size="small"
            fullWidth
            label="Search student or organization"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            size="small"
            select
            sx={{ minWidth: 220 }}
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="under_review">Under Review</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="needs_revision">Needs Revision</MenuItem>
            <MenuItem value="reviewed">Reviewed</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <Button variant="outlined" onClick={() => fetchData(1)}>Apply</Button>
        </Stack>

        {logs.length === 0 && !loading ? (
          <Alert severity="info">No assigned logs match your filters.</Alert>
        ) : (
          <Stack spacing={1.25}>
            {logs.map((log) => (
              <Box key={log.id} sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: 1.5 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {log.student_name} · Week {log.week_number} · {log.week_ending_date}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {log.placement_summary}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={log.workflow_state || log.review_status}
                      size="small"
                      color={
                        (log.workflow_state || log.review_status) === 'approved'
                          ? 'success'
                          : (log.workflow_state || log.review_status) === 'needs_revision'
                            ? 'warning'
                            : (log.workflow_state || log.review_status) === 'rejected'
                              ? 'error'
                              : 'default'
                      }
                    />
                    <Chip label={log.submission_status} size="small" variant="outlined" />
                    <Chip label={`Round ${log.review_round || 0}`} size="small" variant="outlined" />
                    {log.is_late && <Chip label="Late" color="warning" size="small" />}
                  </Stack>
                </Stack>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Completed:</strong> {log.tasks_completed}
                </Typography>
                <Typography variant="body2">
                  <strong>In Progress:</strong> {log.tasks_in_progress}
                </Typography>
                <Typography variant="body2">
                  <strong>Next Week:</strong> {log.next_week_tasks}
                </Typography>
                <Typography variant="body2">
                  <strong>Challenges:</strong> {log.challenges}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {['submitted', 'under_review'].includes(log.workflow_state) && (
                    <Button size="small" variant="contained" onClick={() => startReviewThenOpen(log)}>
                      Review
                    </Button>
                  )}
                  <Button size="small" variant="outlined" onClick={() => openAuditTrail(log)}>
                    Audit Trail
                  </Button>
                  {log.supervisor_comments && (
                    <Chip size="small" label="Feedback added" />
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Page {page} of {totalPages} ({totalCount} logs)
          </Typography>
          <Pagination page={page} count={totalPages} onChange={(_, val) => fetchData(val)} />
        </Stack>
      </Stack>

      <Dialog open={reviewModal.open} onClose={() => setReviewModal({ open: false, log: null, decision: 'approve', comments: '', rating: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Review Weekly Log</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Decision"
              value={reviewModal.decision}
              onChange={(e) => setReviewModal((prev) => ({ ...prev, decision: e.target.value }))}
              fullWidth
            >
              <MenuItem value="approve">Approve</MenuItem>
              <MenuItem value="needs_revision">Needs Revision</MenuItem>
              <MenuItem value="reject">Reject</MenuItem>
            </TextField>
            <TextField
              multiline
              minRows={3}
              label="Supervisor Comments"
              fullWidth
              value={reviewModal.comments}
              onChange={(e) => setReviewModal((prev) => ({ ...prev, comments: e.target.value }))}
            />
            <TextField
              label="Rating (1-5)"
              type="number"
              fullWidth
              inputProps={{ min: 1, max: 5 }}
              value={reviewModal.rating}
              onChange={(e) => setReviewModal((prev) => ({ ...prev, rating: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewModal({ open: false, log: null, decision: 'approve', comments: '', rating: '' })}>Cancel</Button>
          <Button variant="contained" onClick={submitReview} disabled={reviewing}>
            {reviewing ? 'Saving...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={auditModal.open} onClose={() => setAuditModal({ open: false, data: null, loading: false })} maxWidth="md" fullWidth>
        <DialogTitle>Audit Trail & Review History</DialogTitle>
        <DialogContent>
          {auditModal.loading && <Alert severity="info">Loading audit trail...</Alert>}
          {!auditModal.loading && auditModal.data && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Transitions</Typography>
                <List dense>
                  {auditModal.data.audit_trail.map((item) => (
                    <ListItem key={item.id} divider>
                      <ListItemText
                        primary={`${item.action_type}: ${item.previous_state} -> ${item.new_state}`}
                        secondary={`${item.actor_name} at ${new Date(item.created_at).toLocaleString()}${item.notes ? ` | ${item.notes}` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Review Rounds</Typography>
                <List dense>
                  {auditModal.data.reviews.map((review) => (
                    <ListItem key={review.id} divider>
                      <ListItemText
                        primary={`Round ${review.review_round} - ${review.decision}`}
                        secondary={`${review.supervisor_name} at ${new Date(review.reviewed_at).toLocaleString()} | Rating: ${review.rating ?? 'N/A'} | ${review.comments}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditModal({ open: false, data: null, loading: false })}>Close</Button>
        </DialogActions>
      </Dialog>
    </PageScaffold>
  );
};

export default SupervisorLogReviewBoard;
