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
  useMediaQuery,
  useTheme,
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
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';
import { PAGE_TITLES, getRoleLabel, getUserMenuLinks, getRoleGradient } from './layoutConfig';
import AppConfirmModal from '../Common/AppConfirmModal';
import NotificationBell from '../Common/NotificationBell';
import { resolveMediaUrl } from '../../utils/mediaUrl';

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
  '/admin/audit-logs': LogsIcon,
  '/admin/approvals': ApprovalsIcon,
};

const Topbar = ({ onMenuClick, isMobile, profile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [signoutModalOpen, setSignoutModalOpen] = useState(false);
  const [titleKey, setTitleKey] = useState(0);
  const [prevPath, setPrevPath] = useState(location.pathname);

  const searchRef = useRef(null);

  useEffect(() => {
    if (location.pathname !== prevPath) {
      setTitleKey(k => k + 1);
      setPrevPath(location.pathname);
    }
  }, [location.pathname]);

  const activeProfile = profile || user || {};
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'AILES', subtitle: '' };
  const userName = activeProfile?.full_name
    || (activeProfile?.first_name
      ? `${activeProfile.first_name} ${activeProfile.last_name || ''}`.trim()
      : activeProfile?.username || 'User');
  const roleLabel = getRoleLabel(activeProfile?.role);
  const menuLinks = getUserMenuLinks(activeProfile?.role);
  const userInitial = activeProfile?.first_name?.[0] || activeProfile?.username?.[0]?.toUpperCase() || 'U';
  const userAvatarSrc = resolveMediaUrl(activeProfile?.profile_picture);
  const roleGradient = getRoleGradient(activeProfile?.role);

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
        bgcolor: 'var(--glass, rgba(255,255,255,0.7))',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border, rgba(55,65,120,0.08))',
        height: 64,
        boxShadow: '0 1px 0 var(--border)',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          minHeight: 64,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Left section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box key={titleKey}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '14px', sm: '15px' },
                fontWeight: 600,
                color: 'var(--tx1, #0D1020)',
                letterSpacing: '-0.3px',
              }}
            >
              {pageInfo.title}
            </Typography>
            {pageInfo.subtitle && !isMobile && (
              <Typography
                variant="caption"
                sx={{
                  color: 'var(--tx3, #8A90B4)',
                  fontSize: '10.5px',
                  display: 'block',
                  mt: '1px',
                }}
              >
                {pageInfo.subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {/* Search */}
          {!isMobile && (
            <Paper
              sx={{
                p: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                width: searchFocused ? 260 : 220,
                bgcolor: searchFocused ? 'var(--surface, #FFFFFF)' : 'var(--surface2, #F6F7FC)',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: searchFocused ? 'var(--t400, #45C99A)' : 'var(--border, rgba(55,65,120,0.08))',
                boxShadow: searchFocused ? '0 0 0 3px rgba(45,175,131,0.12)' : 'none',
                transition: 'all 0.22s ease',
              }}
            >
              <SearchIcon
                sx={{
                  mr: 0.8,
                  color: searchFocused ? 'var(--t400, #45C99A)' : 'var(--tx3, #8A90B4)',
                  fontSize: 13,
                  flexShrink: 0,
                }}
              />
              <InputBase
                inputRef={searchRef}
                sx={{
                  flex: 1,
                  fontSize: '12.5px',
                  '& input::placeholder': { color: 'var(--tx3, #8A90B4)' },
                }}
                placeholder="Search interns, logs…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery && (
                <IconButton size="small" onClick={clearSearch} sx={{ p: 0 }}>
                  <CloseIcon sx={{ fontSize: 14, color: 'var(--tx3)' }} />
                </IconButton>
              )}
            </Paper>
          )}

          {/* Theme toggle */}
          <IconButton
            onClick={toggleMode}
            size="small"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '9px',
              border: '1px solid var(--border)',
              bgcolor: 'var(--surface2)',
              color: mode === 'dark' ? 'var(--warning, #F08C30)' : 'var(--tx2, #3D4466)',
              transition: 'all 0.18s',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(240,140,48,0.1)' : 'var(--t50, #EDFBF7)',
                borderColor: mode === 'dark' ? '#F08C30' : 'var(--t200, #A8EDDB)',
                transform: 'scale(1.06)',
              },
            }}
          >
            {mode === 'dark' ? (
              <LightModeIcon sx={{ fontSize: 15 }} />
            ) : (
              <DarkModeIcon sx={{ fontSize: 15 }} />
            )}
          </IconButton>

          {/* Notifications */}
          <NotificationBell />

          {/* User button */}
          <Button
            onClick={handleMenuOpen}
            sx={{
              p: '5px 10px 5px 5px',
              borderRadius: '12px',
              color: 'var(--tx1)',
              minWidth: 'auto',
              border: '1px solid var(--border)',
              bgcolor: 'var(--surface2)',
              textTransform: 'none',
              gap: 0.8,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'var(--border2)',
                bgcolor: 'var(--surface)',
              },
            }}
          >
            <Avatar
              src={userAvatarSrc || undefined}
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: roleGradient,
                fontSize: '11px',
                fontWeight: 700,
                position: 'relative',
              }}
            >
              {userInitial}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  bgcolor: '#22C55E',
                  border: '2px solid var(--surface)',
                }}
              />
            </Avatar>
            {!isMobile && (
              <>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.2 }}>
                    {userName}
                  </Typography>
                  <Typography sx={{ fontSize: '10.5px', color: 'var(--tx3)', lineHeight: 1.2 }}>
                    {roleLabel}
                  </Typography>
                </Box>
                <ExpandMoreIcon
                  sx={{
                    color: 'var(--tx3)',
                    fontSize: 12,
                    transition: 'transform 0.2s',
                    transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </>
            )}
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
                minWidth: 268,
                borderRadius: '20px',
                border: '1px solid var(--border2)',
                boxShadow: 'var(--shxl, 0 20px 60px rgba(13,16,32,.16))',
                overflow: 'hidden',
                bgcolor: 'var(--surface)',
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                background: `linear-gradient(145deg, var(--t50, #EDFBF7), var(--i50, #F0F3FF))`,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <Box sx={{ position: 'relative', width: 50, mb: 1 }}>
                <Avatar
                  src={userAvatarSrc || undefined}
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '14px',
                    background: roleGradient,
                    fontSize: '16px',
                    fontWeight: 700,
                  }}
                >
                  {userInitial}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: -3,
                    borderRadius: '17px',
                    border: '2px solid var(--t400, #45C99A)',
                    opacity: 0.4,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 1,
                    right: 1,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#22C55E',
                    border: '2px solid var(--surface)',
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, mb: 0.5 }}>
                {userName}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'var(--tx3)', mb: 1 }}>
                {activeProfile?.email || user?.email || 'user@ailes.edu'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', px: '8px', py: '2.5px', borderRadius: '99px', bgcolor: 'var(--t100, #D4F7EE)', color: 'var(--t800, #155E44)', fontSize: '10px', fontWeight: 600 }}>
                  {roleLabel}
                </Box>
              </Box>
            </Box>

            <Box sx={{ p: '6px' }}>
              {menuLinks.map((link) => {
                const LinkIcon = iconByPath[link.path] || DashboardIcon;
                return (
                  <MenuItem
                    key={link.path}
                    onClick={() => { handleMenuClose(); navigate(link.path); }}
                    sx={{
                      gap: 1.2,
                      fontSize: '12.5px',
                      color: 'var(--tx2)',
                      py: 1,
                      px: 1.2,
                      borderRadius: '9px',
                      transition: 'all 0.14s',
                      '&:hover': {
                        bgcolor: 'var(--surface2)',
                        color: 'var(--tx1)',
                      },
                    }}
                  >
                    <Box sx={{ width: 28, height: 28, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--surface2)' }}>
                      <LinkIcon sx={{ fontSize: 13 }} />
                    </Box>
                    {link.label}
                  </MenuItem>
                );
              })}

              <Divider sx={{ my: 0.5, borderColor: 'var(--border)' }} />

              <MenuItem
                onClick={toggleMode}
                sx={{
                  gap: 1.2,
                  fontSize: '12.5px',
                  color: 'var(--tx2)',
                  py: 1,
                  px: 1.2,
                  borderRadius: '9px',
                  '&:hover': { bgcolor: 'var(--surface2)' },
                }}
              >
                <Box sx={{ width: 28, height: 28, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--surface2)' }}>
                  {mode === 'dark' ? (
                    <LightModeIcon sx={{ fontSize: 13, color: 'var(--warning)' }} />
                  ) : (
                    <DarkModeIcon sx={{ fontSize: 13 }} />
                  )}
                </Box>
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </MenuItem>

              <Divider sx={{ my: 0.5, borderColor: 'var(--border)' }} />

              <MenuItem
                onClick={openSignoutModal}
                sx={{
                  gap: 1.2,
                  fontSize: '12.5px',
                  color: 'var(--danger, #E84545)',
                  py: 1,
                  px: 1.2,
                  borderRadius: '9px',
                  '&:hover': { bgcolor: 'var(--danger-l, #FDEAEA)' },
                }}
              >
                <Box sx={{ width: 28, height: 28, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--danger-l)' }}>
                  <LogoutIcon sx={{ fontSize: 13 }} />
                </Box>
                Sign Out
              </MenuItem>
            </Box>

            <Box sx={{ p: '8px 10px', borderTop: '1px solid var(--border)', bgcolor: 'var(--surface2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '11.5px', color: 'var(--tx3)' }}>Appearance</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box
                    onClick={() => { if (mode !== 'light') toggleMode(); handleMenuClose(); }}
                    sx={{
                      px: '10px',
                      py: '3px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      bgcolor: mode === 'light' ? 'var(--surface)' : 'transparent',
                      color: mode === 'light' ? 'var(--tx1)' : 'var(--tx3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <LightModeIcon sx={{ fontSize: 10 }} /> Light
                  </Box>
                  <Box
                    onClick={() => { if (mode !== 'dark') toggleMode(); handleMenuClose(); }}
                    sx={{
                      px: '10px',
                      py: '3px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      bgcolor: mode === 'dark' ? 'var(--surface)' : 'transparent',
                      color: mode === 'dark' ? 'var(--tx1)' : 'var(--tx3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <DarkModeIcon sx={{ fontSize: 10 }} /> Dark
                  </Box>
                </Box>
              </Box>
            </Box>
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