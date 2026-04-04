// frontend/src/pages/Notifications/NotificationsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageScaffold from '../../components/Common/PageScaffold';
import { auditingAPI, extractErrorMessage } from '../../services/api';
import { notifyError, notifySuccess } from '../../components/Common/AppToast';

const formatTime = (value) => {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString();
};

const NotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsRes, statsRes] = await Promise.all([
        auditingAPI.getNotifications({ unread_only: statusFilter === 'unread' ? 'true' : undefined }),
        auditingAPI.getNotificationStats(),
      ]);

      setNotifications(Array.isArray(notificationsRes.data) ? notificationsRes.data : []);
      setStats((current) => ({ ...current, ...(statsRes.data || {}) }));
    } catch (err) {
      notifyError(extractErrorMessage(err.response?.data) || 'Failed to load notifications', {
        title: 'Load Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [statusFilter]);

  const visibleNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (typeFilter && notification.notification_type !== typeFilter) return false;
      return true;
    });
  }, [notifications, typeFilter]);

  const todayCount = notifications.filter((notification) => {
    const date = new Date(notification.created_at);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }).length;

  const handleMarkRead = async (notificationId) => {
    try {
      await auditingAPI.markNotificationAsRead(notificationId);
      notifySuccess('Notification marked as read', { title: 'Updated' });
      await loadNotifications();
    } catch (err) {
      notifyError(extractErrorMessage(err.response?.data) || 'Failed to update notification', {
        title: 'Update Failed',
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await auditingAPI.markAllNotificationsAsRead();
      notifySuccess('All notifications marked as read', { title: 'Updated' });
      await loadNotifications();
    } catch (err) {
      notifyError(extractErrorMessage(err.response?.data) || 'Failed to mark all as read', {
        title: 'Update Failed',
      });
    }
  };

  return (
    <PageScaffold
      title="Notifications"
      subtitle="Stay updated on review deadlines, submissions, and workflow alerts"
      stats={[
        { label: 'Unread', value: String(stats.unread || 0), helper: 'Needs attention', accent: '#F59E0B' },
        { label: 'Today', value: String(todayCount), helper: 'Incoming events', accent: '#2E8B5B' },
        {
          label: 'Escalated',
          value: String(notifications.filter((item) => item.notification_type === 'error').length),
          helper: 'Critical alerts',
          accent: '#C0392B',
        },
        {
          label: 'Resolved',
          value: String(notifications.filter((item) => item.is_read).length),
          helper: 'Marked read',
          accent: '#5B82A6',
        },
      ]}
    >
      <Stack spacing={1.5}>
        {loading && <Alert severity="info">Loading notifications...</Alert>}

        <Typography sx={{ fontWeight: 600 }}>Notification Center</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Prioritize unread items, then review reminders tied to evaluations, logs, and placement milestones.
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="unread">Unread only</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All types</MenuItem>
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="error">Error</MenuItem>
          </TextField>

          <Button variant="outlined" onClick={handleMarkAllRead} disabled={(stats.unread || 0) === 0}>
            Mark All Read
          </Button>
        </Stack>

        <Divider />

        {visibleNotifications.length === 0 ? (
          <Alert severity="info">No notifications available for current filters.</Alert>
        ) : (
          <Stack spacing={1}>
            {visibleNotifications.map((notification) => (
              <Box
                key={notification.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 1.5,
                  bgcolor: notification.is_read ? 'transparent' : 'rgba(46,139,91,0.05)',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 600 }}>{notification.title}</Typography>
                    <Chip size="small" variant="outlined" label={notification.notification_type} />
                    {!notification.is_read && <Chip size="small" color="warning" label="Unread" />}
                  </Stack>
                  {!notification.is_read && (
                    <Button size="small" onClick={() => handleMarkRead(notification.id)}>
                      Mark read
                    </Button>
                  )}
                </Stack>

                <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.7 }}>
                  {notification.message}
                </Typography>

                <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.6 }}>
                  {formatTime(notification.created_at)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </PageScaffold>
  );
};

export default NotificationsPage;