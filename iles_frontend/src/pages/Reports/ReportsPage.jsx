import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
  Groups as GroupsIcon,
  LocalPrintshop as PrintIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import QuickActions from '../../components/dashboard/QuickActions';
import { DashGreeting, SectionCard, ProgressRow, MiniStat, T } from '../../components/dashboard/DashboardComponents';
import { insightsAPI } from '../../services/api';

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const fmt = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
};

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const Gauge = ({ label, value, accent = T.t700, sublabel }) => {
  const percent = Math.max(0, Math.min(100, Number(value || 0)));
  const size = 126;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={T.surface2} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accent}
            strokeLinecap="round"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * percent) / 100}
            style={{ transition: 'stroke-dashoffset .8s ease' }}
          />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '26px', fontWeight: 700, lineHeight: 1, color: T.tx1, fontVariantNumeric: 'tabular-nums', fontFamily: "'DM Sans', sans-serif" }}>
            {percent}
          </Typography>
          <Typography sx={{ fontSize: '10px', color: T.tx3, textTransform: 'uppercase', letterSpacing: '.8px', fontFamily: "'DM Sans', sans-serif" }}>
            / 100
          </Typography>
        </Box>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: T.tx1, textTransform: 'uppercase', letterSpacing: '.6px', fontFamily: "'DM Sans', sans-serif" }}>
          {label}
        </Typography>
        {sublabel && (
          <Typography sx={{ fontSize: '12px', color: T.tx3, mt: '4px', lineHeight: 1.45, maxWidth: 220, fontFamily: "'DM Sans', sans-serif" }}>
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const BarList = ({ title, items = [], emptyText = 'No data available yet.', color = T.t700 }) => (
  <Box>
    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: T.tx1, mb: 1, fontFamily: "'DM Sans', sans-serif" }}>
      {title}
    </Typography>
    {items.length === 0 ? (
      <Typography sx={{ color: T.tx3, fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>{emptyText}</Typography>
    ) : (
      <Stack spacing={1.4}>
        {items.map((item) => (
          <Box key={item.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, mb: '4px' }}>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: T.tx1, fontFamily: "'DM Sans', sans-serif" }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: '11.5px', color: T.tx3, fontFamily: "'DM Sans', sans-serif" }}>
                {item.value} {item.share !== undefined ? `(${fmt(item.share)}%)` : ''}
              </Typography>
            </Box>
            <Box sx={{ height: 7, bgcolor: T.surface2, border: `1px solid ${T.border}`, borderRadius: '999px', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${Math.max(4, Math.min(100, Number(item.share ?? item.value ?? 0))) }%`,
                  borderRadius: '999px',
                  background: `linear-gradient(90deg, ${item.color || color}, ${item.color || color}cc)`,
                  transition: 'width .8s ease',
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    )}
  </Box>
);

const ReportsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await insightsAPI.getAdminReport({
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        });
        setReport(response.data || null);
      } catch (err) {
        setReport(null);
        setError(err?.response?.data?.detail || err?.response?.data?.error || 'Unable to load reporting data.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [dateFrom, dateTo, refreshTick]);

  const data = report || {
    stats: [],
    overview: { users: {}, placements: {}, logbook: {}, performance: {} },
    alerts: [],
    recent_activity: [],
    window: {},
  };

  const overview = data.overview || {};
  const placements = overview.placements || {};
  const logbook = overview.logbook || {};
  const performance = overview.performance || {};

  const search = searchTerm.trim().toLowerCase();

  const filteredAlerts = useMemo(() => {
    if (!search) return data.alerts || [];
    return (data.alerts || []).filter((alert) => (
      `${alert.title} ${alert.detail} ${alert.severity}`.toLowerCase().includes(search)
    ));
  }, [data.alerts, search]);

  const filteredPerformers = useMemo(() => {
    if (!search) return performance.top_performers || [];
    return (performance.top_performers || []).filter((item) => (
      `${item.student_name} ${item.organization} ${item.grade} ${item.remarks}`.toLowerCase().includes(search)
    ));
  }, [performance.top_performers, search]);

  const filteredActivity = useMemo(() => {
    if (!search) return data.recent_activity || [];
    return (data.recent_activity || []).filter((item) => (
      `${item.title} ${item.description} ${item.status}`.toLowerCase().includes(search)
    ));
  }, [data.recent_activity, search]);

  const summaryStats = data.stats || [];
  const totalPlacements = Number(placements.total || 0);
  const logApprovalRate = Number(logbook.approval_rate || 0);
  const evaluationCompletionRate = Number(performance.evaluation_completion_rate || 0);
  const averageFinalScore = performance.average_final_score || '0.00';
  const activePlacements = Number(placements.active || 0);

  const quickActions = [
    { label: 'Refresh Dashboard', icon: <RefreshIcon sx={{ fontSize: 18 }} />, onClick: () => setRefreshTick((value) => value + 1) },
    { label: 'Export PDF', icon: <PrintIcon sx={{ fontSize: 18 }} />, onClick: () => downloadReport('pdf') },
    { label: 'View Audit Logs', icon: <AssessmentIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/admin/audit-logs') },
    { label: 'Review Approvals', icon: <WarningIcon sx={{ fontSize: 18 }} />, onClick: () => navigate('/admin/approvals') },
  ];

  const downloadReport = async (format = 'csv') => {
    try {
      const response = await insightsAPI.exportAdminReport({
        format,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      const mimeType = format === 'pdf'
        ? 'application/pdf'
        : format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv';
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: mimeType });
      downloadBlob(blob, `insights-report.${format}`);
    } catch {
      const rows = [
        ['Metric', 'Value', 'Context'],
        ...summaryStats.map((item) => [item.label, item.value, item.helper || '']),
      ];

      const csvText = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      downloadBlob(new Blob([csvText], { type: 'text/csv' }), 'insights-report.csv');
    }
  };

  return (
    <Box sx={{ fontFamily: "'DM Sans', sans-serif" }}>
      <DashGreeting
        role="admin"
        greeting="Reporting Hub"
        name=""
        sub="Phase 8 turns raw placements, logs, and evaluations into executive-ready insight.
        Use the filters below to narrow the reporting window, then export the view for sharing or printing."
        roleTag={`Generated ${data.window?.generated_at ? new Date(data.window.generated_at).toLocaleString() : 'recently'}`}
        stats={[
          { num: totalPlacements, label: 'Placements' },
          { num: activePlacements, label: 'Active' },
          { num: `${logApprovalRate}%`, label: 'Log Approval' },
          { num: `${evaluationCompletionRate}%`, label: 'Eval Coverage' },
        ]}
      />

      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: '16px',
          border: `1px solid ${T.border}`,
          background: `linear-gradient(180deg, ${T.surface} 0%, ${T.surface2} 100%)`,
          boxShadow: '0 1px 3px rgba(13,16,32,.05), 0 4px 18px rgba(13,16,32,.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <FilterIcon sx={{ color: T.t700, fontSize: 18 }} />
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: T.tx1 }}>Filters & Exports</Typography>
          <Chip size="small" label={data.window?.date_from ? `From ${data.window.date_from}` : 'All time'} sx={{ bgcolor: T.t50, color: T.t700 }} />
          <Chip size="small" label={data.window?.date_to ? `To ${data.window.date_to}` : 'No end date'} sx={{ bgcolor: T.i50, color: T.i700 }} />
        </Box>

        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search report"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="organization, grade, alert, student"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: T.tx3, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="To"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => downloadReport('csv')} sx={{ bgcolor: T.t700, '&:hover': { bgcolor: T.t800 } }}>
                Export CSV
              </Button>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => downloadReport('pdf')} sx={{ borderColor: T.border, color: T.tx1 }}>
                Export PDF
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadReport('xlsx')} sx={{ borderColor: T.border, color: T.tx1 }}>
                Export Excel
              </Button>
              <Button variant="text" startIcon={<RefreshIcon />} onClick={() => setRefreshTick((value) => value + 1)}>
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {(summaryStats.length > 0 ? summaryStats : [
          { label: 'Students', value: overview.users?.students || 0, helper: 'Registered student accounts', accent: '#2E8B5B' },
          { label: 'Active Placements', value: activePlacements, helper: 'Current internship placements', accent: '#5569E0' },
          { label: 'Pending Reviews', value: logbook.pending_review || 0, helper: 'Logs awaiting action', accent: '#F08C30' },
          { label: 'System Health', value: '100%', helper: 'Operational visibility score', accent: '#0F7B5C' },
        ]).map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <StatCard
              value={stat.value}
              label={stat.label}
              sub={stat.helper}
              variant={index === 1 ? 'indigo' : index === 2 ? 'amber' : index === 3 ? 'teal' : 'teal'}
              icon={
                index === 0 ? <GroupsIcon sx={{ fontSize: 17 }} /> :
                index === 1 ? <SchoolIcon sx={{ fontSize: 17 }} /> :
                index === 2 ? <WarningIcon sx={{ fontSize: 17 }} /> :
                <TrendingUpIcon sx={{ fontSize: 17 }} />
              }
              loading={loading}
              delay={index * 0.05}
            />
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <SectionCard
            title="Placement Analytics"
            subtitle="Where the internship pipeline is concentrated"
            delay={0.15}
          >
            <Stack spacing={2}>
              <BarList
                title="Top Organizations"
                items={placements.by_organization || []}
                emptyText="No placement data is available for the selected range."
                color={T.t700}
              />
              <Divider />
              <BarList
                title="Region Distribution"
                items={placements.by_region || []}
                emptyText="No regional distribution found."
                color={T.i700}
              />
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard
            title="Logbook Health"
            subtitle="Submission flow and approval cadence"
            delay={0.2}
          >
            <Stack spacing={1.2}>
              <Gauge
                label="Approval Rate"
                value={logbook.approval_rate || 0}
                accent={T.t700}
                sublabel={`${fmt(logbook.approved || 0)} approved logs out of ${fmt(logbook.total || 0)} total logs.`}
              />
              <Divider />
              <ProgressRow label="Approved" value={Math.round(Number(logbook.approved || 0) / Math.max(Number(logbook.total || 0), 1) * 100)} color={T.t700} count={logbook.approved || 0} total={logbook.total || 0} />
              <ProgressRow label="Pending Review" value={Math.round(Number(logbook.pending_review || 0) / Math.max(Number(logbook.total || 0), 1) * 100)} color={T.a600} count={logbook.pending_review || 0} total={logbook.total || 0} />
              <ProgressRow label="Late Submissions" value={Math.round(Number(logbook.late_submissions || 0) / Math.max(Number(logbook.total || 0), 1) * 100)} color={T.danger} count={logbook.late_submissions || 0} total={logbook.total || 0} />
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <SectionCard
            title="Performance Snapshot"
            subtitle="Final score distribution and completion"
            delay={0.25}
          >
            <Stack spacing={2}>
              <Gauge
                label="Evaluation Coverage"
                value={performance.evaluation_completion_rate || 0}
                accent={T.a700}
                sublabel={`${fmt(performance.final_scores || 0)} released scores across the cohort.`}
              />
              <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                <MiniStat value={averageFinalScore} label="Avg Score" color={T.tx1} bg={T.surface2} />
                <MiniStat value={fmt(performance.final_scores || 0)} label="Final Scores" color={T.t700} bg={T.t50} />
                <MiniStat value={fmt(performance.evaluation_completion_rate || 0)} label="Coverage %" color={T.a700} bg={T.a50} />
              </Box>
              <Divider />
              <BarList
                title="Grade Distribution"
                items={performance.grade_distribution || []}
                emptyText="No final scores were generated for the selected range."
                color={T.a700}
              />
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <SectionCard
            title="Top Performers"
            subtitle="Students ranked by released final score"
            delay={0.3}
          >
            {filteredPerformers.length === 0 ? (
              <Typography sx={{ color: T.tx3, fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
                No performers match the current search or reporting window.
              </Typography>
            ) : (
              <Stack spacing={1.3}>
                {filteredPerformers.map((item, index) => (
                  <Box key={`${item.student_name}-${index}`} sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${T.border}`, bgcolor: T.surface2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                      <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: T.tx1, fontFamily: "'DM Sans', sans-serif" }}>
                          {item.student_name}
                        </Typography>
                        <Typography sx={{ fontSize: '11.5px', color: T.tx3, mt: '2px', fontFamily: "'DM Sans', sans-serif" }}>
                          {item.organization}
                        </Typography>
                      </Box>
                      <Chip size="small" label={`Grade ${item.grade || 'N/A'}`} sx={{ bgcolor: T.t50, color: T.t700 }} />
                    </Box>
                    <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: T.tx1, fontFamily: "'DM Sans', sans-serif" }}>
                        {item.final_score}
                      </Typography>
                      <Box sx={{ flex: 1, height: 6, bgcolor: T.border2, borderRadius: '999px', overflow: 'hidden' }}>
                        <Box sx={{ width: `${Math.max(8, Math.min(100, (Number(item.final_score || 0) / 100) * 100))}%`, height: '100%', bgcolor: T.a700, borderRadius: '999px' }} />
                      </Box>
                    </Box>
                    {item.remarks && (
                      <Typography sx={{ mt: 1, fontSize: '11.5px', color: T.tx3, fontFamily: "'DM Sans', sans-serif" }}>
                        {item.remarks}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <RecentActivity activities={filteredActivity} loading={loading} />
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard
            title="System Alerts"
            subtitle="Items that need the administrator's attention"
            delay={0.4}
          >
            {filteredAlerts.length === 0 ? (
              <Typography sx={{ color: T.tx3, fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
                No alerts match the current search or reporting window.
              </Typography>
            ) : (
              <Stack spacing={1.2}>
                {filteredAlerts.map((alert) => (
                  <Box key={alert.title} sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${T.border}`, bgcolor: T.surface2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                      <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: T.tx1, fontFamily: "'DM Sans', sans-serif" }}>
                          {alert.title}
                        </Typography>
                        <Typography sx={{ fontSize: '11.5px', color: T.tx3, mt: '2px', fontFamily: "'DM Sans', sans-serif" }}>
                          {alert.detail}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={alert.count}
                        sx={{
                          bgcolor: alert.severity === 'danger' ? T.dangerL : alert.severity === 'warning' ? T.a50 : T.t50,
                          color: alert.severity === 'danger' ? T.danger : alert.severity === 'warning' ? T.a700 : T.t700,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12}>
          <QuickActions actions={quickActions} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;