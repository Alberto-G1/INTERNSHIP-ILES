// frontend/src/components/Layout/Topbar.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Paper,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Description as LogsIcon,
  BusinessCenter as PlacementsIcon,
  Star as EvaluationsIcon,
  Group as InternsIcon,
  BarChart as ReportsIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';
import { PAGE_TITLES, getRoleLabel, getUserMenuLinks } from './layoutConfig';

const iconByPath = {
  '/dashboard': DashboardIcon,
  '/profile': PersonIcon,
  '/logs': LogsIcon,
  '/placements': PlacementsIcon,
  '/evaluations': EvaluationsIcon,
  '/interns': InternsIcon,
  '/reports': ReportsIcon,
  '/notifications': NotificationsIcon,
  '/settings': SettingsIcon,
};

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'AILES', subtitle: '' };
  const userName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'User';
  const roleLabel = getRoleLabel(user?.role);
  const menuLinks = getUserMenuLinks(user?.role);

  const handleThemeToggle = () => {
    toggleMode();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56, px: { xs: 2, md: 3.5 } }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: 'text.primary', lineHeight: 1.15 }}>
            {pageInfo.title}
          </Typography>
          {pageInfo.subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px', display: 'block', mt: 0.2 }}>
              {pageInfo.subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Paper
            sx={{
              p: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              width: 220,
              bgcolor: mode === 'dark' ? '#0F172A' : '#F3F4F6',
              borderRadius: '6px',
              border: `1px solid ${mode === 'dark' ? '#1E293B' : '#E5E7EB'}`,
              boxShadow: 'none',
            }}
          >
            <SearchIcon sx={{ mr: 0.8, color: '#9CA3AF', fontSize: 18 }} />
            <InputBase
              sx={{ flex: 1, fontSize: '13px' }}
              placeholder="Search interns, logs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>

          <IconButton
            onClick={handleThemeToggle}
            size="small"
            sx={{
              width: 34,
              height: 34,
              borderRadius: '6px',
              border: `1px solid ${mode === 'dark' ? '#1E293B' : '#E5E7EB'}`,
              bgcolor: mode === 'dark' ? '#161F2E' : '#FFFFFF',
            }}
          >
            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          <Button
            onClick={handleMenuOpen}
            sx={{
              p: '2px 6px 2px 2px',
              borderRadius: '6px',
              color: 'text.primary',
              minWidth: 'auto',
              border: `1px solid ${mode === 'dark' ? '#1E293B' : '#E5E7EB'}`,
              bgcolor: mode === 'dark' ? '#161F2E' : '#FFFFFF',
              '&:hover': { bgcolor: mode === 'dark' ? '#0F172A' : '#F3F4F6' },
              textTransform: 'none',
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: 'primary.main',
                fontSize: '12px',
              }}
            >
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ ml: 0.8, textAlign: 'left' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.1 }}>{userName}</Typography>
              <Typography sx={{ fontSize: '10.5px', color: 'text.secondary', lineHeight: 1.1 }}>{roleLabel}</Typography>
            </Box>
            <ExpandMoreIcon sx={{ ml: 0.4, color: 'text.secondary' }} fontSize="small" />
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 260,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box sx={{ px: 1.5, py: 1.2, display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{userName}</Typography>
                <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{roleLabel}</Typography>
              </Box>
            </Box>
            <Divider />

            {menuLinks.map((link) => {
              const LinkIcon = iconByPath[link.path] || DashboardIcon;

              return (
                <MenuItem
                  key={link.path}
                  onClick={() => {
                    handleMenuClose();
                    navigate(link.path);
                  }}
                  sx={{ gap: 1, fontSize: '13px' }}
                >
                  <LinkIcon fontSize="small" /> {link.label}
                </MenuItem>
              );
            })}

            <MenuItem onClick={() => { handleThemeToggle(); handleMenuClose(); }} sx={{ gap: 1, fontSize: '13px' }}>
              {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />} Toggle Theme
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ gap: 1, fontSize: '13px', color: 'error.main' }}>
              <LogoutIcon fontSize="small" /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar; 