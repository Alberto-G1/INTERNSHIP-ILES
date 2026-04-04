// frontend/src/pages/dashboard/AcademicSupervisorDashboard.jsx
import { Typography, Box, Grid, Card, CardContent, Avatar, Chip, Rating, Divider, LinearProgress, Button } from '@mui/material';
import { 
  School as SchoolIcon, 
  Assessment as AssessmentIcon, 
  ChecklistRtl as EvalIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';
import { authAPI, evaluationsAPI, logbookAPI, placementsAPI } from '../../../services/api';

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const timeAgo = (value) => {
  const date = toDate(value);
  if (!date) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const AcademicSupervisorDashboard = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [profileInfo, setProfileInfo] = useState(null);

  useEffect(() => {
    setIsVisible(true);

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [profileRes, placementRes, logsRes, evalRes] = await Promise.allSettled([
          authAPI.getProfile(),
          placementsAPI.getAssignedPlacements(),
          logbookAPI.getSupervisorLogs({ page_size: 200 }),
          evaluationsAPI.getSupervisorEvaluations(),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfileInfo(profileRes.value.data || null);
        }
        if (placementRes.status === 'fulfilled') {
          setPlacements(Array.isArray(placementRes.value.data) ? placementRes.value.data : []);
        }
        if (logsRes.status === 'fulfilled') {
          const payload = logsRes.value.data;
          const rows = Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : [];
          setLogs(rows);
        }
        if (evalRes.status === 'fulfilled') {
          setEvaluations(Array.isArray(evalRes.value.data) ? evalRes.value.data : []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const evaluationByPlacement = evaluations.reduce((acc, evaluation) => {
    acc[String(evaluation.placement)] = evaluation;
    return acc;
  }, {});

  const stats = (() => {
    const placementProgress = placements.map((placement) => {
      const placementLogs = logs.filter((log) => String(log.placement) === String(placement.id));
      if (!placementLogs.length) return 0;
      const approvedCount = placementLogs.filter((log) => log.review_status === 'approved').length;
      return Math.round((approvedCount / placementLogs.length) * 100);
    });

    const avgStudentProgress = placementProgress.length
      ? Math.round(placementProgress.reduce((sum, value) => sum + value, 0) / placementProgress.length)
      : 0;

    const pendingEvaluations = placements.filter((placement) => {
      const evaluation = evaluationByPlacement[String(placement.id)];
      return !evaluation || evaluation.status !== 'finalized';
    }).length;

    const atRiskStudents = placements.filter((placement) => {
      const placementLogs = logs.filter((log) => String(log.placement) === String(placement.id));
      if (!placementLogs.length) return true;
      const latest = placementLogs
        .map((log) => toDate(log.updated_at || log.created_at))
        .filter(Boolean)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      const stale = latest ? Date.now() - latest.getTime() > 14 * 86400000 : true;
      const approvedCount = placementLogs.filter((log) => log.review_status === 'approved').length;
      const progress = Math.round((approvedCount / placementLogs.length) * 100);
      return stale || progress < 40;
    }).length;

    return {
      pendingEvaluations,
      studentsUnderSupervision: placements.length,
      evaluationsCompleted: evaluations.filter((evaluation) => evaluation.status === 'finalized').length,
      avgStudentProgress,
      atRiskStudents,
      institutionInfo: {
        name: profileInfo?.supervisor_profile?.organization_name || 'Not set',
        department:
          profileInfo?.supervisor_profile?.department ||
          profileInfo?.supervisor_profile?.faculty ||
          'Not set',
      },
    };
  })();

  const evaluationProgress = {
    notStarted: placements.filter((placement) => !evaluationByPlacement[String(placement.id)]).length,
    inProgress: evaluations.filter((evaluation) => ['draft', 'submitted'].includes(evaluation.status)).length,
    completed: evaluations.filter((evaluation) => evaluation.status === 'finalized').length,
  };

  const recentActivities = [...
    evaluations.slice(0, 5).map((evaluation) => ({
      type: 'evaluation',
      title: `Evaluation ${evaluation.status}`,
      description: `${evaluation.student_name || 'Student'} • ${evaluation.placement_summary || 'Evaluation update'}`,
      time: timeAgo(evaluation.updated_at || evaluation.created_at),
      status: evaluation.status,
      sortAt: toDate(evaluation.updated_at || evaluation.created_at),
    })),
    logs.slice(0, 4).map((log) => ({
      type: log.review_status === 'needs_revision' ? 'warning' : 'log',
      title: `Week ${log.week_number} log ${log.review_status}`,
      description: `${log.student_name || 'Student'} • ${log.placement_summary || 'Log status updated'}`,
      time: timeAgo(log.updated_at || log.created_at),
      status: log.review_status,
      sortAt: toDate(log.updated_at || log.created_at),
    })),
  ]
    .sort((a, b) => (b.sortAt?.getTime() || 0) - (a.sortAt?.getTime() || 0))
    .slice(0, 5)
    .map(({ sortAt, ...activity }) => activity);

  const quickActions = [
    { label: 'Review Evaluations', icon: <EvalIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/evaluations') },
    { label: 'View Students', icon: <PeopleIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/interns') },
    { label: 'Generate Reports', icon: <AssessmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/reports') },
    { label: 'Update Profile', icon: <SchoolIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/profile') },
  ];

  const topStudents = evaluations
    .filter((evaluation) => evaluation.max_possible_score)
    .map((evaluation) => {
      const percent = Math.round((Number(evaluation.total_score || 0) / Number(evaluation.max_possible_score || 1)) * 100);
      return {
        name: evaluation.student_name || 'Student',
        progress: percent,
        rating: Math.max(1, Math.min(5, Number(((percent / 100) * 5).toFixed(1)))),
      };
    })
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <Box
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--ink)', mb: 1 }}>
          Academic Supervisor Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--gray-500)' }}>
          Monitor student progress, review evaluations, and provide academic guidance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Pending Evaluations */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={EvalIcon}
            title="Pending Evaluations"
            value={stats.pendingEvaluations}
            subtitle="Student evaluations awaiting your review"
            color="warning"
            actionLabel="Review Evaluations"
            onAction={() => navigate('/evaluations')}
            loading={loading}
          />
        </Grid>

        {/* Students Under Supervision */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={PeopleIcon}
            title="Students in Internship"
            value={stats.studentsUnderSupervision}
            subtitle="Active interns under your supervision"
            color="primary"
            actionLabel="View Students"
            onAction={() => navigate('/interns')}
            loading={loading}
          />
        </Grid>

        {/* Average Student Progress */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={TrendingUpIcon}
            title="Average Progress"
            value={`${stats.avgStudentProgress}%`}
            subtitle="Overall student completion rate"
            color="success"
            loading={loading}
          />
        </Grid>

        {/* Evaluation Progress */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Evaluation Progress</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Not Started</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{evaluationProgress.notStarted}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(evaluationProgress.notStarted / 12) * 100} 
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--gray-200)' }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">In Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{evaluationProgress.inProgress}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(evaluationProgress.inProgress / 12) * 100} 
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--gray-200)' }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Completed</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{evaluationProgress.completed}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(evaluationProgress.completed / 12) * 100} 
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--gray-200)' }}
                  />
                </Box>
              </Box>
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid var(--gray-200)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'var(--gray-600)' }}>Completion Rate</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--green-600)' }}>
                    {Math.round((evaluationProgress.completed / 12) * 100)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Students */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Top Performing Students</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {topStudents.map((student, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'var(--amber-100)', color: 'var(--amber-700)' }}>
                          {student.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{student.name}</Typography>
                          <Rating value={student.rating} precision={0.1} size="small" readOnly />
                        </Box>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--green-600)' }}>
                        {student.progress}%
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ 
                        height: '4px', 
                        background: 'var(--gray-200)', 
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: `${student.progress}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, var(--green-500), var(--green-600))',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease'
                        }} />
                      </Box>
                    </Box>
                    {index < topStudents.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
                {topStudents.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'var(--gray-500)' }}>
                    No finalized evaluations yet.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Institution Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Institution Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Institution</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{stats.institutionInfo.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Department</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{stats.institutionInfo.department}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Active Semester</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>Current Internship Cycle</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ color: 'var(--green-600)', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/profile')}
                >
                  Update Profile →
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* At-Risk Students Alert */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', bgcolor: 'var(--red-50)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WarningIcon sx={{ color: 'var(--red-600)' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--red-700)' }}>
                  Students Needing Attention
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--red-600)', mb: 1 }}>
                {stats.atRiskStudents}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--red-700)', mb: 2 }}>
                Students with low progress or missed deadlines
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ 
                  borderColor: 'var(--red-300)', 
                  color: 'var(--red-700)',
                  '&:hover': { borderColor: 'var(--red-500)', bgcolor: 'var(--red-100)' }
                }}
                onClick={() => navigate('/interns?filter=at-risk')}
              >
                View Details →
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <RecentActivity activities={recentActivities} loading={loading} />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <QuickActions actions={quickActions} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicSupervisorDashboard;