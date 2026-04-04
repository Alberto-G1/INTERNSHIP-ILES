// frontend/src/pages/Reports/ReportsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Divider, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';
import { adminPlacementsAPI, adminUsersAPI, evaluationsAPI, logbookAPI } from '../../services/api';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [placements, setPlacements] = useState([]);
  const [users, setUsers] = useState([]);
  const [finalScores, setFinalScores] = useState([]);
  const [overview, setOverview] = useState({
    total_logs: 0,
    pending_review: 0,
    approved: 0,
    revisions: 0,
    late_submissions: 0,
    approval_rate: 0,
  });

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const [placementsRes, usersRes, scoresRes, overviewRes] = await Promise.allSettled([
          adminPlacementsAPI.getPlacements({ page_size: 300 }),
          adminUsersAPI.getUsers(),
          evaluationsAPI.getAdminFinalScores(),
          logbookAPI.getAdminOverview(),
        ]);

        if (placementsRes.status === 'fulfilled') {
          const payload = placementsRes.value.data;
          setPlacements(Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : []);
        }
        if (usersRes.status === 'fulfilled') {
          setUsers(Array.isArray(usersRes.value.data) ? usersRes.value.data : []);
        }
        if (scoresRes.status === 'fulfilled') {
          setFinalScores(Array.isArray(scoresRes.value.data) ? scoresRes.value.data : []);
        }
        if (overviewRes.status === 'fulfilled') {
          setOverview((current) => ({ ...current, ...overviewRes.value.data }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const { stats, topOrganizations, gradeDistribution, completionRate } = useMemo(() => {
    const approvedPlacements = placements.filter((placement) => placement.approval_status === 'approved').length;
    const evaluatedPlacements = finalScores.length;
    const completionRateValue = placements.length
      ? Math.round((evaluatedPlacements / placements.length) * 100)
      : 0;

    const scoreAverage = finalScores.length
      ? (finalScores.reduce((sum, score) => sum + Number(score.final_score || 0), 0) / finalScores.length).toFixed(1)
      : '0.0';

    const organizationMap = placements.reduce((acc, placement) => {
      const name = placement.organization?.name || 'Unspecified Organization';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const gradeMap = finalScores.reduce((acc, score) => {
      const grade = score.grade || 'N/A';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    const totalStudents = users.filter((user) => user.role === 'student').length;

    return {
      stats: [
        { label: 'Submission Rate', value: `${overview.approval_rate || 0}%`, helper: 'Approved logs', accent: '#2E8B5B' },
        { label: 'Avg Score', value: scoreAverage, helper: 'Final internship score', accent: '#5B82A6' },
        { label: 'Completion', value: `${completionRateValue}%`, helper: 'Placements with final scores', accent: '#F59E0B' },
        { label: 'Alerts', value: String((overview.pending_review || 0) + (overview.late_submissions || 0)), helper: 'Pending + late logs', accent: '#C0392B' },
      ],
      topOrganizations: Object.entries(organizationMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      gradeDistribution: Object.entries(gradeMap)
        .sort((a, b) => b[1] - a[1]),
      completionRate: {
        value: completionRateValue,
        approvedPlacements,
        totalPlacements: placements.length,
        totalStudents,
      },
    };
  }, [placements, users, finalScores, overview]);

  return (
    <PageScaffold
      title="Reports"
      subtitle="Generate analytics for submissions, evaluations, and placement outcomes"
      chips={['Export: PDF', 'Export: CSV', `Term: ${new Date().getFullYear()} Intake`]}
      stats={stats}
    >
      <Stack spacing={2}>
        {loading && <Alert severity="info">Loading report analytics...</Alert>}

        <Typography sx={{ fontWeight: 600 }}>Analytics Workspace</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Build department-level and supervisor-level reports to support weekly management reviews.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Top Placement Organizations</Typography>
              {topOrganizations.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>No placement data available yet.</Typography>
              ) : (
                <Stack spacing={1}>
                  {topOrganizations.map(([orgName, count]) => (
                    <Stack key={orgName} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: 14 }}>{orgName}</Typography>
                      <Chip size="small" label={`${count} placements`} />
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Final Grade Distribution</Typography>
              {gradeDistribution.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>No final score records available.</Typography>
              ) : (
                <Stack spacing={1}>
                  {gradeDistribution.map(([grade, count]) => (
                    <Stack key={grade} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: 14 }}>Grade {grade}</Typography>
                      <Chip size="small" label={`${count} students`} color={grade === 'A' ? 'success' : 'default'} />
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider />

        <Box>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Cohort Completion Coverage</Typography>
          <LinearProgress variant="determinate" value={completionRate.value} sx={{ height: 8, borderRadius: 5, mb: 1 }} />
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            {completionRate.approvedPlacements} approved placements out of {completionRate.totalPlacements} total submissions across {completionRate.totalStudents} student accounts.
          </Typography>
        </Box>
      </Stack>
    </PageScaffold>
  );
};

export default ReportsPage;