import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Check as CheckIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import PageScaffold from '../../../components/Common/PageScaffold';
import { notifyError, notifySuccess } from '../../../components/Common/AppToast';
import { extractErrorMessage, placementsAPI, supervisorAPI } from '../../../services/api';
import { resolveMediaUrl } from '../../../utils/mediaUrl';

const renderSupervisorRole = (supervisor) => {
  if (!supervisor) return '';
  if (supervisor.role === 'academic_supervisor') return 'Academic Supervisor';
  if (supervisor.role === 'workplace_supervisor') return 'Workplace Supervisor';
  return 'Supervisor';
};

const renderSupervisorMeta = (supervisor) => {
  if (!supervisor) return [];

  const lines = [
    supervisor.position,
    supervisor.department,
    supervisor.organization_name,
    supervisor.location,
  ].filter(Boolean);

  return lines;
};

const WorkplaceSupervisorAssignmentPage = () => {
  const { placementId } = useParams();
  const navigate = useNavigate();
  const [placements, setPlacements] = useState([]);
  const [availableSupervisors, setAvailableSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [newSupervisor, setNewSupervisor] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    organization_name: '',
    department: '',
    position: '',
    location: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [placementsRes, supervisorsRes] = await Promise.all([
          placementsAPI.getMyPlacements(),
          supervisorAPI.getWorkplaceSupervisors(),
        ]);

        setPlacements(placementsRes.data || []);
        setAvailableSupervisors(supervisorsRes.data || []);
      } catch (err) {
        notifyError('Failed to load supervisor assignment data', { title: 'Load Failed' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [placementId]);

  const approvedPlacements = useMemo(
    () => placements.filter((p) => p.submission_status === 'submitted' && p.approval_status === 'approved'),
    [placements]
  );

  const targetPlacement = useMemo(() => {
    if (!approvedPlacements.length) return null;
    if (placementId) {
      return approvedPlacements.find((p) => String(p.id) === String(placementId)) || null;
    }
    return approvedPlacements[0];
  }, [approvedPlacements, placementId]);

  const hasWorkplaceSupervisorAssigned = Boolean(targetPlacement?.workplace_supervisor);
  const workplaceSupervisor = targetPlacement?.workplace_supervisor_details;
  const academicSupervisor = targetPlacement?.academic_supervisor_details;

  const refreshPlacement = async () => {
    const res = await placementsAPI.getMyPlacements();
    setPlacements(res.data || []);
  };

  const handleAssignExistingSupervisor = async () => {
    if (!targetPlacement || !selectedSupervisorId) {
      return;
    }

    try {
      setSaving(true);
      await placementsAPI.assignWorkplaceSupervisor(targetPlacement.id, {
        workplace_supervisor_id: Number(selectedSupervisorId),
      });

      await refreshPlacement();
      notifySuccess('Workplace supervisor assigned successfully', { title: 'Success' });
    } catch (err) {
      notifyError(extractErrorMessage(err.response?.data) || 'Failed to assign workplace supervisor', {
        title: 'Error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAndAssignSupervisor = async () => {
    if (!targetPlacement) {
      return;
    }

    const required = ['first_name', 'last_name', 'email', 'organization_name', 'department', 'position', 'location'];
    const missing = required.filter((field) => !String(newSupervisor[field] || '').trim());
    if (missing.length) {
      notifyError(`Please complete required fields: ${missing.join(', ')}`, { title: 'Missing Fields' });
      return;
    }

    try {
      setSaving(true);
      await placementsAPI.assignWorkplaceSupervisor(targetPlacement.id, {
        new_supervisor: newSupervisor,
      });
      await refreshPlacement();
      notifySuccess('New workplace supervisor created and assigned', { title: 'Success' });
      setNewSupervisor({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        organization_name: '',
        department: '',
        position: '',
        location: '',
      });
    } catch (err) {
      notifyError(extractErrorMessage(err.response?.data) || 'Failed to create and assign supervisor', {
        title: 'Error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageScaffold
        title="Assign Workplace Supervisor"
        subtitle="Assign a supervisor for your approved placement"
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </PageScaffold>
    );
  }

  if (!approvedPlacements.length) {
    return (
      <PageScaffold title="Supervisor Assignment" subtitle="Available after your placement is approved">
        <Alert severity="info" sx={{ mb: 2 }}>
          No approved placement found yet. Once your placement is approved, this page will allow workplace supervisor assignment.
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/placements')}>Back to Placements</Button>
      </PageScaffold>
    );
  }

  return (
    <PageScaffold
      title="Assign Workplace Supervisor"
      subtitle={`For placement at ${targetPlacement?.organization?.name || 'Unknown Organization'}`}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Placement Details</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography color="textSecondary" variant="caption">Organization</Typography>
                  <Typography variant="body1">{targetPlacement?.organization?.name}</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="caption">Position</Typography>
                  <Typography variant="body1">{targetPlacement?.position_role || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="caption">Academic Supervisor</Typography>
                  <Typography variant="body1">
                    {academicSupervisor?.full_name || 'Not assigned yet'}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="caption">Current Workplace Supervisor</Typography>
                  <Typography variant="body1">
                    {workplaceSupervisor?.full_name || (hasWorkplaceSupervisorAssigned ? 'Assigned' : 'Not assigned yet')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              {hasWorkplaceSupervisorAssigned ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Assigned Supervisors</Typography>
                    <Chip size="small" label="Complete" color="success" icon={<CheckIcon />} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Alert severity="success" sx={{ mb: 2 }}>
                    Workplace supervisor already assigned. Assignment section is hidden.
                  </Alert>

                  <Stack spacing={1.2}>
                    <Paper sx={{ p: 1.2, border: '1px solid #e5e7eb' }}>
                      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Academic Supervisor</Typography>
                      {academicSupervisor ? (
                        <>
                          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.5 }}>
                            <Avatar src={resolveMediaUrl(academicSupervisor.profile_picture)}>
                              {(academicSupervisor.full_name || 'A').charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{academicSupervisor.full_name}</Typography>
                          </Stack>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.4 }}>
                            {renderSupervisorRole(academicSupervisor)}
                          </Typography>
                          {renderSupervisorMeta(academicSupervisor).map((line) => (
                            <Typography key={line} sx={{ fontSize: 12, color: 'text.secondary' }}>
                              {line}
                            </Typography>
                          ))}
                          {(academicSupervisor.work_email || academicSupervisor.email) && (
                            <Typography sx={{ fontSize: 12, mt: 0.4 }}>
                              Email: {academicSupervisor.work_email || academicSupervisor.email}
                            </Typography>
                          )}
                          {(academicSupervisor.work_phone || academicSupervisor.phone || academicSupervisor.office_phone) && (
                            <Typography sx={{ fontSize: 12 }}>
                              Phone: {academicSupervisor.work_phone || academicSupervisor.phone || academicSupervisor.office_phone}
                            </Typography>
                          )}
                          {academicSupervisor.specialization && (
                            <Typography sx={{ fontSize: 12 }}>
                              Expertise: {academicSupervisor.specialization}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography sx={{ fontSize: 14 }}>Not assigned yet</Typography>
                      )}
                    </Paper>

                    <Paper sx={{ p: 1.2, border: '1px solid #e5e7eb' }}>
                      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Workplace Supervisor</Typography>
                      {workplaceSupervisor ? (
                        <>
                          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.5 }}>
                            <Avatar src={resolveMediaUrl(workplaceSupervisor.profile_picture)}>
                              {(workplaceSupervisor.full_name || 'W').charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{workplaceSupervisor.full_name}</Typography>
                          </Stack>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.4 }}>
                            {renderSupervisorRole(workplaceSupervisor)}
                          </Typography>
                          {renderSupervisorMeta(workplaceSupervisor).map((line) => (
                            <Typography key={line} sx={{ fontSize: 12, color: 'text.secondary' }}>
                              {line}
                            </Typography>
                          ))}
                          {(workplaceSupervisor.work_email || workplaceSupervisor.email) && (
                            <Typography sx={{ fontSize: 12, mt: 0.4 }}>
                              Email: {workplaceSupervisor.work_email || workplaceSupervisor.email}
                            </Typography>
                          )}
                          {(workplaceSupervisor.work_phone || workplaceSupervisor.phone || workplaceSupervisor.office_phone) && (
                            <Typography sx={{ fontSize: 12 }}>
                              Phone: {workplaceSupervisor.work_phone || workplaceSupervisor.phone || workplaceSupervisor.office_phone}
                            </Typography>
                          )}
                          {workplaceSupervisor.specialization && (
                            <Typography sx={{ fontSize: 12 }}>
                              Expertise: {workplaceSupervisor.specialization}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography sx={{ fontSize: 14 }}>
                          {hasWorkplaceSupervisorAssigned ? 'Assigned' : 'Not assigned yet'}
                        </Typography>
                      )}
                    </Paper>
                  </Stack>
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Assign Workplace Supervisor</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Alert severity="info" sx={{ mb: 2 }}>
                    Choose an existing workplace supervisor or add a new one from your workplace.
                  </Alert>

                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {availableSupervisors.map((supervisor) => (
                      <Paper
                        key={supervisor.id}
                        onClick={() => setSelectedSupervisorId(String(supervisor.id))}
                        sx={{
                          p: 1.2,
                          border: selectedSupervisorId === String(supervisor.id) ? '2px solid #2E8B5B' : '1px solid #e5e7eb',
                          cursor: 'pointer',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{ bgcolor: '#F59E0B' }}
                            src={resolveMediaUrl(supervisor.profile_picture)}
                            alt={`${(supervisor.first_name || '').trim()} ${(supervisor.last_name || '').trim()}`}
                          >
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                              {(supervisor.first_name || '').trim()} {(supervisor.last_name || '').trim()}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                              {supervisor.supervisor_profile?.position || 'Supervisor'}
                              {supervisor.supervisor_profile?.organization_name ? ` • ${supervisor.supervisor_profile.organization_name}` : ''}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                              {supervisor.supervisor_profile?.department || 'Department not specified'}
                              {supervisor.supervisor_profile?.location ? ` • ${supervisor.supervisor_profile.location}` : ''}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                              {supervisor.supervisor_profile?.work_email || supervisor.email}
                              {(supervisor.supervisor_profile?.work_phone || supervisor.phone)
                                ? ` • ${supervisor.supervisor_profile?.work_phone || supervisor.phone}`
                                : ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={handleAssignExistingSupervisor}
                    disabled={saving || !selectedSupervisorId}
                    sx={{ mb: 2 }}
                  >
                    {saving ? 'Assigning...' : 'Assign Selected Existing Supervisor'}
                  </Button>

                  <Divider sx={{ mb: 2 }} />

                  <Typography sx={{ fontWeight: 600, mb: 1 }}>Add New Workplace Supervisor</Typography>
                  <Grid container spacing={1.2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="First name"
                        value={newSupervisor.first_name}
                        onChange={(e) => setNewSupervisor((prev) => ({ ...prev, first_name: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Last name"
                        value={newSupervisor.last_name}
                        onChange={(e) => setNewSupervisor((prev) => ({ ...prev, last_name: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={newSupervisor.email}
                        onChange={(e) => setNewSupervisor((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone (optional)"
                        value={newSupervisor.phone}
                        onChange={(e) => setNewSupervisor((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Organization"
                        value={newSupervisor.organization_name}
                        onChange={(e) => setNewSupervisor((prev) => ({ ...prev, organization_name: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        value={newSupervisor.department}
                        onChange={(e) => setNewSupervisor((prev) => ({ ...prev, department: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Position"
                        value={newSupervisor.position}
                        onChange={(e) => setNewSupervisor((prev) => ({ ...prev, position: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={newSupervisor.location}
                        onChange={(e) => setNewSupervisor((prev) => ({ ...prev, location: e.target.value }))}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    variant="outlined"
                    onClick={handleCreateAndAssignSupervisor}
                    disabled={saving}
                    sx={{ mt: 1.5 }}
                  >
                    {saving ? 'Saving...' : 'Create and Assign New Supervisor'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {approvedPlacements.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          {approvedPlacements.map((placement) => (
            <Button
              key={placement.id}
              size="small"
              component={RouterLink}
              to={`/placements/${placement.id}/supervisor`}
              variant={targetPlacement?.id === placement.id ? 'contained' : 'outlined'}
            >
              {placement.organization?.name || `Placement #${placement.id}`}
            </Button>
          ))}
        </Stack>
      )}

      <Button startIcon={<BackIcon />} onClick={() => navigate('/placements')} sx={{ mt: 2 }}>
        Back to Placements
      </Button>
    </PageScaffold>
  );
};

export default WorkplaceSupervisorAssignmentPage;
