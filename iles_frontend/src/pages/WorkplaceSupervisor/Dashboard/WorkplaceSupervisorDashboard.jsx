// frontend/src/pages/dashboard/WorkplaceSupervisorDashboard.jsx
import { Typography, Box, Grid, Card, CardContent, Avatar, Chip, Rating, Divider } from '@mui/material';
import { 
  RateReview as ReviewIcon, 
  Group as GroupIcon, 
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import QuickActions from '../../../components/dashboard/QuickActions';
import { logbookAPI, placementsAPI } from '../../../services/api';

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

const WorkplaceSupervisorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [placementRes, logsRes] = await Promise.allSettled([
          placementsAPI.getAssignedPlacements(),
          logbookAPI.getSupervisorLogs({ page_size: 200 }),
        ]);

        if (placementRes.status === 'fulfilled') {
          setPlacements(Array.isArray(placementRes.value.data) ? placementRes.value.data : []);
        }

        if (logsRes.status === 'fulfilled') {
          const payload = logsRes.value.data;
          const rows = Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : [];
          setLogs(rows);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const pendingReviews = logs.filter((log) => ['pending', 'under_review'].includes(log.review_status)).length;
    const reviewedLogs = logs.filter((log) => !['pending', 'under_review'].includes(log.review_status));
    const approvalsGiven = reviewedLogs.filter((log) => log.review_status === 'approved').length;
    const rejections = reviewedLogs.filter((log) => log.review_status === 'rejected').length;
    const ratingValues = reviewedLogs.map((log) => Number(log.supervisor_rating || 0)).filter((rating) => rating > 0);

    return {
      pendingReviews,
      studentsAssigned: placements.length,
      logsReviewed: reviewedLogs.length,
      approvalsGiven,
      rejections,
      avgRating: ratingValues.length
        ? (ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length).toFixed(1)
        : '0.0',
    };
  }, [placements, logs]);

  const recentActivities = useMemo(() => {
    const placementActivities = placements.slice(0, 3).map((placement) => ({
      type: 'placement',
      title: `Placement ${placement.current_lifecycle_status || placement.approval_status}`,
      description: `${placement.student_name || 'Student'} • ${placement.organization?.name || 'Organization'}`,
      time: timeAgo(placement.updated_at || placement.created_at),
      status: placement.current_lifecycle_status || placement.approval_status,
      sortAt: toDate(placement.updated_at || placement.created_at),
    }));

    const logActivities = logs.slice(0, 6).map((log) => ({
      type: 'log',
      title: `Week ${log.week_number} log ${log.review_status}`,
      description: `${log.student_name || 'Student'} • ${log.placement_summary || 'Placement log'}`,
      time: timeAgo(log.updated_at || log.created_at),
      status: log.review_status,
      sortAt: toDate(log.updated_at || log.created_at),
    }));

    return [...placementActivities, ...logActivities]
      .sort((a, b) => (b.sortAt?.getTime() || 0) - (a.sortAt?.getTime() || 0))
      .slice(0, 5)
      .map(({ sortAt, ...activity }) => activity);
  }, [logs, placements]);

  const quickActions = [
    { label: 'Review Pending Logs', icon: <ReviewIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/logs') },
    { label: 'View Students', icon: <GroupIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/interns') },
    { label: 'Provide Feedback', icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/evaluations') },
    { label: 'Update Profile', icon: <AssignmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/profile') },
  ];

  const students = useMemo(() => {
    const logsByPlacement = logs.reduce((acc, log) => {
      const key = String(log.placement);
      acc[key] = acc[key] || [];
      acc[key].push(log);
      return acc;
    }, {});

    return placements.slice(0, 5).map((placement) => {
      const placementLogs = logsByPlacement[String(placement.id)] || [];
      const reviewedCount = placementLogs.filter((log) => log.review_status === 'approved').length;
      const progress = placementLogs.length ? Math.round((reviewedCount / placementLogs.length) * 100) : 0;
      const lastUpdated = placementLogs
        .map((log) => toDate(log.updated_at || log.created_at))
        .filter(Boolean)
        .sort((a, b) => b.getTime() - a.getTime())[0];

      return {
        name: placement.student_name || 'Student',
        progress,
        status: progress >= 80 ? 'Excellent' : progress >= 40 ? 'Active' : 'Needs Follow-up',
        lastLog: lastUpdated ? timeAgo(lastUpdated.toISOString()) : 'No logs yet',
      };
    });
  }, [placements, logs]);

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
            Workplace Supervisor Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--gray-500)' }}>
            Monitor student progress, review logs, and provide feedback
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Pending Reviews */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={ReviewIcon}
            title="Pending Reviews"
            value={stats.pendingReviews}
            subtitle="Logs awaiting your review"
            color="warning"
            actionLabel="Review Logs"
            onAction={() => navigate('/logs')}
            loading={loading}
          />
        </Grid>

        {/* Students Assigned */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={GroupIcon}
            title="Students Assigned"
            value={stats.studentsAssigned}
            subtitle="Interns under your supervision"
            color="primary"
            actionLabel="View Students"
            onAction={() => navigate('/interns')}
            loading={loading}
          />
        </Grid>

        {/* Average Rating */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={TrendingUpIcon}
            title="Average Rating"
            value={stats.avgRating}
            subtitle="Average rating from reviewed logs"
            color="success"
            loading={loading}
          />
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid var(--gray-200)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Performance Overview</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--green-600)' }}>
                      {stats.logsReviewed}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Logs Reviewed</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--blue-600)' }}>
                      {stats.approvalsGiven}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Approvals Given</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--red-600)' }}>
                      {stats.rejections}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Rejections</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--amber-600)' }}>
                      {stats.logsReviewed ? Math.round((stats.approvalsGiven / stats.logsReviewed) * 100) : 0}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>Approval Rate</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Students Under Supervision */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--gray-200)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Students Under Supervision</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {students.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'var(--gray-500)' }}>
                    No students assigned yet.
                  </Typography>
                ) : students.map((student, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'var(--green-100)', color: 'var(--green-700)' }}>
                          {student.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{student.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'var(--gray-500)' }}>
                            Last log: {student.lastLog}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={student.status} 
                        size="small"
                        sx={{ 
                          bgcolor: student.status === 'Excellent' ? 'var(--green-50)' : 'var(--blue-50)',
                          color: student.status === 'Excellent' ? 'var(--green-700)' : 'var(--blue-700)',
                        }}
                      />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">Progress</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>{student.progress}%</Typography>
                      </Box>
                      <div className="progress-bar" style={{ 
                        height: '4px', 
                        background: 'var(--gray-200)', 
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${student.progress}%`, 
                          height: '100%', 
                          background: 'var(--green-600)',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </Box>
                    {index < students.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography 
                  variant="caption" 
                  sx={{ color: 'var(--green-600)', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/interns')}
                >
                  View all students →
                </Typography>
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

export default WorkplaceSupervisorDashboard;