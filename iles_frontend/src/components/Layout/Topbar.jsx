// frontend/src/components/Layout/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
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
  Fade,
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
  HowToReg as ApprovalsIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';
import { PAGE_TITLES, getRoleLabel, getUserMenuLinks } from './layoutConfig';
import AppConfirmModal from '../Common/AppConfirmModal';

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
  '/admin/approvals': ApprovalsIcon,
};

/* keyframes */
const TOPBAR_STYLES = `
  @keyframes topbarSlideDown {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes searchExpand {
    from { width: 220px; }
    to   { width: 300px; }
  }
  @keyframes searchCollapse {
    from { width: 300px; }
    to   { width: 220px; }
  }
  @keyframes themeIconSpin {
    from { transform: rotate(0deg) scale(1); }
    to   { transform: rotate(360deg) scale(1); }
  }
  @keyframes menuAvatarPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.12); }
    100% { transform: scale(1); }
  }
  @keyframes titleFade {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [signoutModalOpen, setSignoutModalOpen] = useState(false);
  const [themeSpinning, setThemeSpinning] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [titleKey, setTitleKey] = useState(0);

  const searchRef = useRef(null);

  // Inject keyframes once
  useEffect(() => {
    if (!document.getElementById('topbar-keyframes')) {
      const tag = document.createElement('style');
      tag.id = 'topbar-keyframes';
      tag.textContent = TOPBAR_STYLES;
      document.head.appendChild(tag);
    }
  }, []);

  // Re-animate title on route change
  useEffect(() => {
    if (location.pathname !== prevPath) {
      setTitleKey(k => k + 1);
      setPrevPath(location.pathname);
    }
  }, [location.pathname]);

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'AILES', subtitle: '' };
  const userName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'User';
  const roleLabel = getRoleLabel(user?.role);
  const menuLinks = getUserMenuLinks(user?.role);
  const userInitial = user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U';

  const handleThemeToggle = () => {
    setThemeSpinning(true);
    toggleMode();
    setTimeout(() => setThemeSpinning(false), 420);
  };

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    setSignoutModalOpen(false);
    await logout();
    navigate('/login');
  };

  const openSignoutModal = () => {
    handleMenuClose();
    setSignoutModalOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchRef.current?.focus();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid var(--gray-200)',
        backdropFilter: 'blur(8px)',
        animation: 'topbarSlideDown 0.3s ease',
        /* subtle gradient line at bottom */
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, var(--green-600) 0%, var(--green-400) 40%, transparent 100%)',
          opacity: 0.35,
        },
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          minHeight: 56,
          px: { xs: 2, md: 3.5 },
        }}
      >
        {/* ── Page title ── */}
        <Box
          key={titleKey}
          sx={{
            animation: 'titleFade 0.25s ease',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '15.5px',
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.15,
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: '-0.2px',
            }}
          >
            {pageInfo.title}
          </Typography>
          {pageInfo.subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '11.5px',
                display: 'block',
                mt: 0.15,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {pageInfo.subtitle}
            </Typography>
          )}
        </Box>

        {/* ── Right controls ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          {/* Search */}
          <Paper
            sx={{
              p: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              width: searchFocused ? 295 : 220,
              bgcolor: searchFocused ? 'background.paper' : 'var(--gray-100)',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: searchFocused ? 'var(--green-600)' : 'var(--gray-200)',
              boxShadow: searchFocused
                ? '0 0 0 3px rgba(46,139,91,0.12)'
                : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
            }}
          >
            <SearchIcon
              sx={{
                mr: 0.8,
                color: searchFocused ? 'var(--green-600)' : 'var(--gray-400)',
                fontSize: 17,
                transition: 'color 0.18s ease',
                flexShrink: 0,
              }}
            />
            <InputBase
              inputRef={searchRef}
              sx={{
                flex: 1,
                fontSize: '12.5px',
                fontFamily: "'Poppins', sans-serif",
                '& input::placeholder': { color: 'var(--placeholder)', opacity: 1 },
              }}
              placeholder="Search interns, logs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery && (
              <IconButton
                size="small"
                onClick={clearSearch}
                sx={{
                  p: 0,
                  color: 'var(--gray-400)',
                  '&:hover': { color: 'var(--gray-600)' },
                  transition: 'color 0.15s ease',
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Paper>

          {/* Theme toggle */}
          <IconButton
            onClick={handleThemeToggle}
            size="small"
            sx={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              border: '1px solid var(--gray-200)',
              bgcolor: 'var(--white)',
              color: mode === 'dark' ? 'var(--amber-500)' : 'var(--gray-600)',
              transition: 'background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.15s ease',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'var(--amber-100)' : 'var(--gray-100)',
                borderColor: mode === 'dark' ? 'var(--amber-500)' : 'var(--gray-300)',
                transform: 'scale(1.06)',
              },
              '& svg': {
                animation: themeSpinning ? 'themeIconSpin 0.4s ease' : 'none',
                transition: 'transform 0.25s ease',
              },
            }}
          >
            {mode === 'dark' ? (
              <LightModeIcon sx={{ fontSize: 17 }} />
            ) : (
              <DarkModeIcon sx={{ fontSize: 17 }} />
            )}
          </IconButton>

          {/* User button */}
          <Button
            onClick={handleMenuOpen}
            sx={{
              p: '3px 8px 3px 3px',
              borderRadius: '8px',
              color: 'text.primary',
              minWidth: 'auto',
              border: '1px solid var(--gray-200)',
              bgcolor: 'var(--white)',
              textTransform: 'none',
              gap: 0.8,
              transition: 'background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
              '&:hover': {
                bgcolor: 'var(--gray-100)',
                borderColor: 'var(--gray-300)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              },
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: 'var(--green-600)',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: "'Poppins', sans-serif",
                transition: 'transform 0.18s ease',
                '.MuiButton-root:hover &': { transform: 'scale(1.08)' },
              }}
            >
              {userInitial}
            </Avatar>
            <Box sx={{ textAlign: 'left' }}>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: 1.15,
                  fontFamily: "'Poppins', sans-serif",
                  color: 'var(--ink)',
                }}
              >
                {userName}
              </Typography>
              <Typography
                sx={{
                  fontSize: '10px',
                  color: 'text.secondary',
                  lineHeight: 1.1,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {roleLabel}
              </Typography>
            </Box>
            <ExpandMoreIcon
              sx={{
                color: 'var(--gray-400)',
                fontSize: 16,
                transition: 'transform 0.2s ease',
                transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </Button>

          {/* Dropdown menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 180 }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 240,
                borderRadius: '10px',
                border: '1px solid var(--gray-200)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                overflow: 'hidden',
              },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 1.8,
                py: 1.4,
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                background: 'linear-gradient(135deg, var(--green-50) 0%, transparent 100%)',
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'var(--green-600)',
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif",
                  animation: Boolean(anchorEl) ? 'menuAvatarPop 0.4s ease' : 'none',
                }}
              >
                {userInitial}
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: "'Poppins', sans-serif",
                    color: 'var(--ink)',
                  }}
                >
                  {userName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: 'var(--gray-400)',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {roleLabel}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'var(--gray-200)' }} />

            {/* Nav links */}
            {menuLinks.map((link, idx) => {
              const LinkIcon = iconByPath[link.path] || DashboardIcon;
              return (
                <MenuItem
                  key={link.path}
                  onClick={() => { handleMenuClose(); navigate(link.path); }}
                  sx={{
                    gap: 1.2,
                    fontSize: '12.5px',
                    fontFamily: "'Poppins', sans-serif",
                    color: 'var(--gray-700)',
                    py: 1,
                    px: 1.8,
                    transition: 'background-color 0.15s ease, color 0.15s ease, padding-left 0.15s ease',
                    '&:hover': {
                      bgcolor: 'var(--green-50)',
                      color: 'var(--green-700)',
                      pl: '20px',
                    },
                  }}
                >
                  <LinkIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                  {link.label}
                </MenuItem>
              );
            })}

            {/* Theme toggle in menu */}
            <MenuItem
              onClick={() => { handleThemeToggle(); handleMenuClose(); }}
              sx={{
                gap: 1.2,
                fontSize: '12.5px',
                fontFamily: "'Poppins', sans-serif",
                color: 'var(--gray-700)',
                py: 1,
                px: 1.8,
                transition: 'background-color 0.15s ease, color 0.15s ease, padding-left 0.15s ease',
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'var(--amber-100)' : 'var(--gray-100)',
                  pl: '20px',
                },
              }}
            >
              {mode === 'dark' ? (
                <LightModeIcon sx={{ fontSize: 16, color: 'var(--amber-500)' }} />
              ) : (
                <DarkModeIcon sx={{ fontSize: 16, opacity: 0.7 }} />
              )}
              {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </MenuItem>

            <Divider sx={{ borderColor: 'var(--gray-200)' }} />

            {/* Logout */}
            <MenuItem
              onClick={openSignoutModal}
              sx={{
                gap: 1.2,
                fontSize: '12.5px',
                fontFamily: "'Poppins', sans-serif",
                color: 'var(--coral-700)',
                py: 1,
                px: 1.8,
                transition: 'background-color 0.15s ease, padding-left 0.15s ease',
                '&:hover': {
                  bgcolor: 'var(--coral-100)',
                  pl: '20px',
                },
              }}
            >
              <LogoutIcon sx={{ fontSize: 16 }} />
              Logout
            </MenuItem>
          </Menu>

          <AppConfirmModal
            open={signoutModalOpen}
            onClose={() => setSignoutModalOpen(false)}
            onConfirm={handleLogout}
            title="Sign Out of AILES?"
            description="You are about to end this session on the current device."
            confirmLabel="Sign Out"
            cancelLabel="Stay Signed In"
            variant="signout"
            highlight={userName}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;