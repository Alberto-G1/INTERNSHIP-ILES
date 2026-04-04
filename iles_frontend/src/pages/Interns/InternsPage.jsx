// frontend/src/pages/Interns/InternsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';
import { useAuth } from '../../context/AuthContext';
import { adminPlacementsAPI, evaluationsAPI, logbookAPI, placementsAPI } from '../../services/api';

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysSince = (value) => {
  const date = toDate(value);
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
};

const InternsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadInterns = async () => {
      try {
        setLoading(true);
        const placementCall = user?.role === 'admin'
          ? adminPlacementsAPI.getPlacements({ page_size: 300 })
          : placementsAPI.getAssignedPlacements();

        const logsCall = user?.role === 'admin'
          ? Promise.resolve({ data: [] })
          : logbookAPI.getSupervisorLogs({ page_size: 300 });

        const evaluationsCall = user?.role === 'academic_supervisor'
          ? evaluationsAPI.getSupervisorEvaluations()
          : Promise.resolve({ data: [] });

        const [placementsRes, logsRes, evalRes] = await Promise.allSettled([
          placementCall,
          logsCall,
          evaluationsCall,
        ]);

        if (placementsRes.status === 'fulfilled') {
          const payload = placementsRes.value.data;
          setPlacements(Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : []);
        }
        if (logsRes.status === 'fulfilled') {
          const payload = logsRes.value.data;
          setLogs(Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : []);
        }
        if (evalRes.status === 'fulfilled') {
          setEvaluations(Array.isArray(evalRes.value.data) ? evalRes.value.data : []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadInterns();
  }, [user?.role]);

  const interns = useMemo(() => {
    const evalByPlacement = evaluations.reduce((acc, evaluation) => {
      acc[String(evaluation.placement)] = evaluation;
      return acc;
    }, {});

    return placements.map((placement) => {
      const placementLogs = logs.filter((log) => String(log.placement) === String(placement.id));
      const approvedLogs = placementLogs.filter((log) => log.review_status === 'approved').length;
      const progress = placementLogs.length ? Math.round((approvedLogs / placementLogs.length) * 100) : 0;
      const latestLogDate = placementLogs
        .map((log) => toDate(log.updated_at || log.created_at))
        .filter(Boolean)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      const staleDays = latestLogDate ? daysSince(latestLogDate.toISOString()) : null;

      let status = 'On Track';
      if (!placementLogs.length || (staleDays !== null && staleDays > 14) || progress < 40) {
        status = 'At Risk';
      }
      if ((staleDays !== null && staleDays > 21) || progress < 20) {
        status = 'Critical';
      }

      return {
        id: placement.id,
        studentName: placement.student_name || 'Student',
        organization: placement.organization?.name || 'Unknown organization',
        lifecycle: placement.current_lifecycle_status || 'pending',
        progress,
        status,
        lastLogText: staleDays === null ? 'No logs yet' : `${staleDays} day${staleDays === 1 ? '' : 's'} ago`,
        evaluationStatus: evalByPlacement[String(placement.id)]?.status || 'not_started',
      };
    });
  }, [placements, logs, evaluations]);

  const filteredInterns = useMemo(() => {
    if (statusFilter === 'all') return interns;
    return interns.filter((intern) => intern.status === statusFilter);
  }, [interns, statusFilter]);

  const stats = useMemo(() => {
    const onTrack = interns.filter((intern) => intern.status === 'On Track').length;
    const atRisk = interns.filter((intern) => intern.status === 'At Risk').length;
    const critical = interns.filter((intern) => intern.status === 'Critical').length;
    return [
      { label: 'Total', value: String(interns.length), helper: 'Tracked placements', accent: '#2E8B5B' },
      { label: 'On Track', value: String(onTrack), helper: 'Progress healthy', accent: '#4DB87A' },
      { label: 'At Risk', value: String(atRisk), helper: 'Follow-up needed', accent: '#F59E0B' },
      { label: 'Critical', value: String(critical), helper: 'Immediate action', accent: '#C0392B' },
    ];
  }, [interns]);

  return (
    <PageScaffold
      title="Interns"
      subtitle="View intern records, supervision mapping, and performance snapshots"
      stats={stats}
    >
      <Stack spacing={1.5}>
        {loading && <Alert severity="info">Loading intern records...</Alert>}

        <Typography sx={{ fontWeight: 600 }}>Intern Directory</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Search by department, supervisor, and status to quickly locate interns requiring guidance.
        </Typography>

        <TextField
          select
          size="small"
          label="Risk Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          sx={{ maxWidth: 220 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="On Track">On Track</MenuItem>
          <MenuItem value="At Risk">At Risk</MenuItem>
          <MenuItem value="Critical">Critical</MenuItem>
        </TextField>

        <Divider />

        {filteredInterns.length === 0 ? (
          <Alert severity="info">No interns found for the selected filter.</Alert>
        ) : (
          <Stack spacing={1}>
            {filteredInterns.map((intern) => (
              <Box
                key={intern.id}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{intern.studentName}</Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      {intern.organization} · Last log: {intern.lastLogText}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.8}>
                    <Chip size="small" label={intern.status} color={intern.status === 'Critical' ? 'error' : intern.status === 'At Risk' ? 'warning' : 'success'} />
                    <Chip size="small" variant="outlined" label={`Progress ${intern.progress}%`} />
                    <Chip size="small" variant="outlined" label={`Eval ${intern.evaluationStatus}`} />
                    <Chip size="small" variant="outlined" label={intern.lifecycle} />
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </PageScaffold>
  );
};

export default InternsPage;