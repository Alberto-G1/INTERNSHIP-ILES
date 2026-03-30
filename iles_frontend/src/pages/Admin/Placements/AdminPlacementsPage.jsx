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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';
import AppConfirmModal from '../../../components/Common/AppConfirmModal';
import { notifyError, notifySuccess } from '../../../components/Common/AppToast';
import { adminAPI, adminPlacementsAPI } from '../../../services/api';

const statusChip = (status) => {
  const map = {
    pending: { bg: 'var(--amber-100)', color: 'var(--amber-800)' },
    approved: { bg: 'var(--green-100)', color: 'var(--green-900)' },
    rejected: { bg: 'var(--coral-100)', color: 'var(--coral-700)' },
    cancelled: { bg: 'var(--coral-100)', color: 'var(--coral-700)' },
  };
  return map[status] || map.pending;
};

const AdminPlacementsPage = () => {
  const [placements, setPlacements] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    approval_status: '',
    submission_status: '',
    search: '',
  });

  const [approveModal, setApproveModal] = useState({ open: false, placement: null });
  const [reasonModal, setReasonModal] = useState({ open: false, placement: null, action: 'reject', reason: '' });
  const [assigning, setAssigning] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const [placementsRes, supervisorRes] = await Promise.all([
        adminPlacementsAPI.getPlacements(params),
        adminAPI.getSupervisorApprovals(),
      ]);

      setPlacements(placementsRes.data || []);
      setSupervisors((supervisorRes.data || []).filter((item) => item.admin_approved));
    } catch (err) {
      setError('Failed to load placement records.');
      notifyError('Failed to load placement records', { title: 'Load Failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const pending = placements.filter((p) => p.approval_status === 'pending').length;
    const approved = placements.filter((p) => p.approval_status === 'approved').length;
    const rejected = placements.filter((p) => p.approval_status === 'rejected').length;
    const submitted = placements.filter((p) => p.submission_status === 'submitted').length;

    return [
      { label: 'Submitted', value: String(submitted), helper: 'Ready for review', accent: '#F59E0B' },
      { label: 'Approved', value: String(approved), helper: 'Placement validated', accent: '#2E8B5B' },
      { label: 'Pending', value: String(pending), helper: 'Waiting decision', accent: '#5B82A6' },
      { label: 'Rejected', value: String(rejected), helper: 'Need correction', accent: '#C0392B' },
    ];
  }, [placements]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = async () => {
    await fetchData();
  };

  const makeDecision = async (placementId, action, reason = '') => {
    try {
      await adminPlacementsAPI.decidePlacement(placementId, { action, reason });
      notifySuccess(`Placement ${action}d successfully`, { title: 'Decision Saved' });
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to process placement decision.';
      notifyError(msg, { title: 'Decision Failed' });
    }
  };

  const openReasonModal = (placement, action) => {
    setReasonModal({ open: true, placement, action, reason: '' });
  };

  const handleReasonConfirm = async () => {
    if (!reasonModal.placement) return;
    await makeDecision(reasonModal.placement.id, reasonModal.action, reasonModal.reason);
    setReasonModal({ open: false, placement: null, action: 'reject', reason: '' });
  };

  const supervisorsByType = useMemo(() => {
    return {
      workplace: supervisors.filter((s) => s.role === 'workplace_supervisor'),
      academic: supervisors.filter((s) => s.role === 'academic_supervisor'),
    };
  }, [supervisors]);

  const handleAssign = async (placementId, field, value) => {
    try {
      setAssigning((prev) => ({ ...prev, [placementId]: true }));
      const payload = { [field]: value || null };
      await adminPlacementsAPI.assignSupervisors(placementId, payload);
      notifySuccess('Supervisor assignment updated', { title: 'Assignment Saved' });
      await fetchData();
    } catch (err) {
      notifyError('Failed to assign supervisor', { title: 'Assignment Failed' });
    } finally {
      setAssigning((prev) => ({ ...prev, [placementId]: false }));
    }
  };

  return (
    <PageScaffold
      title="Placement Review Center"
      subtitle="Validate student submissions, make decisions, and assign supervisors after approval"
      stats={stats}
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={1.2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Approval Status"
              value={filters.approval_status}
              onChange={(e) => handleFilterChange('approval_status', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Submission Status"
              value={filters.submission_status}
              onChange={(e) => handleFilterChange('submission_status', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search student or organization"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" sx={{ height: '54px' }} onClick={applyFilters}>
              Apply
            </Button>
          </Grid>
        </Grid>

        <Divider />

        {loading ? (
          <Typography sx={{ color: 'text.secondary' }}>Loading placements...</Typography>
        ) : placements.length === 0 ? (
          <Alert severity="info">No placements found for current filters.</Alert>
        ) : (
          <Stack spacing={1.2}>
            {placements.map((p) => {
              const chipStyle = statusChip(p.approval_status);
              const needsReview = p.submission_status === 'submitted' && p.approval_status === 'pending';
              const isAssigning = Boolean(assigning[p.id]);

              return (
                <Box key={p.id} sx={{ border: '1px solid var(--gray-200)', borderRadius: '12px', p: 1.4 }}>
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{p.student_name}</Typography>
                        <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
                          {p.organization?.name || 'No organization selected'}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                          {p.start_date || 'N/A'} - {p.end_date || 'N/A'}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                        <Chip size="small" label={p.approval_status.toUpperCase()} sx={{ bgcolor: chipStyle.bg, color: chipStyle.color, fontWeight: 600 }} />
                        <Chip size="small" label={p.submission_status.toUpperCase()} sx={{ bgcolor: 'var(--gray-100)', color: 'var(--gray-700)' }} />
                        {p.placement_letter_url && (
                          <Link href={p.placement_letter_url} target="_blank" rel="noreferrer" sx={{ fontSize: '12px' }}>
                            View Letter
                          </Link>
                        )}
                      </Stack>
                    </Stack>

                    {needsReview && (
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" onClick={() => setApproveModal({ open: true, placement: p })}>
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => openReasonModal(p, 'reject')}>
                          Reject
                        </Button>
                        <Button size="small" variant="outlined" color="warning" onClick={() => openReasonModal(p, 'cancel')}>
                          Cancel
                        </Button>
                      </Stack>
                    )}

                    {p.approval_status === 'approved' && (
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Workplace Supervisor"
                            value={p.workplace_supervisor || ''}
                            onChange={(e) => handleAssign(p.id, 'workplace_supervisor_id', e.target.value)}
                            disabled={isAssigning}
                          >
                            <MenuItem value="">Unassigned</MenuItem>
                            {supervisorsByType.workplace.map((s) => (
                              <MenuItem key={s.id} value={s.id}>{s.full_name || s.username}</MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Academic Supervisor"
                            value={p.academic_supervisor || ''}
                            onChange={(e) => handleAssign(p.id, 'academic_supervisor_id', e.target.value)}
                            disabled={isAssigning}
                          >
                            <MenuItem value="">Unassigned</MenuItem>
                            {supervisorsByType.academic.map((s) => (
                              <MenuItem key={s.id} value={s.id}>{s.full_name || s.username}</MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      </Grid>
                    )}

                    {(p.rejection_reason || p.cancellation_reason) && (
                      <Alert severity="warning">{p.rejection_reason || p.cancellation_reason}</Alert>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}

        <AppConfirmModal
          open={approveModal.open}
          onClose={() => setApproveModal({ open: false, placement: null })}
          onConfirm={async () => {
            if (!approveModal.placement) return;
            await makeDecision(approveModal.placement.id, 'approve');
            setApproveModal({ open: false, placement: null });
          }}
          title="Approve Placement?"
          description="Approving will activate supervisor assignment and lifecycle progression."
          confirmLabel="Approve"
          cancelLabel="Cancel"
          variant="approve"
          highlight={approveModal.placement ? `${approveModal.placement.student_name} · ${approveModal.placement.organization?.name || 'No Organization'}` : ''}
        />

        <Dialog open={reasonModal.open} onClose={() => setReasonModal({ open: false, placement: null, action: 'reject', reason: '' })} maxWidth="sm" fullWidth>
          <DialogTitle>{reasonModal.action === 'reject' ? 'Reject Placement' : 'Cancel Placement'}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Reason"
              value={reasonModal.reason}
              onChange={(e) => setReasonModal((prev) => ({ ...prev, reason: e.target.value }))}
              sx={{ mt: 0.8 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReasonModal({ open: false, placement: null, action: 'reject', reason: '' })}>Close</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleReasonConfirm}
              disabled={!reasonModal.reason.trim()}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </PageScaffold>
  );
};

export default AdminPlacementsPage;
