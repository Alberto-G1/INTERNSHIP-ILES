import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';
import { useAuth } from '../../context/AuthContext';
import { adminPlacementsAPI, evaluationsAPI, placementsAPI } from '../../services/api';
import { notifyError, notifySuccess } from '../../components/Common/AppToast';

const statusColor = {
  draft: 'default',
  submitted: 'info',
  finalized: 'success',
};

const CRITERIA_SEARCH_KEY = 'evaluations.admin.criteria.search';
const CRITERIA_FILTER_KEY = 'evaluations.admin.criteria.filter';
const CRITERIA_SORT_BY_KEY = 'evaluations.admin.criteria.sortBy';
const CRITERIA_SORT_DIR_KEY = 'evaluations.admin.criteria.sortDir';

const readStored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ?? fallback;
  } catch (_error) {
    return fallback;
  }
};

const EvaluationsPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [criteria, setCriteria] = useState([]);

  const [supervisorEvaluations, setSupervisorEvaluations] = useState([]);
  const [studentEvaluations, setStudentEvaluations] = useState([]);
  const [studentFinalScores, setStudentFinalScores] = useState([]);
  const [assignedPlacements, setAssignedPlacements] = useState([]);
  const [adminCriteria, setAdminCriteria] = useState([]);
  const [adminFinalScores, setAdminFinalScores] = useState([]);
  const [adminPlacementOptions, setAdminPlacementOptions] = useState([]);
  const [selectedPlacementComputeId, setSelectedPlacementComputeId] = useState('');
  const [adminScoreSearch, setAdminScoreSearch] = useState('');
  const [adminScoreGradeFilter, setAdminScoreGradeFilter] = useState('all');

  const [criterionName, setCriterionName] = useState('');
  const [criterionDescription, setCriterionDescription] = useState('');
  const [criterionMaxScore, setCriterionMaxScore] = useState('20');
  const [criterionWeight, setCriterionWeight] = useState('1');
  const [criterionDisplayOrder, setCriterionDisplayOrder] = useState('1');

  const [editingCriterionId, setEditingCriterionId] = useState('');
  const [editingDraft, setEditingDraft] = useState({});
  const [criteriaSearch, setCriteriaSearch] = useState(() => readStored(CRITERIA_SEARCH_KEY, ''));
  const [criteriaStatusFilter, setCriteriaStatusFilter] = useState(() => readStored(CRITERIA_FILTER_KEY, 'all'));
  const [criteriaSortBy, setCriteriaSortBy] = useState(() => readStored(CRITERIA_SORT_BY_KEY, 'display_order'));
  const [criteriaSortDirection, setCriteriaSortDirection] = useState(() => readStored(CRITERIA_SORT_DIR_KEY, 'asc'));
  const [criteriaBusyIds, setCriteriaBusyIds] = useState([]);

  const [selectedEvaluationId, setSelectedEvaluationId] = useState('');
  const [selectedPlacementId, setSelectedPlacementId] = useState('');
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState('');

  const role = user?.role;

  const selectedEvaluation = useMemo(
    () => supervisorEvaluations.find((item) => item.id === Number(selectedEvaluationId)) || null,
    [supervisorEvaluations, selectedEvaluationId]
  );

  const evaluatedPlacementIds = useMemo(
    () => new Set(supervisorEvaluations.map((item) => item.placement)),
    [supervisorEvaluations]
  );

  const availablePlacements = useMemo(
    () => assignedPlacements.filter((placement) => !evaluatedPlacementIds.has(placement.id)),
    [assignedPlacements, evaluatedPlacementIds]
  );

  const computedTotal = useMemo(() => {
    return criteria.reduce((sum, criterion) => {
      const value = Number(scores[criterion.id] ?? 0);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [criteria, scores]);

  const maxPossible = useMemo(() => {
    return criteria.reduce((sum, criterion) => sum + Number(criterion.max_score || 0), 0);
  }, [criteria]);

  const visibleAdminCriteria = useMemo(() => {
    const query = criteriaSearch.trim().toLowerCase();
    const filtered = adminCriteria.filter((criterion) => {
      const matchesQuery =
        query.length === 0 ||
        criterion.name.toLowerCase().includes(query) ||
        (criterion.description || '').toLowerCase().includes(query);

      const matchesStatus =
        criteriaStatusFilter === 'all' ||
        (criteriaStatusFilter === 'active' && criterion.is_active) ||
        (criteriaStatusFilter === 'inactive' && !criterion.is_active);

      return matchesQuery && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      let left = a[criteriaSortBy];
      let right = b[criteriaSortBy];

      if (criteriaSortBy === 'name') {
        left = String(left || '').toLowerCase();
        right = String(right || '').toLowerCase();
      } else {
        left = Number(left || 0);
        right = Number(right || 0);
      }

      if (left < right) {
        return criteriaSortDirection === 'asc' ? -1 : 1;
      }
      if (left > right) {
        return criteriaSortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [adminCriteria, criteriaSearch, criteriaSortBy, criteriaSortDirection, criteriaStatusFilter]);

  const visibleAdminFinalScores = useMemo(() => {
    const query = adminScoreSearch.trim().toLowerCase();
    return adminFinalScores.filter((item) => {
      const gradeMatch = adminScoreGradeFilter === 'all' || item.grade === adminScoreGradeFilter;
      if (!gradeMatch) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        (item.student_name || '').toLowerCase().includes(query)
        || (item.placement_summary || '').toLowerCase().includes(query)
      );
    });
  }, [adminFinalScores, adminScoreGradeFilter, adminScoreSearch]);

  useEffect(() => {
    try {
      localStorage.setItem(CRITERIA_SEARCH_KEY, criteriaSearch);
      localStorage.setItem(CRITERIA_FILTER_KEY, criteriaStatusFilter);
      localStorage.setItem(CRITERIA_SORT_BY_KEY, criteriaSortBy);
      localStorage.setItem(CRITERIA_SORT_DIR_KEY, criteriaSortDirection);
    } catch (_error) {
      // Ignore storage write failures (private mode, quota, etc.)
    }
  }, [criteriaSearch, criteriaSortBy, criteriaSortDirection, criteriaStatusFilter]);

  const stats = useMemo(() => {
    if (role === 'academic_supervisor') {
      const finalizedCount = supervisorEvaluations.filter((item) => item.status === 'finalized').length;
      const submittedCount = supervisorEvaluations.filter((item) => item.status === 'submitted').length;
      const draftCount = supervisorEvaluations.filter((item) => item.status === 'draft').length;
      const avg =
        supervisorEvaluations.length === 0
          ? 0
          : (
              supervisorEvaluations.reduce((sum, item) => sum + Number(item.total_score || 0), 0) /
              supervisorEvaluations.length
            ).toFixed(1);

      return [
        { label: 'Drafts', value: String(draftCount), helper: 'Work in progress', accent: '#F59E0B' },
        { label: 'Submitted', value: String(submittedCount), helper: 'Awaiting final signoff', accent: '#5B82A6' },
        { label: 'Finalized', value: String(finalizedCount), helper: 'Locked records', accent: '#2E8B5B' },
        { label: 'Average Score', value: String(avg), helper: 'Across your evaluations', accent: '#C0392B' },
      ];
    }

    if (role === 'student') {
      const finalizedCount = studentEvaluations.filter((item) => item.status === 'finalized').length;
      const submittedCount = studentEvaluations.filter((item) => item.status === 'submitted').length;
      const draftCount = studentEvaluations.filter((item) => item.status === 'draft').length;
      const bestGrade = studentEvaluations.find((item) => item.grade)?.grade || '-';
      return [
        { label: 'Draft', value: String(draftCount), helper: 'Not submitted', accent: '#F59E0B' },
        { label: 'Submitted', value: String(submittedCount), helper: 'Pending finalization', accent: '#5B82A6' },
        { label: 'Finalized', value: String(finalizedCount), helper: 'Official outcomes', accent: '#2E8B5B' },
        { label: 'Best Grade', value: bestGrade, helper: 'Current record', accent: '#C0392B' },
      ];
    }

    if (role === 'admin') {
      const activeCount = adminCriteria.filter((item) => item.is_active).length;
      const inactiveCount = adminCriteria.length - activeCount;
      const weightedTotal = adminCriteria.reduce(
        (sum, item) => sum + Number(item.max_score || 0) * Number(item.weight || 0),
        0
      );

      return [
        { label: 'Criteria', value: String(adminCriteria.length), helper: 'Total configured', accent: '#5B82A6' },
        { label: 'Active', value: String(activeCount), helper: 'Used in evaluation', accent: '#2E8B5B' },
        { label: 'Inactive', value: String(inactiveCount), helper: 'Excluded from scoring', accent: '#C0392B' },
        { label: 'Weighted Sum', value: weightedTotal.toFixed(2), helper: 'max_score × weight', accent: '#F59E0B' },
      ];
    }

    return [
      { label: 'Role', value: role || '-', helper: 'No evaluation dashboard', accent: '#5B82A6' },
      { label: '-', value: '-', helper: '-', accent: '#5B82A6' },
      { label: '-', value: '-', helper: '-', accent: '#5B82A6' },
      { label: '-', value: '-', helper: '-', accent: '#5B82A6' },
    ];
  }, [adminCriteria, role, studentEvaluations, supervisorEvaluations]);

  const hydrateFormFromEvaluation = (evaluation) => {
    const nextScores = {};
    evaluation.criteria_scores.forEach((entry) => {
      nextScores[entry.criterion] = entry.score;
    });
    setScores(nextScores);
    setFeedback(evaluation.general_feedback || '');
    setSelectedPlacementId(String(evaluation.placement));
  };

  const resetForm = () => {
    setSelectedEvaluationId('');
    setSelectedPlacementId('');
    setFeedback('');
    setScores({});
  };

  const loadSupervisorData = async () => {
    const [criteriaRes, evalRes, placementRes] = await Promise.all([
      evaluationsAPI.getCriteria(),
      evaluationsAPI.getSupervisorEvaluations(),
      placementsAPI.getAssignedPlacements(),
    ]);

    setCriteria(criteriaRes.data.filter((item) => item.is_active));
    setSupervisorEvaluations(evalRes.data);
    setAssignedPlacements(placementRes.data);
  };

  const loadStudentData = async () => {
    const [evalRes, finalScoreRes] = await Promise.all([
      evaluationsAPI.getStudentEvaluations(),
      evaluationsAPI.getStudentFinalScores(),
    ]);
    setStudentEvaluations(evalRes.data);
    setStudentFinalScores(finalScoreRes.data);
  };

  const loadAdminData = async () => {
    const [criteriaRes, finalScoreRes, placementRes] = await Promise.all([
      evaluationsAPI.getCriteria(),
      evaluationsAPI.getAdminFinalScores(),
      adminPlacementsAPI.getPlacements({ approval_status: 'approved', page_size: 100 }),
    ]);
    setAdminCriteria(criteriaRes.data);
    setAdminFinalScores(finalScoreRes.data);
    setAdminPlacementOptions(placementRes.data.results || placementRes.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (role === 'academic_supervisor') {
          await loadSupervisorData();
        } else if (role === 'student') {
          await loadStudentData();
        } else if (role === 'admin') {
          await loadAdminData();
        }
      } catch (_error) {
        notifyError('Failed to load evaluation data', { title: 'Load Failed' });
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      load();
    }
  }, [role]);

  const buildScorePayload = () => {
    return criteria
      .filter((criterion) => scores[criterion.id] !== undefined && scores[criterion.id] !== '')
      .map((criterion) => ({
        criterion_id: criterion.id,
        score: Number(scores[criterion.id]),
      }));
  };

  const reloadSupervisor = async (opts = {}) => {
    await loadSupervisorData();
    if (opts.keepSelectionId) {
      setSelectedEvaluationId(String(opts.keepSelectionId));
      const latest = (await evaluationsAPI.getSupervisorEvaluation(opts.keepSelectionId)).data;
      hydrateFormFromEvaluation(latest);
    } else {
      resetForm();
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const payload = {
        general_feedback: feedback,
        scores: buildScorePayload(),
      };

      if (selectedEvaluation) {
        await evaluationsAPI.updateSupervisorEvaluation(selectedEvaluation.id, payload);
        notifySuccess('Draft updated successfully', { title: 'Saved' });
        await reloadSupervisor({ keepSelectionId: selectedEvaluation.id });
      } else {
        if (!selectedPlacementId) {
          notifyError('Select a placement before creating an evaluation', { title: 'Missing Placement' });
          return;
        }
        await evaluationsAPI.createSupervisorEvaluation({
          placement_id: Number(selectedPlacementId),
          ...payload,
        });
        notifySuccess('Evaluation draft created', { title: 'Draft Created' });
        await reloadSupervisor();
      }
    } catch (_error) {
      notifyError('Unable to save evaluation draft', { title: 'Save Failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedEvaluation) {
      notifyError('Choose an existing evaluation to submit', { title: 'No Evaluation Selected' });
      return;
    }

    try {
      setSaving(true);
      await evaluationsAPI.submitSupervisorEvaluation(selectedEvaluation.id);
      notifySuccess('Evaluation submitted successfully', { title: 'Submitted' });
      await reloadSupervisor({ keepSelectionId: selectedEvaluation.id });
    } catch (_error) {
      notifyError('Submission failed. Ensure all criteria and feedback are completed.', {
        title: 'Submit Failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizeEvaluation = async () => {
    if (!selectedEvaluation) {
      notifyError('Choose an existing evaluation to finalize', { title: 'No Evaluation Selected' });
      return;
    }

    try {
      setSaving(true);
      await evaluationsAPI.finalizeSupervisorEvaluation(selectedEvaluation.id);
      notifySuccess('Evaluation finalized and locked', { title: 'Finalized' });
      await reloadSupervisor({ keepSelectionId: selectedEvaluation.id });
    } catch (_error) {
      notifyError('Finalization failed. Submit the evaluation first.', { title: 'Finalize Failed' });
    } finally {
      setSaving(false);
    }
  };

  const resetAdminCriterionForm = () => {
    setCriterionName('');
    setCriterionDescription('');
    setCriterionMaxScore('20');
    setCriterionWeight('1');
    setCriterionDisplayOrder(String(adminCriteria.length + 1));
  };

  const handleCreateCriterion = async () => {
    if (!criterionName.trim()) {
      notifyError('Criterion name is required', { title: 'Validation Error' });
      return;
    }

    try {
      setSaving(true);
      await evaluationsAPI.createCriterion({
        name: criterionName.trim(),
        description: criterionDescription,
        max_score: Number(criterionMaxScore),
        weight: Number(criterionWeight),
        display_order: Number(criterionDisplayOrder),
        is_active: true,
      });
      notifySuccess('Criterion created successfully', { title: 'Created' });
      await loadAdminData();
      resetAdminCriterionForm();
    } catch (_error) {
      notifyError('Could not create criterion', { title: 'Create Failed' });
    } finally {
      setSaving(false);
    }
  };

  const startEditCriterion = (criterion) => {
    setEditingCriterionId(String(criterion.id));
    setEditingDraft({
      name: criterion.name,
      description: criterion.description || '',
      max_score: criterion.max_score,
      weight: criterion.weight,
      display_order: criterion.display_order,
      is_active: criterion.is_active,
    });
  };

  const cancelEditCriterion = () => {
    setEditingCriterionId('');
    setEditingDraft({});
  };

  const markCriterionBusy = (criterionId, busy) => {
    setCriteriaBusyIds((prev) => {
      if (busy) {
        return prev.includes(criterionId) ? prev : [...prev, criterionId];
      }
      return prev.filter((id) => id !== criterionId);
    });
  };

  const saveEditCriterion = async (criterionId) => {
    const previousCriterion = adminCriteria.find((item) => item.id === criterionId);
    if (!previousCriterion) {
      notifyError('Criterion no longer exists in local state', { title: 'Update Failed' });
      return;
    }

    const optimisticCriterion = {
      ...previousCriterion,
      name: editingDraft.name,
      description: editingDraft.description,
      max_score: Number(editingDraft.max_score),
      weight: Number(editingDraft.weight),
      display_order: Number(editingDraft.display_order),
      is_active: Boolean(editingDraft.is_active),
    };

    try {
      markCriterionBusy(criterionId, true);
      setAdminCriteria((prev) => prev.map((item) => (item.id === criterionId ? optimisticCriterion : item)));
      cancelEditCriterion();

      await evaluationsAPI.updateCriterion(criterionId, {
        name: optimisticCriterion.name,
        description: optimisticCriterion.description,
        max_score: optimisticCriterion.max_score,
        weight: optimisticCriterion.weight,
        display_order: optimisticCriterion.display_order,
        is_active: optimisticCriterion.is_active,
      });

      notifySuccess('Criterion updated successfully', { title: 'Updated' });
    } catch (_error) {
      setAdminCriteria((prev) => prev.map((item) => (item.id === criterionId ? previousCriterion : item)));
      notifyError('Could not update criterion', { title: 'Update Failed' });
    } finally {
      markCriterionBusy(criterionId, false);
    }
  };

  const toggleCriterionActive = async (criterion) => {
    const criterionId = criterion.id;
    const previousCriterion = criterion;
    const optimisticCriterion = {
      ...criterion,
      is_active: !criterion.is_active,
    };

    try {
      markCriterionBusy(criterionId, true);
      setAdminCriteria((prev) => prev.map((item) => (item.id === criterionId ? optimisticCriterion : item)));

      await evaluationsAPI.updateCriterion(criterionId, {
        is_active: optimisticCriterion.is_active,
      });

      notifySuccess(
        `Criterion ${criterion.is_active ? 'deactivated' : 'activated'} successfully`,
        { title: 'Status Updated' }
      );
    } catch (_error) {
      setAdminCriteria((prev) => prev.map((item) => (item.id === criterionId ? previousCriterion : item)));
      notifyError('Could not update criterion status', { title: 'Update Failed' });
    } finally {
      markCriterionBusy(criterionId, false);
    }
  };

  const handleComputeFinalScore = async () => {
    if (!selectedPlacementComputeId) {
      notifyError('Select a placement before computing final score', { title: 'Missing Placement' });
      return;
    }

    try {
      setSaving(true);
      await evaluationsAPI.computeAdminFinalScore({ placement_id: Number(selectedPlacementComputeId) });
      notifySuccess('Final weighted score computed successfully', { title: 'Computed' });
      setSelectedPlacementComputeId('');
      await loadAdminData();
    } catch (_error) {
      notifyError('Final score computation failed. Ensure evaluation/logbook prerequisites are complete.', {
        title: 'Computation Failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderAdminPanel = () => (
    <Stack spacing={2.5}>
      {loading && <Alert severity="info">Loading criteria...</Alert>}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography sx={{ fontWeight: 700 }}>Compute Final Weighted Score</Typography>
            <Grid container spacing={1.2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  select
                  label="Placement"
                  value={selectedPlacementComputeId}
                  onChange={(event) => setSelectedPlacementComputeId(event.target.value)}
                >
                  <MenuItem value="">Select placement</MenuItem>
                  {adminPlacementOptions.map((placement) => (
                    <MenuItem key={placement.id} value={String(placement.id)}>
                      {placement.student_name} · Placement #{placement.id} · {placement.current_lifecycle_status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ height: '100%' }}
                  onClick={handleComputeFinalScore}
                  disabled={saving || loading}
                >
                  Compute Score
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography sx={{ fontWeight: 700 }}>Create Evaluation Criterion</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={criterionName}
                  onChange={(event) => setCriterionName(event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Display Order"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={criterionDisplayOrder}
                  onChange={(event) => setCriterionDisplayOrder(event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Score"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={criterionMaxScore}
                  onChange={(event) => setCriterionMaxScore(event.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Weight"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={criterionWeight}
                  onChange={(event) => setCriterionWeight(event.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Description"
                  value={criterionDescription}
                  onChange={(event) => setCriterionDescription(event.target.value)}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleCreateCriterion} disabled={saving || loading}>
                Create Criterion
              </Button>
              <Button variant="outlined" onClick={resetAdminCriterionForm} disabled={saving || loading}>
                Reset
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Manage Criteria</Typography>
          <Grid container spacing={1.2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search by name or description"
                value={criteriaSearch}
                onChange={(event) => setCriteriaSearch(event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Filter"
                value={criteriaStatusFilter}
                onChange={(event) => setCriteriaStatusFilter(event.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Sort By"
                value={criteriaSortBy}
                onChange={(event) => setCriteriaSortBy(event.target.value)}
              >
                <MenuItem value="display_order">Display Order</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="max_score">Max Score</MenuItem>
                <MenuItem value="weight">Weight</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Direction"
                value={criteriaSortDirection}
                onChange={(event) => setCriteriaSortDirection(event.target.value)}
              >
                <MenuItem value="asc">Asc</MenuItem>
                <MenuItem value="desc">Desc</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {adminCriteria.length === 0 ? (
            <Alert severity="info">No criteria found. Create one to get started.</Alert>
          ) : visibleAdminCriteria.length === 0 ? (
            <Alert severity="info">No criteria match the current search/filter settings.</Alert>
          ) : (
            <Stack spacing={1.2}>
              {visibleAdminCriteria.map((criterion) => {
                const isEditing = editingCriterionId === String(criterion.id);
                const isBusy = criteriaBusyIds.includes(criterion.id);

                return (
                  <Box
                    key={criterion.id}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    {isEditing ? (
                      <Stack spacing={1.2}>
                        <Grid container spacing={1.2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Name"
                              value={editingDraft.name || ''}
                              onChange={(event) =>
                                setEditingDraft((prev) => ({ ...prev, name: event.target.value }))
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="Max Score"
                              type="number"
                              value={editingDraft.max_score ?? ''}
                              onChange={(event) =>
                                setEditingDraft((prev) => ({ ...prev, max_score: event.target.value }))
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="Weight"
                              type="number"
                              value={editingDraft.weight ?? ''}
                              onChange={(event) =>
                                setEditingDraft((prev) => ({ ...prev, weight: event.target.value }))
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Display Order"
                              type="number"
                              value={editingDraft.display_order ?? ''}
                              onChange={(event) =>
                                setEditingDraft((prev) => ({ ...prev, display_order: event.target.value }))
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={8}>
                            <TextField
                              fullWidth
                              label="Description"
                              value={editingDraft.description || ''}
                              onChange={(event) =>
                                setEditingDraft((prev) => ({ ...prev, description: event.target.value }))
                              }
                            />
                          </Grid>
                        </Grid>

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => saveEditCriterion(criterion.id)}
                            disabled={saving || isBusy}
                          >
                            Save
                          </Button>
                          <Button size="small" variant="outlined" onClick={cancelEditCriterion} disabled={saving || isBusy}>
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
                        <Stack spacing={0.4}>
                          <Typography sx={{ fontWeight: 600 }}>{criterion.name}</Typography>
                          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                            Max: {criterion.max_score} · Weight: {criterion.weight} · Order: {criterion.display_order}
                          </Typography>
                          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                            {criterion.description || 'No description'}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            color={criterion.is_active ? 'success' : 'default'}
                            label={criterion.is_active ? 'Active' : 'Inactive'}
                          />
                          {isBusy && <Chip size="small" label="Saving..." />}
                          <Button size="small" onClick={() => startEditCriterion(criterion)} disabled={saving || isBusy}>
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => toggleCriterionActive(criterion)}
                            disabled={saving || isBusy}
                          >
                            {criterion.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </Stack>
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Final Internship Results</Typography>
          <Grid container spacing={1.2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search Result"
                placeholder="Search by student or placement"
                value={adminScoreSearch}
                onChange={(event) => setAdminScoreSearch(event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Grade"
                value={adminScoreGradeFilter}
                onChange={(event) => setAdminScoreGradeFilter(event.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
                <MenuItem value="D">D</MenuItem>
                <MenuItem value="F">F</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {adminFinalScores.length === 0 ? (
            <Alert severity="info">No final scores computed yet.</Alert>
          ) : visibleAdminFinalScores.length === 0 ? (
            <Alert severity="info">No final scores match the current filters.</Alert>
          ) : (
            <Stack spacing={1}>
              {visibleAdminFinalScores.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontWeight: 600 }}>{item.student_name}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{item.placement_summary}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                      Aca {item.academic_score} · Sup {item.supervisor_score} · Log {item.logbook_score}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 700 }}>{item.final_score}</Typography>
                    <Chip size="small" color="success" label={`Grade ${item.grade}`} />
                    <Chip size="small" label={item.remarks} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );

  const renderSupervisorPanel = () => (
    <Stack spacing={2.5}>
      {loading && <Alert severity="info">Loading evaluations...</Alert>}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography sx={{ fontWeight: 700 }}>Evaluation Workspace</Typography>
              <Button variant="outlined" size="small" onClick={resetForm}>
                New Evaluation
              </Button>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Existing Evaluation"
                  value={selectedEvaluationId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedEvaluationId(value);
                    if (!value) {
                      resetForm();
                      return;
                    }
                    const picked = supervisorEvaluations.find((item) => item.id === Number(value));
                    if (picked) {
                      hydrateFormFromEvaluation(picked);
                    }
                  }}
                >
                  <MenuItem value="">Select evaluation</MenuItem>
                  {supervisorEvaluations.map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}>
                      {item.student_name} · {item.placement_summary} · {item.status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Placement"
                  value={selectedPlacementId}
                  onChange={(event) => setSelectedPlacementId(event.target.value)}
                  disabled={Boolean(selectedEvaluation)}
                  helperText={selectedEvaluation ? 'Placement is locked for existing evaluations.' : 'Choose an assigned placement.'}
                >
                  <MenuItem value="">Select placement</MenuItem>
                  {availablePlacements.map((placement) => (
                    <MenuItem key={placement.id} value={String(placement.id)}>
                      {placement.student_name} · Placement #{placement.id} · {placement.current_lifecycle_status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              {criteria.map((criterion) => (
                <Grid key={criterion.id} item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`${criterion.name} (max ${criterion.max_score})`}
                    value={scores[criterion.id] ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      setScores((prev) => ({ ...prev, [criterion.id]: value }));
                    }}
                    inputProps={{ min: 0, max: Number(criterion.max_score), step: 0.01 }}
                    disabled={selectedEvaluation?.status === 'finalized'}
                  />
                </Grid>
              ))}
            </Grid>

            <TextField
              fullWidth
              multiline
              minRows={4}
              label="General Feedback"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              disabled={selectedEvaluation?.status === 'finalized'}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography sx={{ color: 'text.secondary' }}>
                Computed Total: <strong>{computedTotal.toFixed(2)}</strong> / {maxPossible.toFixed(2)}
              </Typography>
              {selectedEvaluation && (
                <Chip
                  size="small"
                  color={statusColor[selectedEvaluation.status] || 'default'}
                  label={`Status: ${selectedEvaluation.status}`}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="contained" onClick={handleSaveDraft} disabled={saving || loading || selectedEvaluation?.status === 'finalized'}>
                {selectedEvaluation ? 'Update Draft' : 'Create Draft'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleSubmitEvaluation}
                disabled={saving || !selectedEvaluation || selectedEvaluation.status === 'finalized'}
              >
                Submit
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={handleFinalizeEvaluation}
                disabled={saving || !selectedEvaluation || selectedEvaluation.status !== 'submitted'}
              >
                Finalize
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Your Evaluation Records</Typography>
          {supervisorEvaluations.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>No evaluations created yet.</Typography>
          ) : (
            <Stack spacing={1}>
              {supervisorEvaluations.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Stack spacing={0.3}>
                    <Typography sx={{ fontWeight: 600 }}>{item.student_name}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{item.placement_summary}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.total_score}/{item.max_possible_score} ({item.grade || '-'})
                    </Typography>
                    <Chip label={item.status} color={statusColor[item.status] || 'default'} size="small" />
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedEvaluationId(String(item.id));
                        hydrateFormFromEvaluation(item);
                      }}
                    >
                      Open
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );

  const renderStudentPanel = () => (
    <Stack spacing={2.5}>
      {loading && <Alert severity="info">Loading your evaluations...</Alert>}
      {studentEvaluations.length === 0 ? (
        <Alert severity="info">No evaluations available yet.</Alert>
      ) : (
        studentEvaluations.map((evaluation) => (
          <Card key={evaluation.id} variant="outlined">
            <CardContent>
              <Stack spacing={1.2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Typography sx={{ fontWeight: 700 }}>{evaluation.placement_summary}</Typography>
                  <Chip label={evaluation.status} size="small" color={statusColor[evaluation.status] || 'default'} />
                </Stack>
                <Typography sx={{ color: 'text.secondary' }}>
                  Evaluated by: {evaluation.evaluated_by_name || '-'}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  Score: {evaluation.total_score} / {evaluation.max_possible_score} ({evaluation.grade || '-'})
                </Typography>

                <Box>
                  <Typography sx={{ fontWeight: 600, mb: 0.7 }}>Criteria Breakdown</Typography>
                  <Stack spacing={0.6}>
                    {evaluation.criteria_scores.map((entry) => (
                      <Typography key={entry.id} sx={{ color: 'text.secondary' }}>
                        {entry.criterion_name}: {entry.score} / {entry.criterion_max_score}
                      </Typography>
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>General Feedback</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{evaluation.general_feedback || 'No feedback provided yet.'}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}

      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Final Internship Score</Typography>
          {studentFinalScores.length === 0 ? (
            <Alert severity="info">Final score has not been computed yet.</Alert>
          ) : (
            <Stack spacing={1}>
              {studentFinalScores.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>{item.placement_summary}</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    Academic: {item.academic_score} · Supervisor: {item.supervisor_score} · Logbook: {item.logbook_score}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, mt: 0.5 }}>
                    Final: {item.final_score} ({item.grade})
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{item.remarks}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );

  return (
    <PageScaffold
      title="Evaluations"
      subtitle="Structured academic assessment with lifecycle control and criteria-level scoring"
      stats={stats}
    >
      {role === 'academic_supervisor' && renderSupervisorPanel()}
      {role === 'student' && renderStudentPanel()}
      {role === 'admin' && renderAdminPanel()}
      {role !== 'academic_supervisor' && role !== 'student' && role !== 'admin' && (
        <Alert severity="info">This module is currently available to admins, academic supervisors, and students.</Alert>
      )}
    </PageScaffold>
  );
};

export default EvaluationsPage;