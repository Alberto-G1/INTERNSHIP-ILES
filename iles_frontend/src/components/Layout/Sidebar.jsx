// frontend/src/components/Layout/Sidebar.jsx
import { useState, useEffect } from 'react';
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
  Avatar,
  IconButton,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as LogsIcon,
  Star as EvaluationsIcon,
  People as InternsIcon,
  BarChart as ReportsIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  HowToReg as ApprovalsIcon,
  Person as ProfileIcon,
  Person as PersonIcon,
  BusinessCenter as PlacementsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import {
  DRAWER_WIDTH,
  NAVIGATION,
  getRoleColor,
  getRoleLabel,
} from './layoutConfig';
import AppConfirmModal from '../Common/AppConfirmModal';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { placementsAPI } from '../../services/api';

/* ─── Design tokens from styles_base ───────────────────────────────── */
const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700&display=swap');

  @keyframes sidebarFadeIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes logoPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(45,175,131,0.35); }
    60%     { box-shadow: 0 0 0 7px rgba(45,175,131,0); }
  }
  @keyframes onlineDot {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.5; transform: scale(0.8); }
  }
  @keyframes itemSlide {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;

/* ─── Role accent colours (from META in styles_base) ───────────────── */
const ROLE_ACCENTS = {
  student:              { dot: '#F08C30', gradient: 'linear-gradient(135deg,#C05500,#F08C30)' },
  workplace_supervisor: { dot: '#7389EA', gradient: 'linear-gradient(135deg,#2F3DAA,#5569E0)' },
  academic_supervisor:  { dot: '#A855F7', gradient: 'linear-gradient(135deg,#6D28D9,#9C4AFF)' },
  admin:                { dot: '#45C99A', gradient: 'linear-gradient(135deg,#1A7A57,#2DAF83)' },
};

const navigation = NAVIGATION.map((item) => {
  const iconMap = {
    Dashboard: DashboardIcon,
    Logs: LogsIcon,
    Evaluations: EvaluationsIcon,
    Interns: InternsIcon,
    Reports: ReportsIcon,
    Notifications: NotificationsIcon,
    Profile: ProfileIcon,
    Approvals: ApprovalsIcon,
    Settings: SettingsIcon,
    Placements: PlacementsIcon,
    Staff: InternsIcon,
    'Audit Logs': LogsIcon,
    'Supervisor Assignment': PersonIcon,
  };
  return { ...item, icon: iconMap[item.label] || DashboardIcon };
});

const Sidebar = ({ mobileOpen, onDrawerToggle, isMobile, profile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const activeProfile = profile || user || {};
  const [signoutModalOpen, setSignoutModalOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [hasApprovedPlacement, setHasApprovedPlacement] = useState(false);

  useEffect(() => {
    if (!document.getElementById('sidebar-ailes-tokens')) {
      const tag = document.createElement('style');
      tag.id = 'sidebar-ailes-tokens';
      tag.textContent = TOKENS;
      document.head.appendChild(tag);
    }
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const loadPlacementStatus = async () => {
      if (activeProfile?.role !== 'student') { setHasApprovedPlacement(false); return; }
      try {
        const response = await placementsAPI.getMyPlacements();
        const placements = response.data || [];
        setHasApprovedPlacement(placements.some((p) => p.approval_status === 'approved'));
      } catch { setHasApprovedPlacement(false); }
    };
    loadPlacementStatus();
  }, [activeProfile?.role]);

  const filteredNav = navigation.filter((item) => {
    if (!item.roles.includes(activeProfile?.role || 'student')) return false;
    if (item.path === '/placements/supervisor-assignment') return hasApprovedPlacement;
    return true;
  });

  const groupedNav = ['Overview', 'Management', 'System'].map((section) => ({
    section,
    items: filteredNav.filter((item) => item.section === section),
  }));

  const handleLogout = async () => {
    setSignoutModalOpen(false);
    await logout();
    navigate('/login');
  };

  const userInitial = activeProfile?.first_name?.[0] || activeProfile?.username?.[0]?.toUpperCase() || 'U';
  const userName = activeProfile?.full_name
    || (activeProfile?.first_name
      ? `${activeProfile.first_name} ${activeProfile.last_name || ''}`.trim()
      : activeProfile?.username);
  const userAvatarSrc = resolveMediaUrl(activeProfile?.profile_picture);
  const role = activeProfile?.role || 'student';
  const accent = ROLE_ACCENTS[role] || ROLE_ACCENTS.student;

  /* ── Sidebar paper ────────────────────────────────────────────────── */
  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--sb-bg)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Mesh background — matching styles_base radial gradients */}
      <Box
        sx={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 200px 200px at 20% 10%, rgba(45,175,131,0.09) 0%, transparent 70%),
            radial-gradient(ellipse 180px 180px at 80% 70%, rgba(85,105,224,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 150px 150px at 50% 40%, rgba(240,140,48,0.04) 0%, transparent 70%)
          `,
        }}
      />

      {/* Everything sits above the mesh */}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── Logo header ──────────────────────────────────────────── */}
        <Box
          sx={{
            p: '20px 18px 16px',
            borderBottom: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Logo mark */}
            <Box
              sx={{
                width: 38, height: 38,
                background: 'linear-gradient(145deg, #22916A, #45C99A)',
                borderRadius: '11px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(45,175,131,0.35)',
                flexShrink: 0,
                animation: 'logoPulse 3s ease-in-out infinite',
                cursor: 'default',
                userSelect: 'none',
              }}
            >
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </Box>
            <Box sx={{ lineHeight: 1 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px', fontFamily: "'DM Sans', sans-serif" }}>
                AILES
              </Typography>
              <Typography sx={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.28)', letterSpacing: '1.4px', textTransform: 'uppercase', mt: '2.5px', fontFamily: "'DM Sans', sans-serif" }}>
                Internship System · v2.4
              </Typography>
            </Box>
          </Box>
          {isMobile && (
            <IconButton onClick={onDrawerToggle} size="small" sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>

        {/* ── Role pill ─────────────────────────────────────────────── */}
        <Box
          sx={{
            m: '12px 14px',
            p: '9px 12px',
            borderRadius: '11px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: '9px',
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accent.dot, flexShrink: 0, transition: 'background .3s' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'DM Sans', sans-serif" }}>
              {getRoleLabel(role)}
            </Typography>
            <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.30)', mt: '1px', fontFamily: "'DM Sans', sans-serif" }}>
              Active session
            </Typography>
          </Box>
        </Box>

        {/* ── Navigation ───────────────────────────────────────────── */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: '6px', px: '10px', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {groupedNav.map(({ section, items }, sectionIdx) =>
            items.length > 0 ? (
              <Box
                key={section}
                sx={{
                  mb: '2px',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                  transition: `opacity 0.35s ease ${0.1 + sectionIdx * 0.07}s, transform 0.35s ease ${0.1 + sectionIdx * 0.07}s`,
                }}
              >
                {/* Section label */}
                <Typography
                  sx={{
                    fontSize: '9px', fontWeight: 700,
                    letterSpacing: '1.8px', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.18)',
                    px: '10px', pt: '12px', pb: '4px',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {section}
                </Typography>

                <List disablePadding>
                  {items.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    const isHovered = hoveredPath === item.path;
                    const badge = item.label === 'Notifications' ? 5 : item.label === 'Approvals' ? 3 : null;

                    return (
                      <ListItem
                        key={item.path}
                        disablePadding
                        sx={{
                          mb: '1px',
                          opacity: mounted ? 1 : 0,
                          animation: mounted ? `itemSlide 0.3s ease ${0.15 + sectionIdx * 0.05 + itemIdx * 0.03}s both` : 'none',
                        }}
                      >
                        <ListItemButton
                          onClick={() => { navigate(item.path); if (isMobile) onDrawerToggle(); }}
                          onMouseEnter={() => setHoveredPath(item.path)}
                          onMouseLeave={() => setHoveredPath(null)}
                          sx={{
                            borderRadius: '9px',
                            py: '8px', px: '10px',
                            gap: '9px',
                            position: 'relative',
                            overflow: 'hidden',
                            color: isActive ? '#fff' : 'rgba(243,236,236,0.45)',
                            fontWeight: isActive ? 500 : 400,
                            transition: 'all .18s cubic-bezier(.4,0,.2,1)',
                            '&:hover': {
                              color: 'rgba(255,255,255,0.85)',
                              transform: 'translateX(2px)',
                              bgcolor: 'transparent',
                            },
                            /* Active left indicator */
                            '&::after': isActive ? {
                              content: '""',
                              position: 'absolute', left: 0, top: '20%', height: '60%',
                              width: '3px', background: '#45C99A',
                              borderRadius: '0 3px 3px 0',
                            } : {},
                            /* Hover/active bg overlay */
                            '&::before': {
                              content: '""',
                              position: 'absolute', inset: 0, borderRadius: '9px',
                              background: isActive ? 'rgba(45,175,131,0.14)' : (isHovered ? '#316c60' : 'transparent'),
                              opacity: isActive ? 1 : (isHovered ? 1 : 0),
                              transition: 'opacity .18s',
                            },
                          }}
                        >
                          {/* Icon box */}
                          <Box
                            sx={{
                              width: 28, height: 28, borderRadius: '7px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              bgcolor: isActive ? 'rgba(45,175,131,0.2)' : 'rgba(255,255,255,0.05)',
                              flexShrink: 0,
                              transition: 'background .18s',
                              position: 'relative', zIndex: 1,
                            }}
                          >
                            <Icon sx={{ fontSize: 13, color: 'currentColor' }} />
                          </Box>

                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: '12.5px',
                              fontWeight: isActive ? 500 : 400,
                              fontFamily: "'DM Sans', sans-serif",
                              noWrap: true,
                              sx: { position: 'relative', zIndex: 1 },
                            }}
                          />

                          {/* Badge */}
                          {badge && (
                            <Box
                              sx={{
                                fontSize: '9.5px', fontWeight: 700,
                                px: '6.5px', py: '1.5px', borderRadius: '99px',
                                minWidth: 18, textAlign: 'center', lineHeight: 1.6,
                                bgcolor: item.label === 'Notifications' ? '#D96B0E' : '#E84545',
                                color: '#fff',
                                flexShrink: 0, position: 'relative', zIndex: 1,
                              }}
                            >
                              {badge}
                            </Box>
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ) : null
          )}
        </Box>

        {/* ── User footer ───────────────────────────────────────────── */}
        <Box
          sx={{
            p: '10px',
            borderTop: '1px solid var(--sb-border)',
            flexShrink: 0,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s',
          }}
        >
          {/* Profile row */}
          <Box
            onClick={() => { navigate('/profile'); if (isMobile) onDrawerToggle(); }}
            sx={{
              display: 'flex', alignItems: 'center', gap: '9px',
              p: '8px 10px', borderRadius: '10px',
              cursor: 'pointer',
              transition: 'background .18s',
              '&:hover': { bgcolor: 'var(--sb-hover)' },
            }}
          >
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={userAvatarSrc || undefined}
                sx={{
                  width: 32, height: 32, borderRadius: '9px',
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
                bgcolor: '#22C55E', border: '2px solid var(--sb-bg)',
                animation: 'onlineDot 2s ease-in-out infinite',
              }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'DM Sans', sans-serif" }}>
                {userName}
              </Typography>
              <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif" }}>
                {getRoleLabel(role)}
              </Typography>
            </Box>
            {/* Settings cog */}
            <Box
              onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
              sx={{
                color: 'rgba(255,255,255,0.25)', p: '4px', borderRadius: '6px',
                transition: 'all .15s', cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' },
              }}
            >
              <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
            </Box>
          </Box>

          {/* Logout row */}
          <Box
            onClick={() => setSignoutModalOpen(true)}
            sx={{
              display: 'flex', alignItems: 'center', gap: '9px',
              p: '8px 10px', borderRadius: '9px',
              cursor: 'pointer', mt: '2px',
              color: 'var(--sb-tx)',
              transition: 'all .18s',
              '&:hover': { bgcolor: 'rgba(232,69,69,0.12)', color: 'var(--danger)' },
            }}
          >
            <Box sx={{ width: 28, height: 28, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
              <LogoutIcon sx={{ fontSize: 13 }} />
            </Box>
            <Typography sx={{ fontSize: '12.5px', fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>Sign Out</Typography>
          </Box>
        </Box>
      </Box>

      <AppConfirmModal
        open={signoutModalOpen}
        onClose={() => setSignoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out of AILES?"
        description="You are about to end this session on the current device."
        confirmLabel="Sign Out"
        cancelLabel="Stay Signed In"
        variant="signout"
        highlight={userName || ''}
      />
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? mobileOpen : true}
      onClose={onDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          bgcolor: 'transparent',
          overflow: 'hidden',
          ...(isMobile && { boxShadow: theme.shadows[8] }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;