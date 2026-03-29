import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';
import { adminAPI } from '../../../services/api';
import AppConfirmModal from '../../../components/Common/AppConfirmModal';
import { notifyError, notifySuccess } from '../../../components/Common/AppToast';

const getRoleChipColor = (role) => {
  if (role === 'workplace_supervisor') return { bg: '#FEF3C7', color: '#B45309' };
  if (role === 'academic_supervisor') return { bg: '#DDEAF6', color: '#334D6E' };
  return { bg: '#EEF9F3', color: '#1A5C3A' };
};

const AdminApprovalsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [supervisors, setSupervisors] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmState, setConfirmState] = useState({
    open: false,
    user: null,
    approvedStatus: true,
  });

  const pending = useMemo(
    () => supervisors.filter((u) => !u.admin_approved),
    [supervisors]
  );

  const approved = useMemo(
    () => supervisors.filter((u) => u.admin_approved),
    [supervisors]
  );

  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getSupervisorApprovals();
      setSupervisors(response.data || []);
    } catch (err) {
      setError('Failed to load supervisor approvals.');
      notifyError('Failed to load supervisor approvals', { title: 'Load Failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const updateApproval = async (userId, approvedStatus) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      await adminAPI.updateSupervisorApproval(userId, approvedStatus);
      notifySuccess(approvedStatus ? 'Supervisor approved' : 'Approval revoked', {
        title: approvedStatus ? 'Approval Updated' : 'Access Revoked',
      });
      await fetchSupervisors();
    } catch (err) {
      notifyError('Failed to update approval status', { title: 'Update Failed' });
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const openConfirm = (user, approvedStatus) => {
    setConfirmState({ open: true, user, approvedStatus });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, user: null, approvedStatus: true });
  };

  const confirmApprovalAction = async () => {
    if (!confirmState.user) return;
    await updateApproval(confirmState.user.id, confirmState.approvedStatus);
    closeConfirm();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageScaffold
      title="Supervisor Approvals"
      subtitle="Approve academic and workplace supervisor accounts after first-login verification"
      stats={[
        { label: 'Pending', value: String(pending.length), helper: 'Awaiting approval', accent: '#F59E0B' },
        { label: 'Approved', value: String(approved.length), helper: 'Can access system', accent: '#2E8B5B' },
        { label: 'Total', value: String(supervisors.length), helper: 'Supervisor accounts', accent: '#5B82A6' },
        { label: 'Today', value: String(pending.length), helper: 'Need action', accent: '#C0392B' },
      ]}
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        {supervisors.length === 0 && (
          <Alert severity="info">No supervisor accounts found.</Alert>
        )}

        <Grid container spacing={2}>
          {supervisors.map((item) => {
            const roleStyle = getRoleChipColor(item.role);
            const name = item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.username;
            const isPending = !item.admin_approved;
            const busy = Boolean(actionLoading[item.id]);

            return (
              <Grid item xs={12} md={6} key={item.id}>
                <Card sx={{ border: '1px solid var(--gray-200)' }}>
                  <CardContent>
                    <Stack spacing={1.2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
                        <Chip
                          size="small"
                          label={isPending ? 'Pending Approval' : 'Approved'}
                          sx={{
                            bgcolor: isPending ? 'var(--amber-100)' : 'var(--green-100)',
                            color: isPending ? 'var(--amber-800)' : 'var(--green-900)',
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        <Chip
                          size="small"
                          label={item.role === 'academic_supervisor' ? 'Academic Supervisor' : 'Workplace Supervisor'}
                          sx={{ bgcolor: roleStyle.bg, color: roleStyle.color }}
                        />
                        <Chip
                          size="small"
                          label={item.first_login_completed ? 'First Login Completed' : 'No First Login Yet'}
                          sx={{
                            bgcolor: item.first_login_completed ? 'var(--slate-100)' : 'var(--gray-100)',
                            color: item.first_login_completed ? 'var(--slate-800)' : 'var(--gray-600)',
                          }}
                        />
                      </Stack>

                      <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>{item.email}</Typography>

                      <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={busy || !isPending}
                          onClick={() => openConfirm(item, true)}
                        >
                          {busy ? 'Updating...' : 'Approve'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          disabled={busy || isPending}
                          onClick={() => openConfirm(item, false)}
                        >
                          {busy ? 'Updating...' : 'Revoke'}
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <AppConfirmModal
          open={confirmState.open}
          onClose={closeConfirm}
          onConfirm={confirmApprovalAction}
          loading={Boolean(confirmState.user && actionLoading[confirmState.user.id])}
          title={confirmState.approvedStatus ? 'Approve Supervisor?' : 'Revoke Supervisor Access?'}
          description={
            confirmState.approvedStatus
              ? 'This supervisor will be granted full access to supervisor workflows in AILES.'
              : 'This supervisor account will lose access until approved again by an administrator.'
          }
          confirmLabel={confirmState.approvedStatus ? 'Approve' : 'Revoke'}
          cancelLabel="Cancel"
          variant={confirmState.approvedStatus ? 'approve' : 'delete'}
          highlight={
            confirmState.user
              ? `${confirmState.user.full_name || confirmState.user.username} · ${
                  confirmState.user.role === 'academic_supervisor' ? 'Academic Supervisor' : 'Workplace Supervisor'
                }`
              : ''
          }
        />
      </Stack>
    </PageScaffold>
  );
};

export default AdminApprovalsPage;
