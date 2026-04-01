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
import { evaluationsAPI, placementsAPI } from '../../services/api';
import { notifyError, notifySuccess } from '../../components/Common/AppToast';

const statusColor = {
  draft: 'default',
  submitted: 'info',
  finalized: 'success',
};

const EvaluationsPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [criteria, setCriteria] = useState([]);

  const [supervisorEvaluations, setSupervisorEvaluations] = useState([]);
  const [studentEvaluations, setStudentEvaluations] = useState([]);
  const [assignedPlacements, setAssignedPlacements] = useState([]);

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

    return [
      { label: 'Role', value: role || '-', helper: 'No evaluation dashboard', accent: '#5B82A6' },
      { label: '-', value: '-', helper: '-', accent: '#5B82A6' },
      { label: '-', value: '-', helper: '-', accent: '#5B82A6' },
      { label: '-', value: '-', helper: '-', accent: '#5B82A6' },
    ];
  }, [role, studentEvaluations, supervisorEvaluations]);

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
    const evalRes = await evaluationsAPI.getStudentEvaluations();
    setStudentEvaluations(evalRes.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (role === 'academic_supervisor') {
          await loadSupervisorData();
        } else if (role === 'student') {
          await loadStudentData();
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
      {role !== 'academic_supervisor' && role !== 'student' && (
        <Alert severity="info">This module is currently available to academic supervisors and students.</Alert>
      )}
    </PageScaffold>
  );
};

export default EvaluationsPage;