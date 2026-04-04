// frontend/src/pages/dashboard/StudentDashboard.jsx
import { Typography, Box, Grid, Card, CardContent, Button, LinearProgress, Chip } from '@mui/material';
import { 
  School as SchoolIcon, 
  Assignment as AssignmentIcon, 
  TrendingUp as TrendingUpIcon,
  EmojiEvents as AchievementIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';
import { evaluationsAPI, logbookAPI, placementsAPI, profileAPI } from '../../../services/api';

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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progressRows, setProgressRows] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [finalScores, setFinalScores] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          profileAPI.getCompletion(),
          placementsAPI.getMyPlacements(),
          logbookAPI.getStudentLogs(),
          logbookAPI.getStudentProgress(),
          evaluationsAPI.getStudentEvaluations(),
          evaluationsAPI.getStudentFinalScores(),
        ]);

        if (results[0].status === 'fulfilled') {
          setProfileCompletion(Number(results[0].value.data?.percentage || 0));
        }
        if (results[1].status === 'fulfilled') {
          setPlacements(Array.isArray(results[1].value.data) ? results[1].value.data : []);
        }
        if (results[2].status === 'fulfilled') {
          setLogs(Array.isArray(results[2].value.data) ? results[2].value.data : []);
        }
        if (results[3].status === 'fulfilled') {
          setProgressRows(Array.isArray(results[3].value.data) ? results[3].value.data : []);
        }
        if (results[4].status === 'fulfilled') {
          setEvaluations(Array.isArray(results[4].value.data) ? results[4].value.data : []);
        }
        if (results[5].status === 'fulfilled') {
          setFinalScores(Array.isArray(results[5].value.data) ? results[5].value.data : []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const approvedPlacements = placements.filter((p) => p.approval_status === 'approved');
    const totalExpected = progressRows.reduce((sum, row) => sum + Number(row.total_expected_weeks || 0), 0);
    const totalSubmitted = progressRows.reduce((sum, row) => sum + Number(row.total_logs_submitted || 0), 0);
    const overallProgress = progressRows.length
      ? Math.round(progressRows.reduce((sum, row) => sum + Number(row.completion_percentage || 0), 0) / progressRows.length)
      : 0;

    const finalizedEvals = evaluations.filter((e) => e.status === 'finalized').length;
    const achievements = [
      totalSubmitted > 0,
      profileCompletion >= 100,
      finalizedEvals > 0,
      finalScores.length > 0,
    ].filter(Boolean).length;

    const missingWeeks = progressRows.flatMap((row) => (Array.isArray(row.missing_weeks) ? row.missing_weeks : []));

    return {
      hasApprovedPlacement: approvedPlacements.length > 0,
      weeklySubmitted: totalSubmitted,
      weeklyTotal: totalExpected,
      profileCompletion,
      overallProgress,
      achievements,
      upcomingDeadlines: missingWeeks.slice(0, 2),
    };
  }, [placements, progressRows, profileCompletion, evaluations, finalScores]);

  const recentActivities = useMemo(() => {
    const placementActivities = placements.slice(0, 4).map((placement) => ({
      type: 'placement',
      title: `Placement ${placement.approval_status === 'approved' ? 'Approved' : 'Updated'}`,
      description: placement.organization?.name
        ? `${placement.organization.name} • ${placement.position_role || 'Internship placement'}`
        : 'Placement details updated',
      time: timeAgo(placement.updated_at || placement.created_at),
      status: placement.approval_status,
      sortAt: toDate(placement.updated_at || placement.created_at),
    }));

    const logActivities = logs.slice(0, 4).map((log) => ({
      type: 'log',
      title: `Week ${log.week_number} Log ${log.submission_status === 'submitted' ? 'Submitted' : 'Drafted'}`,
      description: log.placement_summary || 'Weekly log activity',
      time: timeAgo(log.updated_at || log.created_at),
      status: log.review_status,
      sortAt: toDate(log.updated_at || log.created_at),
    }));

    const evaluationActivities = evaluations.slice(0, 3).map((evaluation) => ({
      type: 'evaluation',
      title: `Evaluation ${evaluation.status}`,
      description: evaluation.placement_summary || 'Evaluation progress update',
      time: timeAgo(evaluation.updated_at || evaluation.created_at),
      status: evaluation.status,
      sortAt: toDate(evaluation.updated_at || evaluation.created_at),
    }));

    return [...placementActivities, ...logActivities, ...evaluationActivities]
      .sort((a, b) => (b.sortAt?.getTime() || 0) - (a.sortAt?.getTime() || 0))
      .slice(0, 5)
      .map(({ sortAt, ...activity }) => activity);
  }, [placements, logs, evaluations]);

  const quickActions = [
    { label: 'Submit Weekly Log', icon: <AssignmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/logs') },
    { label: 'Complete Profile', icon: <SchoolIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/profile') },
    { label: 'View Placements', icon: <TrendingUpIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/placements') },
    { label: 'Check Evaluations', icon: <CheckIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/evaluations') },
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--ink)', mb: 1 }}>
            Welcome back, Intern!
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--gray-500)' }}>
            Track your internship progress, submit logs, and complete evaluations
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Active Internship Status */}
        <Grid item xs={12} md={6}>
          <StatCard
            icon={SchoolIcon}
            title="Active Internship"
            value={stats.hasApprovedPlacement ? 'Approved Placement' : 'No Approved Placement'}
            subtitle={stats.hasApprovedPlacement ? 'Your internship journey is active in the system' : 'Apply and submit a placement to get started'}
            color={stats.hasApprovedPlacement ? 'success' : 'warning'}
            actionLabel="View Placements"
            onAction={() => navigate('/placements')}
            loading={loading}
          />
        </Grid>

        {/* Weekly Logs */}
        <Grid item xs={12} md={6}>
          <StatCard
            icon={AssignmentIcon}
            title="Weekly Logs"
            value={`${stats.weeklySubmitted}/${stats.weeklyTotal || 0}`}
            subtitle="Submitted logs vs expected logs"
            color="primary"
            progress={stats.weeklyTotal ? Math.round((stats.weeklySubmitted / stats.weeklyTotal) * 100) : 0}
            actionLabel="Submit Log"
            onAction={() => navigate('/logs')}
            loading={loading}
          />
        </Grid>

        {/* Profile Completion */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={SchoolIcon}
            title="Profile Completion"
            value={`${stats.profileCompletion}%`}
            subtitle="Complete your profile to unlock all features"
            color="info"
            progress={stats.profileCompletion}
            actionLabel="Complete Profile"
            onAction={() => navigate('/profile')}
            loading={loading}
          />
        </Grid>

        {/* Overall Progress */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={TrendingUpIcon}
            title="Overall Progress"
            value={`${stats.overallProgress}%`}
            subtitle="Internship completion status"
            color="success"
            progress={stats.overallProgress}
            loading={loading}
          />
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AchievementIcon sx={{ color: 'var(--amber-500)' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Achievements</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.achievements}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>
                Milestones reached from your real progress
              </Typography>
              <Box sx={{ mt: 2 }}>
                {stats.weeklySubmitted > 0 && (
                  <Chip
                    label="First Log"
                    size="small"
                    sx={{ mr: 1, mb: 1, bgcolor: 'var(--green-50)', color: 'var(--green-700)' }}
                  />
                )}
                {stats.profileCompletion >= 100 && (
                  <Chip
                    label="Profile Complete"
                    size="small"
                    sx={{ mr: 1, mb: 1, bgcolor: 'var(--blue-50)', color: 'var(--blue-700)' }}
                  />
                )}
                {finalScores.length > 0 && (
                  <Chip
                    label="Final Grade Issued"
                    size="small"
                    sx={{ mb: 1, bgcolor: 'var(--amber-50)', color: 'var(--amber-700)' }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalendarIcon sx={{ color: 'var(--orange-500)' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Upcoming Deadlines</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.upcomingDeadlines.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'var(--gray-500)' }}>
                    No upcoming deadlines right now.
                  </Typography>
                ) : (
                  stats.upcomingDeadlines.map((weekEndingDate) => {
                    const dueDate = toDate(weekEndingDate);
                    const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / 86400000) : null;
                    const progressValue = daysLeft === null ? 0 : Math.max(0, Math.min(100, ((14 - daysLeft) / 14) * 100));
                    return (
                      <Box key={weekEndingDate}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Weekly Log Submission
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>
                          {daysLeft === null ? 'Deadline date unavailable' : daysLeft >= 0 ? `Due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}` : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} overdue`}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={progressValue}
                          sx={{ mt: 1, height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    );
                  })
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
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

export default StudentDashboard;