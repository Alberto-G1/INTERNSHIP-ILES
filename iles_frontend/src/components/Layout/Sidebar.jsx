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
  Logout as LogoutIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

const navigation = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon, roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { path: '/logs', label: 'Logs', icon: LogsIcon, roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { path: '/evaluations', label: 'Evaluations', icon: EvaluationsIcon, roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { path: '/interns', label: 'Interns', icon: InternsIcon, roles: ['workplace_supervisor', 'academic_supervisor', 'admin'] },
  { path: '/reports', label: 'Reports', icon: ReportsIcon, roles: ['admin'] },
  { path: '/notifications', label: 'Notifications', icon: NotificationsIcon, roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { path: '/profile', label: 'Profile', icon: ProfileIcon, roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { path: '/settings', label: 'Settings', icon: SettingsIcon, roles: ['admin'] },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [pendingReviews] = useState(3);
  const [unreadNotifications] = useState(5);

  const filteredNav = navigation.filter(item => 
    item.roles.includes(user?.role || 'student')
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return '#2E8B5B';
      case 'workplace_supervisor': return '#F59E0B';
      case 'academic_supervisor': return '#5B82A6';
      case 'admin': return '#C0392B';
      default: return '#4B5563';
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'student': return 'Student Intern';
      case 'workplace_supervisor': return 'Workplace Supervisor';
      case 'academic_supervisor': return 'Academic Supervisor';
      case 'admin': return 'Administrator';
      default: return role;
    }
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
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            A
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.2 }}>
              AILES
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              v2.4.0
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, py: 2 }}>
        <Typography variant="caption" sx={{ px: 2.5, pb: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
          MAIN
        </Typography>
        <List disablePadding>
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const badge = item.label === 'Evaluations' && pendingReviews > 0 ? pendingReviews : 
                         item.label === 'Notifications' && unreadNotifications > 0 ? unreadNotifications : null;
            
            return (
              <ListItem key={item.path} disablePadding sx={{ px: 1.5, mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : 'text.secondary' }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'primary.main' : 'text.secondary',
                    }}
                  />
                  {badge && (
                    <Chip
                      label={badge}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.7rem',
                        bgcolor: 'secondary.main',
                        color: 'white',
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

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate('/profile')}
            sx={{ borderRadius: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: getRoleColor(user?.role),
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
              secondary={getRoleDisplay(user?.role)}
              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
              secondaryTypographyProps={{ fontSize: '0.7rem' }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mt: 1 }}>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogoutIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ fontSize: '0.85rem', color: 'text.secondary' }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 