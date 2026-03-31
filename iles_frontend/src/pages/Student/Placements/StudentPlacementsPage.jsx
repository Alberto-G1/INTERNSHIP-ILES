import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { placementsAPI } from '../../../services/api';

const workModes = [
  { value: 'on-site', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

const lifecycleColor = (status) => {
  const map = {
    draft: { bg: 'var(--gray-100)', color: 'var(--gray-700)' },
    pending: { bg: 'var(--amber-100)', color: 'var(--amber-800)' },
    approved: { bg: 'var(--blue-100)', color: 'var(--blue-700)' },
    active: { bg: 'var(--green-100)', color: 'var(--green-900)' },
    completed: { bg: 'var(--slate-100)', color: 'var(--slate-700)' },
    rejected: { bg: 'var(--coral-100)', color: 'var(--coral-700)' },
    cancelled: { bg: 'var(--coral-100)', color: 'var(--coral-700)' },
  };
  return map[status] || map.pending;
};

const emptyForm = {
  id: null,
  organization_id: '',
  position_role: '',
  start_date: '',
  end_date: '',
  allowance: '',
  work_mode: 'on-site',
  placement_letter: null,
};

const emptyOrganizationForm = {
  name: '',
  industry: '',
  contact_email: '',
  contact_phone: '',
  region: '',
  district: '',
  county: '',
  sub_county: '',
  parish: '',
  village: '',
  full_address: '',
};

const StudentPlacementsPage = () => {
  const [placements, setPlacements] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState({ open: false, placementId: null });
  const [placementModalOpen, setPlacementModalOpen] = useState(false);
  const [useNewOrganization, setUseNewOrganization] = useState(false);
  const [organizationForm, setOrganizationForm] = useState(emptyOrganizationForm);
  const [organizationSaving, setOrganizationSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [placementsRes, organizationsRes] = await Promise.all([
        placementsAPI.getMyPlacements(),
        placementsAPI.getOrganizations(),
      ]);
      setPlacements(placementsRes.data || []);
      setOrganizations(organizationsRes.data || []);
    } catch (err) {
      setError('Failed to load placements data.');
      notifyError('Failed to load placements data', { title: 'Load Failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const drafts = placements.filter((p) => p.submission_status === 'draft').length;
    const pending = placements.filter((p) => p.current_lifecycle_status === 'pending').length;
    const active = placements.filter((p) => p.current_lifecycle_status === 'active').length;
    const completed = placements.filter((p) => p.current_lifecycle_status === 'completed').length;

    return [
      { label: 'Drafts', value: String(drafts), helper: 'Editable records', accent: '#9CA3AF' },
      { label: 'Pending', value: String(pending), helper: 'Awaiting admin review', accent: '#F59E0B' },
      { label: 'Active', value: String(active), helper: 'Current internship', accent: '#2E8B5B' },
      { label: 'Completed', value: String(completed), helper: 'Past placements', accent: '#5B82A6' },
    ];
  }, [placements]);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
  };

  const openCreatePlacementModal = () => {
    resetForm();
    setUseNewOrganization(false);
    setOrganizationForm(emptyOrganizationForm);
    setPlacementModalOpen(true);
  };

  const loadDraftToForm = (placement) => {
    setForm({
      id: placement.id,
      organization_id: placement.organization?.id || '',
      position_role: placement.position_role || '',
      start_date: placement.start_date || '',
      end_date: placement.end_date || '',
      allowance: placement.allowance || '',
      work_mode: placement.work_mode || 'on-site',
      placement_letter: null,
    });
    setUseNewOrganization(false);
    setOrganizationForm(emptyOrganizationForm);
    setPlacementModalOpen(true);
  };

  const buildFormData = (organizationId = form.organization_id) => {
    const payload = new FormData();
    if (organizationId) payload.append('organization_id', organizationId);
    if (form.position_role) payload.append('position_role', form.position_role);
    if (form.start_date) payload.append('start_date', form.start_date);
    if (form.end_date) payload.append('end_date', form.end_date);
    if (form.allowance !== '' && form.allowance !== null) payload.append('allowance', form.allowance);
    if (form.work_mode) payload.append('work_mode', form.work_mode);
    if (form.placement_letter) payload.append('placement_letter', form.placement_letter);
    return payload;
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      let organizationId = form.organization_id;

      if (useNewOrganization) {
        if (
          !organizationForm.name.trim()
          || !organizationForm.region.trim()
          || !organizationForm.district.trim()
          || !organizationForm.full_address.trim()
        ) {
          notifyError('Provide organization name, region, district, and full address.', {
            title: 'Organization Details Missing',
          });
          return;
        }

        setOrganizationSaving(true);
        const orgResponse = await placementsAPI.createOrganization({
          ...organizationForm,
          is_verified: false,
        });

        const createdOrg = orgResponse.data;
        organizationId = createdOrg.id;
        setOrganizations((prev) => {
          const exists = prev.some((item) => item.id === createdOrg.id);
          if (exists) return prev;
          return [createdOrg, ...prev];
        });
      }

      const payload = buildFormData(organizationId);

      if (form.id) {
        await placementsAPI.updateDraftPlacement(form.id, payload);
        notifySuccess('Draft placement updated successfully', { title: 'Draft Saved' });
      } else {
        await placementsAPI.createDraftPlacement(payload);
        notifySuccess('Draft placement created successfully', { title: 'Draft Created' });
      }

      await fetchData();
      resetForm();
      setUseNewOrganization(false);
      setOrganizationForm(emptyOrganizationForm);
      setPlacementModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save draft placement.';
      notifyError(msg, { title: 'Save Failed' });
    } finally {
      setSaving(false);
      setOrganizationSaving(false);
    }
  };

  const openSubmitConfirm = (placementId) => {
    setConfirmSubmit({ open: true, placementId });
  };

  const handleSubmitPlacement = async () => {
    if (!confirmSubmit.placementId) return;

    try {
      setSubmittingId(confirmSubmit.placementId);
      await placementsAPI.submitPlacement(confirmSubmit.placementId);
      notifySuccess('Placement submitted for admin review', { title: 'Submitted' });
      await fetchData();
      if (form.id === confirmSubmit.placementId) {
        resetForm();
      }
    } catch (err) {
      const data = err.response?.data;
      const message = typeof data === 'string' ? data : data?.error || 'Submission failed. Check required fields and letter upload.';
      notifyError(message, { title: 'Submission Failed' });
    } finally {
      setSubmittingId(null);
      setConfirmSubmit({ open: false, placementId: null });
    }
  };

  const draftPlacements = placements.filter((p) => p.submission_status === 'draft');

  const handleOrganizationFieldChange = (field, value) => {
    setOrganizationForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <PageScaffold
      title="My Placements"
      subtitle="Create draft placements, upload your placement letter, and submit for admin approval"
      stats={stats}
    >
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>Placement Draft</Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                Use the popup form to create or update your draft placement before submission.
              </Typography>
            </Box>
            <Button variant="contained" onClick={openCreatePlacementModal}>
              Create Draft Placement
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>My Placement Records</Typography>
          {loading ? (
            <Typography sx={{ color: 'text.secondary' }}>Loading placements...</Typography>
          ) : placements.length === 0 ? (
            <Alert severity="info">No placements yet. Start by creating a draft.</Alert>
          ) : (
            <Stack spacing={1.2}>
              {placements.map((placement) => {
                const lifecycle = placement.current_lifecycle_status;
                const chipStyle = lifecycleColor(lifecycle);
                const isDraft = placement.submission_status === 'draft';
                const submitting = submittingId === placement.id;

                return (
                  <Box
                    key={placement.id}
                    sx={{
                      border: '1px solid var(--gray-200)',
                      borderRadius: '12px',
                      p: 1.4,
                      bgcolor: 'var(--panel-bg)',
                    }}
                  >
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          {placement.organization?.name || 'Organization Not Selected'}
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
                          {placement.position_role || 'No role specified'}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.3 }}>
                          {placement.start_date || 'N/A'} - {placement.end_date || 'N/A'}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                        <Chip
                          size="small"
                          label={lifecycle.toUpperCase()}
                          sx={{ bgcolor: chipStyle.bg, color: chipStyle.color, fontWeight: 600 }}
                        />
                        <Chip
                          size="small"
                          label={placement.submission_status.toUpperCase()}
                          sx={{ bgcolor: 'var(--gray-100)', color: 'var(--gray-700)' }}
                        />
                        {placement.placement_letter_url && (
                          <Link href={placement.placement_letter_url} target="_blank" rel="noreferrer" sx={{ fontSize: '12px' }}>
                            Letter
                          </Link>
                        )}
                        {isDraft && (
                          <>
                            <Button size="small" variant="outlined" onClick={() => loadDraftToForm(placement)}>
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => openSubmitConfirm(placement.id)}
                              disabled={submitting}
                            >
                              {submitting ? 'Submitting...' : 'Submit'}
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Stack>

                    {(placement.rejection_reason || placement.cancellation_reason) && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        {placement.rejection_reason || placement.cancellation_reason}
                      </Alert>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}

          {draftPlacements.length === 0 && (
            <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 1 }}>
              Only draft placements can be edited and submitted from this page.
            </Typography>
          )}
        </Box>

        <AppConfirmModal
          open={confirmSubmit.open}
          onClose={() => setConfirmSubmit({ open: false, placementId: null })}
          onConfirm={handleSubmitPlacement}
          title="Submit Placement for Approval?"
          description="Once submitted, this record moves to admin review and is no longer student-editable as a draft."
          confirmLabel="Submit"
          cancelLabel="Keep Draft"
          variant="submit"
        />

        <Dialog
          open={placementModalOpen}
          onClose={() => {
            setPlacementModalOpen(false);
            resetForm();
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{form.id ? 'Edit Draft Placement' : 'Create Draft Placement'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={1.4} sx={{ mt: 0.1 }}>
              <Grid item xs={12} md={6}>
                <Stack spacing={0.8}>
                  {!useNewOrganization ? (
                    <TextField
                      select
                      fullWidth
                      label="Organization"
                      value={form.organization_id}
                      onChange={(e) => handleFieldChange('organization_id', e.target.value)}
                    >
                      {organizations.map((org) => (
                        <MenuItem key={org.id} value={org.id}>
                          {org.name} {org.is_verified ? '' : '(Unverified)'}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <Alert severity="info" sx={{ mb: 0.5 }}>
                      Enter your specific organization details below. It will be created and linked to this placement.
                    </Alert>
                  )}
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant={useNewOrganization ? 'outlined' : 'contained'}
                      onClick={() => setUseNewOrganization(false)}
                    >
                      Select Existing
                    </Button>
                    <Button
                      size="small"
                      variant={useNewOrganization ? 'contained' : 'outlined'}
                      onClick={() => {
                        setUseNewOrganization(true);
                        handleFieldChange('organization_id', '');
                      }}
                    >
                      Add Specific Organization
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Position / Role"
                  value={form.position_role}
                  onChange={(e) => handleFieldChange('position_role', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={form.start_date}
                  onChange={(e) => handleFieldChange('start_date', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={form.end_date}
                  onChange={(e) => handleFieldChange('end_date', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Allowance (Optional)"
                  value={form.allowance}
                  onChange={(e) => handleFieldChange('allowance', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Work Mode"
                  value={form.work_mode}
                  onChange={(e) => handleFieldChange('work_mode', e.target.value)}
                >
                  {workModes.map((mode) => (
                    <MenuItem key={mode.value} value={mode.value}>{mode.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button variant="outlined" component="label" fullWidth sx={{ height: '54px' }}>
                  {form.placement_letter ? 'Letter Selected (PDF)' : 'Upload Placement Letter (PDF)'}
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={(e) => handleFieldChange('placement_letter', e.target.files?.[0] || null)}
                  />
                </Button>
              </Grid>

              {useNewOrganization && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>Specific Organization Details</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Organization Name"
                      value={organizationForm.name}
                      onChange={(e) => handleOrganizationFieldChange('name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Industry"
                      value={organizationForm.industry}
                      onChange={(e) => handleOrganizationFieldChange('industry', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      type="email"
                      value={organizationForm.contact_email}
                      onChange={(e) => handleOrganizationFieldChange('contact_email', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Phone"
                      value={organizationForm.contact_phone}
                      onChange={(e) => handleOrganizationFieldChange('contact_phone', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Region"
                      value={organizationForm.region}
                      onChange={(e) => handleOrganizationFieldChange('region', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="District"
                      value={organizationForm.district}
                      onChange={(e) => handleOrganizationFieldChange('district', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="County"
                      value={organizationForm.county}
                      onChange={(e) => handleOrganizationFieldChange('county', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Sub-County"
                      value={organizationForm.sub_county}
                      onChange={(e) => handleOrganizationFieldChange('sub_county', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Parish"
                      value={organizationForm.parish}
                      onChange={(e) => handleOrganizationFieldChange('parish', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Village"
                      value={organizationForm.village}
                      onChange={(e) => handleOrganizationFieldChange('village', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Full Address"
                      value={organizationForm.full_address}
                      onChange={(e) => handleOrganizationFieldChange('full_address', e.target.value)}
                      required
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setPlacementModalOpen(false);
                resetForm();
                setUseNewOrganization(false);
                setOrganizationForm(emptyOrganizationForm);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveDraft} disabled={saving || organizationSaving}>
              {saving ? 'Saving...' : form.id ? 'Update Draft' : 'Save Draft'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </PageScaffold>
  );
};

export default StudentPlacementsPage;
