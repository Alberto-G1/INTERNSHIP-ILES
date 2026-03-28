// frontend/src/components/Layout/Sidebar.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as LogsIcon,
  Star as EvaluationsIcon,
  People as InternsIcon,
  BarChart as ReportsIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  BusinessCenter as PlacementsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import {
  DRAWER_WIDTH,
  NAVIGATION,
  getRoleColor,
  getRoleLabel,
} from './layoutConfig';

const navigation = NAVIGATION.map((item) => {
  const iconMap = {
    Dashboard: DashboardIcon,
    Logs: LogsIcon,
    Evaluations: EvaluationsIcon,
    Interns: InternsIcon,
    Reports: ReportsIcon,
    Notifications: NotificationsIcon,
    Profile: ProfileIcon,
    Settings: SettingsIcon,
    Placements: PlacementsIcon,
  };

  return {
    ...item,
    icon: iconMap[item.label] || DashboardIcon,
  };
});

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [pendingReviews] = useState(3);
  const [unreadNotifications] = useState(5);

  const filteredNav = navigation.filter(item => 
    item.roles.includes(user?.role || 'student')
  );

  const groupedNav = ['Overview', 'Management', 'System'].map((section) => ({
    section,
    items: filteredNav.filter((item) => item.section === section),
  }));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: '#E5E7EB',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: '20px 20px 16px', borderBottom: '1px solid #E5E7EB' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            A
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '15px', lineHeight: 1.1 }}>
              AILES
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '10px', letterSpacing: '0.6px' }}>
              v2.4.0
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, py: 1.5 }}>
        {groupedNav.map(({ section, items }) => (
          items.length > 0 ? (
            <Box key={section} sx={{ px: 1.5, pt: 0.6, pb: 1.2 }}>
              <Typography sx={{ px: 1, pb: 0.5, fontSize: '10px', color: '#9CA3AF', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 500 }}>
                {section}
              </Typography>
              <List disablePadding>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const badge = item.label === 'Evaluations' && pendingReviews > 0 ? pendingReviews :
                    item.label === 'Notifications' && unreadNotifications > 0 ? unreadNotifications : null;

                  return (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => navigate(item.path)}
                        sx={{
                          py: 0.9,
                          px: 1.1,
                          borderRadius: '6px',
                          bgcolor: isActive ? '#EEF9F3' : 'transparent',
                          '&:hover': { bgcolor: '#F3F4F6' },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 28, color: isActive ? 'primary.main' : '#4B5563' }}>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: '13.5px',
                            fontWeight: isActive ? 500 : 400,
                            color: isActive ? 'primary.main' : '#4B5563',
                          }}
                        />
                        {badge && (
                          <Chip
                            label={badge}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '10px',
                              bgcolor: '#F59E0B',
                              color: '#FFFFFF',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ) : null
        ))}
      </Box>

      <Box sx={{ p: 1.5, borderTop: '1px solid #E5E7EB' }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate('/profile')}
            sx={{ borderRadius: '6px', py: 0.9, px: 1.1 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: getRoleColor(user?.role),
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
              secondary={getRoleLabel(user?.role)}
              primaryTypographyProps={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}
              secondaryTypographyProps={{ fontSize: '11px', color: '#9CA3AF' }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mt: 1 }}>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: '6px', py: 0.9, px: 1.1 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <LogoutIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ fontSize: '13px', color: '#4B5563' }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 