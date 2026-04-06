// frontend/src/components/dashboard/RecentActivity.jsx
import { Box, Typography, Skeleton } from '@mui/material';
import { T } from './DashboardComponents';

/* ── Activity type → dot colour + icon bg ─────────────────────── */
const ACTIVITY_STYLES = {
  log:        { dot: T.i500,    iconBg: T.i50,    iconColor: T.i600 },
  evaluation: { dot: T.a500,    iconBg: T.a50,    iconColor: T.a600 },
  placement:  { dot: T.t500,    iconBg: T.t50,    iconColor: T.t600 },
  approval:   { dot: T.t400,    iconBg: T.t50,    iconColor: T.t600 },
  warning:    { dot: T.danger,  iconBg: T.dangerL, iconColor: T.danger },
  success:    { dot: T.t400,    iconBg: T.t50,    iconColor: T.t600 },
};

/* ── Activity type → inline SVG icon ─────────────────────────── */
const ACTIVITY_ICONS = {
  log: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  evaluation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  placement: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  ),
  approval: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
};

/* ── Status → badge colours ───────────────────────────────────── */
const statusBadge = (status) => {
  if (!status) return null;
  const s = String(status).toLowerCase();
  if (['approved', 'finalized', 'completed', 'active'].includes(s))
    return { bg: T.t100, color: T.t700 };
  if (['pending', 'submitted', 'under_review'].includes(s))
    return { bg: T.a100, color: T.a700 };
  if (['rejected', 'needs_revision', 'warning'].includes(s))
    return { bg: T.dangerL, color: T.danger };
  if (['draft'].includes(s))
    return { bg: T.i100, color: T.i700 };
  return { bg: T.surface2, color: T.tx3 };
};

/* ─────────────────────────────────────────────────────────────── */
const RecentActivity = ({ activities = [], loading = false }) => {
  return (
    <Box
      sx={{
        bgcolor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: '14px',
        overflow: 'hidden',
        height: '100%',
        boxShadow: '0 1px 3px rgba(13,16,32,.05), 0 4px 18px rgba(13,16,32,.06)',
        animation: 'raFadeUp .5s ease both',
        '@keyframes raFadeUp': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: '18px', py: '14px',
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box
            sx={{
              width: 32, height: 32, borderRadius: '8px',
              bgcolor: T.surface2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.tx3,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
              strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </Box>
          <Typography
            sx={{
              fontSize: '13px', fontWeight: 600, color: T.tx1, lineHeight: 1.2,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Recent Activity
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: '14px 18px' }}>
        {loading ? (
          /* Skeleton rows */
          Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start', mb: '16px' }}>
              <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: '7px', flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={14} sx={{ mb: '4px' }} />
                <Skeleton variant="text" width="80%" height={12} />
              </Box>
            </Box>
          ))
        ) : activities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: '24px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: '8px' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.tx3 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                  strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </Box>
            </Box>
            <Typography sx={{ fontSize: '12.5px', color: T.tx3, fontFamily: "'DM Sans', sans-serif" }}>
              No recent activities
            </Typography>
          </Box>
        ) : (
          /* Timeline layout matching styles_base .timeline */
          <Box sx={{ position: 'relative', pl: '20px' }}>
            {/* Vertical line */}
            <Box
              sx={{
                position: 'absolute', left: '5px', top: '5px', bottom: '5px',
                width: '1.5px',
                background: T.border2,
                borderRadius: '1px',
              }}
            />

            {activities.map((activity, index) => {
              const style  = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.log;
              const icon   = ACTIVITY_ICONS[activity.type]  || ACTIVITY_ICONS.log;
              const badge  = statusBadge(activity.status);
              const isLast = index === activities.length - 1;

              return (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    mb: isLast ? 0 : '14px',
                    animation: `raFadeUp .4s ease ${index * 0.06}s both`,
                  }}
                >
                  {/* Timeline dot */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '-20px', top: '4px',
                      width: 11, height: 11, borderRadius: '50%',
                      bgcolor: style.dot,
                      border: `2.5px solid ${T.surface}`,
                      boxShadow: `0 0 0 1.5px ${T.border2}`,
                    }}
                  />

                  {/* Content */}
                  <Box sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    {/* Icon box */}
                    <Box
                      sx={{
                        width: 28, height: 28, borderRadius: '7px',
                        bgcolor: style.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: style.iconColor,
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: '12px', fontWeight: 600,
                          color: T.tx1, lineHeight: 1.45,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {activity.title}
                      </Typography>

                      {activity.description && (
                        <Typography
                          sx={{
                            fontSize: '11.5px', color: T.tx2,
                            lineHeight: 1.45, mt: '1px',
                            fontFamily: "'DM Sans', sans-serif",
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}
                        >
                          {activity.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '4px', flexWrap: 'wrap' }}>
                        {/* Time */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke={T.tx3} strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" width={10} height={10}>
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <Typography sx={{ fontSize: '10.5px', color: T.tx3, fontFamily: "'DM Sans', sans-serif" }}>
                            {activity.time}
                          </Typography>
                        </Box>

                        {/* Status badge */}
                        {badge && activity.status && (
                          <Box
                            sx={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              px: '7px', py: '1.5px', borderRadius: '99px',
                              bgcolor: badge.bg, color: badge.color,
                              fontSize: '10px', fontWeight: 600,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: badge.color }} />
                            {String(activity.status).replace(/_/g, ' ')}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RecentActivity;