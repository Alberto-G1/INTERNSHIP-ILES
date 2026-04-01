import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { auditingAPI } from '../../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await auditingAPI.getNotifications({ unread_only: false });
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (_error) {
      console.error('Failed to load notifications', _error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await auditingAPI.markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (_error) {
      console.error('Failed to mark as read', _error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await auditingAPI.markAllNotificationsAsRead();
      await loadNotifications();
    } catch (_error) {
      console.error('Failed to mark all as read', _error);
    }
  };

  const getChipColor = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        color="inherit"
        size="small"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              width: 400,
              maxHeight: 500,
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700 }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </Stack>
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography sx={{ color: 'text.secondary' }}>No notifications</Typography>
          </MenuItem>
        ) : (
          <Stack sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                sx={{
                  py: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  backgroundColor: notification.is_read ? 'transparent' : '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#eeeeee',
                  },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 600, flex: 1 }}>
                    {notification.title}
                  </Typography>
                  <Chip
                    size="small"
                    label={notification.notification_type}
                    color={getChipColor(notification.notification_type)}
                    variant="outlined"
                  />
                </Stack>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {notification.message}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>
                  {new Date(notification.created_at).toLocaleString()}
                </Typography>
              </MenuItem>
            ))}
          </Stack>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
