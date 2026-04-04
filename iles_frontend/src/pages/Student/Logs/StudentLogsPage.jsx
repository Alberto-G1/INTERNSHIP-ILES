import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';
import AppConfirmModal from '../../../components/Common/AppConfirmModal';
import { notifyError, notifySuccess } from '../../../components/Common/AppToast';
import { logbookAPI, placementsAPI } from '../../../services/api';

const StudentLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [activePlacements, setActivePlacements] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState({ open: false, logId: null });
  const [auditModal, setAuditModal] = useState({ open: false, loading: false, data: null });
  const [viewModal, setViewModal] = useState({ open: false, log: null });
  const [form, setForm] = useState({
    id: null,
    placement: '',
    week_ending_date: '',
    tasks_completed: '',
    tasks_in_progress: '',
    next_week_tasks: '',
    challenges: '',
    hours_worked: '',
    skills_gained: '',
    attachment: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [logsRes, placementsRes, progressRes] = await Promise.all([
        logbookAPI.getStudentLogs(),
        placementsAPI.getMyPlacements(),
        logbookAPI.getStudentProgress(),
      ]);

      const placements = placementsRes.data || [];
      const eligible = placements.filter(
        (p) => p.approval_status === 'approved'
      );

      setLogs(logsRes.data || []);
      setActivePlacements(eligible);
      setProgress(progressRes.data || []);
    } catch (err) {
      setError('Failed to load logbook data.');
      notifyError('Failed to load logbook data', { title: 'Load Failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const submitted = logs.filter((l) => l.submission_status === 'submitted').length;
    const pending = logs.filter((l) => l.review_status === 'pending').length;
    const revisions = logs.filter((l) => l.review_status === 'needs_revision').length;
    const approved = logs.filter((l) => l.review_status === 'approved').length;
    return [
      { label: 'Submitted', value: String(submitted), helper: 'Logs submitted', accent: '#2E8B5B' },
      { label: 'Pending Review', value: String(pending), helper: 'Awaiting supervisor', accent: '#F59E0B' },
      { label: 'Needs Revision', value: String(revisions), helper: 'Returned for edits', accent: '#C0392B' },
      { label: 'Approved', value: String(approved), helper: 'Validated logs', accent: '#5B82A6' },
    ];
  }, [logs]);

  const canCreate = activePlacements.length > 0;

  const resetForm = () => {
    setForm({
      id: null,
      placement: activePlacements[0]?.id || '',
      week_ending_date: '',
      tasks_completed: '',
      tasks_in_progress: '',
      next_week_tasks: '',
      challenges: '',
      hours_worked: '',
      skills_gained: '',
      attachment: null,
    });
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (log) => {
    setForm({
      id: log.id,
      placement: log.placement,
      week_ending_date: log.week_ending_date || '',
      tasks_completed: log.tasks_completed || '',
      tasks_in_progress: log.tasks_in_progress || '',
      next_week_tasks: log.next_week_tasks || '',
      challenges: log.challenges || '',
      hours_worked: log.hours_worked ?? '',
      skills_gained: log.skills_gained || '',
      attachment: null,
    });
    setFormOpen(true);
  };

  const openView = (log) => {
    setViewModal({ open: true, log });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => {
    const fd = new FormData();
    if (form.placement) fd.append('placement', form.placement);
    if (form.week_ending_date) fd.append('week_ending_date', form.week_ending_date);
    if (form.tasks_completed) fd.append('tasks_completed', form.tasks_completed);
    if (form.tasks_in_progress) fd.append('tasks_in_progress', form.tasks_in_progress);
    if (form.next_week_tasks) fd.append('next_week_tasks', form.next_week_tasks);
    if (form.challenges) fd.append('challenges', form.challenges);
    if (form.hours_worked !== '' && form.hours_worked !== null) fd.append('hours_worked', form.hours_worked);
    if (form.skills_gained) fd.append('skills_gained', form.skills_gained);
    if (form.attachment) fd.append('attachment', form.attachment);
    return fd;
  };

  const saveDraft = async () => {
    try {
      setSaving(true);

      const payload = buildPayload();
      if (form.id) {
        await logbookAPI.updateStudentLogDraft(form.id, payload);
        notifySuccess('Draft weekly log updated.', { title: 'Draft Saved' });
      } else {
        await logbookAPI.createStudentLogDraft(payload);
        notifySuccess('Draft weekly log created.', { title: 'Draft Created' });
      }

      setFormOpen(false);
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save weekly log draft.';
      notifyError(msg, { title: 'Save Failed' });
    } finally {
      setSaving(false);
    }
  };

  const submitLog = async () => {
    if (!confirmSubmit.logId) return;

    try {
      setSubmittingId(confirmSubmit.logId);
      await logbookAPI.submitStudentLog(confirmSubmit.logId);
      notifySuccess('Weekly log submitted for supervisor review.', { title: 'Submitted' });
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit weekly log.';
      notifyError(msg, { title: 'Submission Failed' });
    } finally {
      setSubmittingId(null);
      setConfirmSubmit({ open: false, logId: null });
    }
  };

  const openAuditTrail = async (logId) => {
    try {
      setAuditModal({ open: true, loading: true, data: null });
      const response = await logbookAPI.getLogAuditTrail(logId);
      setAuditModal({ open: true, loading: false, data: response.data });
    } catch (err) {
      setAuditModal({ open: false, loading: false, data: null });
      const msg = err.response?.data?.error || 'Failed to load audit trail.';
      notifyError(msg, { title: 'Audit Trail Failed' });
    }
  };

  const statusChip = (log) => {
    const label = log.workflow_state || `${log.submission_status} / ${log.review_status}`;
    let color = 'default';
    if (label === 'approved') color = 'success';
    if (label === 'needs_revision') color = 'warning';
    if (label === 'rejected') color = 'error';
    if (label === 'submitted' || label === 'under_review') color = 'info';
    return <Chip label={label} color={color} size="small" />;
  };

  const editable = (log) => Boolean(log.can_student_edit);
  const submittable = (log) => Boolean(log.can_student_submit);

  return (
    <PageScaffold
      title="Student Logs"
      subtitle="Track submissions week by week and keep your internship record complete"
      chips={canCreate ? ['Placement status: Active'] : ['No active approved placement']}
      stats={stats}
    >
      <Stack spacing={2}>
        {loading && <Alert severity="info">Loading logs...</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
          <Typography sx={{ fontWeight: 600 }}>Weekly Log Timeline</Typography>
          <Button variant="contained" onClick={openCreate} disabled={!canCreate || loading}>
            Create Weekly Log Draft
          </Button>
        </Stack>

        {!canCreate && (
          <Alert severity="warning">
            Weekly logs are allowed only when you have an approved and active placement.
          </Alert>
        )}

        {progress.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Progress Tracking</Typography>
            <Stack spacing={1}>
              {progress.map((item) => (
                <Box key={item.placement_id} sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Placement {item.placement_id}: {item.placement_range}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Submitted: {item.total_logs_submitted} | Approved: {item.approved_logs} | Pending: {item.pending_logs} | Revisions: {item.revisions_count} | Completion: {item.completion_percentage}% | Missing Weeks: {item.missing_weeks.length}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        <Divider />

        {logs.length === 0 && !loading ? (
          <Alert severity="info">No weekly logs yet. Start with a draft entry.</Alert>
        ) : (
          <Stack spacing={1.25}>
            {logs.map((log) => (
              <Box key={log.id} sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: 1.5 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Week {log.week_number} ending {log.week_ending_date}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {log.placement_summary}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {statusChip(log)}
                    <Chip label={`Round ${log.review_round || 0}`} size="small" variant="outlined" />
                    {log.is_late && <Chip label="Late" color="warning" size="small" />}
                  </Stack>
                </Stack>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Tasks Completed:</strong> {log.tasks_completed}
                </Typography>
                {log.supervisor_comments && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Supervisor feedback: {log.supervisor_comments}
                  </Alert>
                )}

                {log.workflow_state === 'approved' && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    Approved log is now locked for editing.
                  </Alert>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => openView(log)}>
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openEdit(log)}
                    disabled={!editable(log)}
                  >
                    {log.workflow_state === 'needs_revision' ? 'Revise Log' : log.workflow_state === 'rejected' ? 'Edit Rejected Log' : 'Edit'}
                  </Button>
                  {submittable(log) && (
                    <Button
                      size="small"
                      variant="contained"
                      disabled={submittingId === log.id}
                      onClick={() => setConfirmSubmit({ open: true, logId: log.id })}
                    >
                      {['needs_revision', 'rejected'].includes(log.workflow_state) ? 'Resubmit' : 'Submit'}
                    </Button>
                  )}
                  <Button size="small" variant="outlined" onClick={() => openAuditTrail(log.id)}>
                    Audit Trail
                  </Button>
                  {log.attachment_url && (
                    <Button size="small" component={Link} href={log.attachment_url} target="_blank" rel="noreferrer">
                      Attachment
                    </Button>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{form.id ? 'Edit Weekly Log Draft' : 'Create Weekly Log Draft'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Placement"
                  value={form.placement}
                  onChange={(e) => updateField('placement', e.target.value)}
                >
                  {activePlacements.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.organization?.name || `Placement ${p.id}`} ({p.start_date} to {p.end_date})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Week Ending Date (Friday)"
                  value={form.week_ending_date}
                  onChange={(e) => updateField('week_ending_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Tasks Completed"
              value={form.tasks_completed}
              onChange={(e) => updateField('tasks_completed', e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Tasks in Progress"
              value={form.tasks_in_progress}
              onChange={(e) => updateField('tasks_in_progress', e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Next Week Tasks"
              value={form.next_week_tasks}
              onChange={(e) => updateField('next_week_tasks', e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Problems / Challenges"
              value={form.challenges}
              onChange={(e) => updateField('challenges', e.target.value)}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, step: '0.5' }}
                  label="Hours Worked"
                  value={form.hours_worked}
                  onChange={(e) => updateField('hours_worked', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Skills Gained"
                  value={form.skills_gained}
                  onChange={(e) => updateField('skills_gained', e.target.value)}
                />
              </Grid>
            </Grid>

            <Button component="label" variant="outlined">
              {form.attachment ? `Selected: ${form.attachment.name}` : 'Upload Attachment'}
              <input
                type="file"
                hidden
                onChange={(e) => updateField('attachment', e.target.files?.[0] || null)}
              />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveDraft} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
        </DialogActions>
      </Dialog>

      <AppConfirmModal
        open={confirmSubmit.open}
        title="Submit Weekly Log"
        description="Once submitted, the log will be locked unless a supervisor requests revision. Continue?"
        confirmText="Submit"
        cancelText="Cancel"
        onClose={() => setConfirmSubmit({ open: false, logId: null })}
        onConfirm={submitLog}
      />

      <Dialog open={auditModal.open} onClose={() => setAuditModal({ open: false, loading: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle>Log Audit Trail</DialogTitle>
        <DialogContent>
          {auditModal.loading && <Alert severity="info">Loading audit trail...</Alert>}
          {!auditModal.loading && auditModal.data && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Transition History</Typography>
                <List dense>
                  {auditModal.data.audit_trail.map((event) => (
                    <ListItem key={event.id} divider>
                      <ListItemText
                        primary={`${event.action_type}: ${event.previous_state} -> ${event.new_state}`}
                        secondary={`${event.actor_name} at ${new Date(event.created_at).toLocaleString()}${event.notes ? ` | ${event.notes}` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Supervisor Review Rounds</Typography>
                <List dense>
                  {auditModal.data.reviews.map((review) => (
                    <ListItem key={review.id} divider>
                      <ListItemText
                        primary={`Round ${review.review_round}: ${review.decision}`}
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
          <Button onClick={() => setAuditModal({ open: false, loading: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewModal.open} onClose={() => setViewModal({ open: false, log: null })} maxWidth="md" fullWidth>
        <DialogTitle>Weekly Log Details</DialogTitle>
        <DialogContent>
          {viewModal.log && (
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Week {viewModal.log.week_number} ending {viewModal.log.week_ending_date}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {viewModal.log.placement_summary}
              </Typography>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary">Tasks Completed</Typography>
                <Typography variant="body2">{viewModal.log.tasks_completed || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Tasks In Progress</Typography>
                <Typography variant="body2">{viewModal.log.tasks_in_progress || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Next Week Tasks</Typography>
                <Typography variant="body2">{viewModal.log.next_week_tasks || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Challenges</Typography>
                <Typography variant="body2">{viewModal.log.challenges || 'N/A'}</Typography>
              </Box>

              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Hours Worked</Typography>
                  <Typography variant="body2">{viewModal.log.hours_worked ?? 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Skills Gained</Typography>
                  <Typography variant="body2">{viewModal.log.skills_gained || 'N/A'}</Typography>
                </Grid>
              </Grid>

              {viewModal.log.supervisor_comments && (
                <Alert severity="info">
                  Supervisor feedback: {viewModal.log.supervisor_comments}
                </Alert>
              )}

              <Stack direction="row" spacing={1}>
                {statusChip(viewModal.log)}
                <Chip label={`Round ${viewModal.log.review_round || 0}`} size="small" variant="outlined" />
              </Stack>

              {viewModal.log.attachment_url && (
                <Button component={Link} href={viewModal.log.attachment_url} target="_blank" rel="noreferrer" size="small" variant="outlined">
                  Open Attachment
                </Button>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModal({ open: false, log: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </PageScaffold>
  );
};

export default StudentLogsPage;
