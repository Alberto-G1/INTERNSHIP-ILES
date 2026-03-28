// frontend/src/components/Layout/Topbar.jsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Good morning, Spring 2025 cohort' },
  '/logs': { title: 'Logs', subtitle: 'Weekly internship log entries' },
  '/evaluations': { title: 'Evaluations', subtitle: 'Supervisor reviews and assessments' },
  '/interns': { title: 'Interns', subtitle: 'Spring 2025 cohort · 48 total' },
  '/reports': { title: 'Reports', subtitle: 'Cohort analytics and insights' },
  '/notifications': { title: 'Notifications', subtitle: 'System updates and alerts' },
  '/profile': { title: 'Profile', subtitle: 'Your personal information' },
  '/settings': { title: 'Settings', subtitle: 'System configuration' },
};

const Topbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const pageInfo = pageTitles[location.pathname] || { title: 'AILES', subtitle: '' };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Implement theme toggle logic
    const html = document.documentElement;
    html.setAttribute('data-theme', darkMode ? 'light' : 'dark');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'intern', label: 'Intern' },
  ];
  const [selectedRole, setSelectedRole] = useState('admin');

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary' }}>
            {pageInfo.title}
          </Typography>
          {pageInfo.subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}>
              {pageInfo.subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: 200,
              bgcolor: 'action.hover',
              borderRadius: 1.5,
            }}
          >
            <SearchIcon sx={{ p: '4px', color: 'text.secondary', fontSize: 20 }} />
            <InputBase
              sx={{ ml: 0.5, flex: 1, fontSize: '0.8rem' }}
              placeholder="Search interns, logs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>

          <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'action.hover', borderRadius: 1.5, p: 0.5 }}>
            {roles.map((role) => (
              <Button
                key={role.value}
                variant={selectedRole === role.value ? 'contained' : 'text'}
                onClick={() => setSelectedRole(role.value)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  minWidth: 'auto',
                  bgcolor: selectedRole === role.value ? 'background.paper' : 'transparent',
                  color: selectedRole === role.value ? 'text.primary' : 'text.secondary',
                  boxShadow: selectedRole === role.value ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  '&:hover': {
                    bgcolor: selectedRole === role.value ? 'background.paper' : 'action.hover',
                  },
                }}
              >
                {role.label}
              </Button>
            ))}
          </Box>

          <IconButton onClick={toggleTheme} size="small">
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          <IconButton onClick={handleMenuOpen} size="small">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.8rem',
              }}
            >
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); window.location.href = '/profile'; }} sx={{ gap: 1 }}>
              <PersonIcon fontSize="small" /> Profile
            </MenuItem>
            <MenuItem onClick={() => { toggleTheme(); handleMenuClose(); }} sx={{ gap: 1 }}>
              <DarkModeIcon fontSize="small" /> Dark Mode
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar; 