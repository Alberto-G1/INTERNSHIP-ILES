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
import { PAGE_TITLES, getRoleLabel, getUserMenuLinks } from './layoutConfig';
import AppConfirmModal from '../Common/AppConfirmModal';
import NotificationBell from '../Common/NotificationBell';
import { resolveMediaUrl } from '../../utils/mediaUrl';

/* ─── Role accent colours ────────────────────────────────────────── */
const ROLE_ACCENTS = {
  student:              { gradient: 'linear-gradient(135deg,#C05500,#F08C30)' },
  workplace_supervisor: { gradient: 'linear-gradient(135deg,#2F3DAA,#5569E0)' },
  academic_supervisor:  { gradient: 'linear-gradient(135deg,#6D28D9,#9C4AFF)' },
  admin:                { gradient: 'linear-gradient(135deg,#1A7A57,#2DAF83)' },
};

const TOPBAR_STYLES = `
  @keyframes topbarSlideDown {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes themeIconSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes titleFade {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;

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
  const [themeSpinning, setThemeSpinning] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [titleKey, setTitleKey] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('topbar-ailes-styles')) {
      const tag = document.createElement('style');
      tag.id = 'topbar-ailes-styles';
      tag.textContent = TOPBAR_STYLES;
      document.head.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    if (location.pathname !== prevPath) {
      setTitleKey((k) => k + 1);
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
  const accent = ROLE_ACCENTS[activeProfile?.role] || ROLE_ACCENTS.student;

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

  /* ── Icon map for menu items ───────────────────────────────────── */
  const pathIconMap = {
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

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'var(--glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'var(--border)',
          animation: 'topbarSlideDown 0.3s ease',
          boxShadow: '0 1px 0 var(--border)',
          /* Subtle teal accent line at bottom */
          '&::after': {
            content: '""',
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, #1A7A57 0%, #2DAF83 40%, transparent 100%)',
            opacity: 0.4,
          },
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3, md: 4 },
            gap: 2,
          }}
        >
          {/* ── Left: breadcrumb + page title ─────────────────────── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={onMenuClick}
                sx={{ mr: 0.5, color: 'text.primary' }}
              >
                <MenuIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}

            <Box key={titleKey} sx={{ animation: 'titleFade 0.25s ease', minWidth: 0 }}>
              {/* Breadcrumb */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: '1px' }}>
                <Typography sx={{ fontSize: '10.5px', color: 'var(--tx3)', fontFamily: "'DM Sans', sans-serif" }}>
                  AILES
                </Typography>
                <svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--tx3, #8A90B4)' }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <Typography sx={{ fontSize: '10.5px', color: 'var(--tx3)', fontFamily: "'DM Sans', sans-serif" }}>
                  {pageInfo.title}
                </Typography>
              </Box>
              {/* Page title */}
              <Typography
                sx={{
                  fontSize: { xs: '14px', sm: '15px' },
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.2,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '-0.3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {pageInfo.title}
              </Typography>
            </Box>
          </Box>

          {/* ── Right: search + actions ───────────────────────────── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: '6px', sm: '6px' } }}>
            {/* Search bar */}
            {!isMobile && (
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  bgcolor: searchFocused ? 'var(--surface)' : 'var(--surface2)',
                  border: '1px solid',
                  borderColor: searchFocused ? 'var(--t400)' : 'var(--border)',
                  borderRadius: '10px',
                  px: '14px', py: '7px',
                  width: searchFocused ? 260 : 220,
                  transition: 'all .22s cubic-bezier(.4,0,.2,1)',
                  boxShadow: searchFocused ? '0 0 0 3px rgba(45,175,131,0.12)' : 'none',
                }}
              >
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke={searchFocused ? 'var(--t400)' : 'var(--tx3)'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: 'stroke .18s' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <InputBase
                  inputRef={searchRef}
                  placeholder="Search interns, logs…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  sx={{
                    flex: 1, fontSize: '12.5px',
                    fontFamily: "'DM Sans', sans-serif",
                    color: 'var(--tx1)',
                    '& input::placeholder': { color: 'var(--tx3)', opacity: 1 },
                  }}
                />
                {searchQuery && (
                  <IconButton size="small" onClick={clearSearch} sx={{ p: 0, color: 'var(--tx2)', '&:hover': { color: 'var(--tx1)' } }}>
                    <CloseIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                )}
              </Box>
            )}

            {/* Theme toggle */}
            <Box
              component="button"
              onClick={handleThemeToggle}
              sx={{
                width: 36, height: 36, borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'var(--surface2)',
                border: '1px solid',
                borderColor: 'var(--border)',
                color: 'var(--tx2)',
                cursor: 'pointer', transition: 'all .18s',
                '&:hover': {
                  bgcolor: 'var(--surface)',
                  borderColor: 'var(--t400)',
                  transform: 'scale(1.05)',
                },
                '& svg': { animation: themeSpinning ? 'themeIconSpin 0.4s ease' : 'none' },
              }}
            >
              {mode === 'dark'
                ? <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              }
            </Box>

            {/* Notifications */}
            <Box
              sx={{
                width: 36, height: 36, borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'var(--surface2)',
                border: '1px solid',
                borderColor: 'var(--border)',
                position: 'relative',
                transition: 'all .18s',
                '&:hover': {
                  bgcolor: 'var(--t50)',
                  borderColor: 'var(--t400)',
                  color: 'var(--t700)',
                },
              }}
            >
              <NotificationBell />
            </Box>

            {/* ── User dropdown button ─────────────────────────────── */}
            <Box
              component="button"
              onClick={handleMenuOpen}
              sx={{
                display: 'flex', alignItems: 'center', gap: '8px',
                p: '5px 10px 5px 5px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(55,65,120,0.08)',
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F6F7FC',
                cursor: 'pointer',
                transition: 'all .2s',
                '&:hover': {
                  borderColor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(55,65,120,0.15)',
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#fff',
                },
              }}
            >
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  src={userAvatarSrc || undefined}
                  sx={{
                    width: 30, height: 30, borderRadius: '8px',
                    background: accent.gradient,
                    fontSize: '11px', fontWeight: 700, color: '#fff',
                  }}
                >
                  {userInitial}
                </Avatar>
                {/* Online dot */}
                <Box sx={{
                  position: 'absolute', bottom: -1, right: -1,
                  width: 9, height: 9, borderRadius: '50%',
                  bgcolor: '#22C55E',
                  border: `2px solid ${mode === 'dark' ? 'rgba(20,24,41,1)' : '#fff'}`,
                }} />
              </Box>
              {!isMobile && (
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.primary', lineHeight: 1.2, whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
                    {userName}
                  </Typography>
                  <Typography sx={{ fontSize: '10.5px', color: 'text.secondary', lineHeight: 1.2, fontFamily: "'DM Sans', sans-serif" }}>
                    {roleLabel}
                  </Typography>
                </Box>
              )}
              <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                style={{ color: '#8A90B4', transition: 'transform .2s', transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── User dropdown menu ──────────────────────────────────────── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            width: 268,
            mt: 1.25,
            borderRadius: '20px',
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.13)' : 'rgba(55,65,120,0.15)',
            bgcolor: mode === 'dark' ? '#141829' : '#fff',
            boxShadow: '0 20px 60px rgba(13,16,32,.16)',
            overflow: 'hidden',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Dropdown header with gradient */}
        <Box
          sx={{
            p: '16px 16px 14px',
            background: mode === 'dark'
              ? 'linear-gradient(145deg, rgba(45,175,131,0.08), rgba(85,105,224,0.08))'
              : 'linear-gradient(145deg, #EDFBF7, #F0F3FF)',
            borderBottom: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(55,65,120,0.08)',
          }}
        >
          <Box sx={{ position: 'relative', width: 50, mb: '10px' }}>
            <Avatar
              src={userAvatarSrc || undefined}
              sx={{
                width: 50, height: 50, borderRadius: '14px',
                background: accent.gradient,
                fontSize: '16px', fontWeight: 700,
              }}
            >
              {userInitial}
            </Avatar>
            {/* Ring */}
            <Box sx={{ position: 'absolute', inset: -3, borderRadius: '17px', border: '2px solid #45C99A', opacity: 0.4, pointerEvents: 'none' }} />
            {/* Online indicator */}
            <Box sx={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', bgcolor: '#22C55E', border: `2px solid ${mode === 'dark' ? '#141829' : '#fff'}` }} />
          </Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'text.primary', mb: '2px', fontFamily: "'DM Sans', sans-serif" }}>{userName}</Typography>
          <Typography sx={{ fontSize: '11px', color: 'text.secondary', mb: '8px', fontFamily: "'DM Sans', sans-serif" }}>{activeProfile?.email || ''}</Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', px: '8px', py: '2.5px', borderRadius: '99px', bgcolor: mode === 'dark' ? 'rgba(45,175,131,0.14)' : '#D4F7EE', color: '#1A7A57', fontSize: '10px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            {roleLabel}
          </Box>
        </Box>

        {/* Menu items */}
        <Box sx={{ p: '6px' }}>
          {menuLinks.map((link) => {
            const LinkIcon = pathIconMap[link.path] || DashboardIcon;
            return (
              <MenuItem
                key={link.path}
                onClick={() => { navigate(link.path); handleMenuClose(); }}
                sx={{
                  borderRadius: '9px', px: '9px', py: '8px', gap: '9px',
                  fontSize: '12.5px', color: 'text.secondary', fontFamily: "'DM Sans', sans-serif",
                  '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F6F7FC', color: 'text.primary' },
                }}
              >
                <Box sx={{ width: 28, height: 28, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ECEEF7', flexShrink: 0, transition: 'background .14s', '&:hover': { bgcolor: '#EDFBF7' } }}>
                  <LinkIcon sx={{ fontSize: 13 }} />
                </Box>
                <Box sx={{ flex: 1 }}>{link.label}</Box>
                <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>›</Typography>
              </MenuItem>
            );
          })}
        </Box>

        <Divider sx={{ my: '3px', mx: '6px' }} />

        {/* Sign out */}
        <Box sx={{ p: '4px 6px 6px' }}>
          <MenuItem
            onClick={openSignoutModal}
            sx={{
              borderRadius: '9px', px: '9px', py: '8px', gap: '9px',
              fontSize: '12.5px', color: '#E84545', fontFamily: "'DM Sans', sans-serif",
              '&:hover': { bgcolor: 'rgba(232,69,69,0.08)' },
            }}
          >
            <Box sx={{ width: 28, height: 28, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(232,69,69,0.1)', flexShrink: 0 }}>
              <LogoutIcon sx={{ fontSize: 13 }} />
            </Box>
            Sign Out
          </MenuItem>
        </Box>

        {/* Footer: theme switcher */}
        <Box sx={{ borderTop: '1px solid', borderColor: mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(55,65,120,0.08)', bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F6F7FC', p: '8px 10px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '11.5px', color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>Appearance</Typography>
            <Box sx={{ display: 'flex', gap: '2px', bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(55,65,120,0.08)', borderRadius: '8px', p: '2px' }}>
              {[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }].map(({ value, label }) => (
                <Box
                  key={value}
                  component="button"
                  onClick={() => { if ((value === 'dark') !== (mode === 'dark')) handleThemeToggle(); }}
                  sx={{
                    px: '10px', py: '3px', borderRadius: '6px',
                    fontSize: '10.5px', fontWeight: 500, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    color: mode === value ? 'text.primary' : 'text.secondary',
                    bgcolor: mode === value ? (mode === 'dark' ? '#1A1F33' : '#fff') : 'transparent',
                    boxShadow: mode === value ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                    transition: 'all .15s',
                  }}
                >
                  {label}
                </Box>
              ))}
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
    </>
  );
};

export default Topbar;