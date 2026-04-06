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
  Chip,
  Avatar,
  IconButton,
  useTheme,
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
  FiberManualRecord as DotIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import {
  DRAWER_WIDTH,
  NAVIGATION,
  NAV_ICONS,
  getRoleColor,
  getRoleLabel,
  getRoleGradient,
} from './layoutConfig';
import AppConfirmModal from '../Common/AppConfirmModal';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { placementsAPI } from '../../services/api';

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

  return {
    ...item,
    icon: iconMap[item.label] || DashboardIcon,
  };
});

const Sidebar = ({ mobileOpen, onDrawerToggle, isMobile, profile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const activeProfile = profile || user || {};
  const [pendingReviews] = useState(3);
  const [unreadNotifications] = useState(5);
  const [signoutModalOpen, setSignoutModalOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [hasApprovedPlacement, setHasApprovedPlacement] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const loadApprovedPlacementStatus = async () => {
      if (activeProfile?.role !== 'student') {
        setHasApprovedPlacement(false);
        return;
      }

      try {
        const response = await placementsAPI.getMyPlacements();
        const placements = response.data || [];
        const hasApproved = placements.some((p) => p.approval_status === 'approved');
        setHasApprovedPlacement(hasApproved);
      } catch {
        setHasApprovedPlacement(false);
      }
    };

    loadApprovedPlacementStatus();
  }, [activeProfile?.role]);

  const filteredNav = navigation.filter((item) => {
    if (!item.roles.includes(activeProfile?.role || 'student')) {
      return false;
    }
    if (item.path === '/placements/supervisor-assignment') {
      return hasApprovedPlacement;
    }
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
  const roleGradient = getRoleGradient(activeProfile?.role);

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'var(--sb-bg, #080B18)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(ellipse 200px 200px at 20% 10%, rgba(45,175,131,0.09) 0%, transparent 70%),
            radial-gradient(ellipse 180px 180px at 80% 70%, rgba(85,105,224,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 150px 150px at 50% 40%, rgba(240,140,48,0.04) 0%, transparent 70%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with logo */}
        <Box
          sx={{
            p: '20px 18px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                background: `linear-gradient(145deg, var(--t600, #22916A), var(--t400, #45C99A))`,
                borderRadius: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(45,175,131,0.35)',
              }}
            >
              <svg viewBox="0 0 24 24" width={20} height={20} stroke="#fff" fill="none" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
                AILES
              </Typography>
              <Typography sx={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.28)', letterSpacing: '1.4px', textTransform: 'uppercase', mt: '2.5px' }}>
                Internship System
              </Typography>
            </Box>
          </Box>
          {isMobile && (
            <IconButton onClick={onDrawerToggle} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>

        {/* Role pill */}
        <Box
          sx={{
            m: '12px 14px',
            p: '9px 12px',
            borderRadius: '11px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            cursor: 'pointer',
            transition: 'background .2s',
            '&:hover': { background: 'rgba(255,255,255,0.09)' },
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getRoleColor(activeProfile?.role), flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getRoleLabel(activeProfile?.role)}
            </Typography>
            <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.30)', mt: '1px' }}>
              {userName}
            </Typography>
          </Box>
          <Box sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>⇅</Box>
        </Box>

        {/* Navigation */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: '10px', py: '6px' }}>
          {groupedNav.map(({ section, items }, sectionIdx) =>
            items.length > 0 ? (
              <Box key={section} sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '1.8px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.18)',
                    px: '10px',
                    py: '12px 10px 4px',
                  }}
                >
                  {section}
                </Typography>

                <List disablePadding>
                  {items.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    const isHovered = hoveredPath === item.path;
                    const badge =
                      item.label === 'Evaluations' && pendingReviews > 0
                        ? pendingReviews
                        : item.label === 'Notifications' && unreadNotifications > 0
                        ? unreadNotifications
                        : null;

                    return (
                      <ListItem key={item.path} disablePadding sx={{ mb: '1px' }}>
                        <ListItemButton
                          onClick={() => {
                            navigate(item.path);
                            if (isMobile) onDrawerToggle();
                          }}
                          onMouseEnter={() => setHoveredPath(item.path)}
                          onMouseLeave={() => setHoveredPath(null)}
                          sx={{
                            py: '8px',
                            px: '10px',
                            borderRadius: '9px',
                            position: 'relative',
                            overflow: 'hidden',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                            transition: 'all 0.18s ease',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(49,108,96,0.8)',
                              opacity: isHovered && !isActive ? 0.6 : isActive ? 0.14 : 0,
                              borderRadius: '9px',
                              transition: 'opacity 0.18s',
                            },
                            '&::after': isActive ? {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '20%',
                              height: '60%',
                              width: '3px',
                              background: 'var(--t400, #45C99A)',
                              borderRadius: '0 3px 3px 0',
                            } : {},
                            '&:hover': {
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 28,
                              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                              transition: 'color 0.18s ease',
                            }}
                          >
                            <Icon sx={{ fontSize: 17 }} />
                          </ListItemIcon>

                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: '12.5px',
                              fontWeight: isActive ? 500 : 400,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          />

                          {badge && (
                            <Chip
                              label={badge}
                              size="small"
                              sx={{
                                height: 18,
                                minWidth: 18,
                                fontSize: '9.5px',
                                fontWeight: 700,
                                bgcolor: '#D96B0E',
                                color: '#fff',
                                '& .MuiChip-label': { px: '5px' },
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
          )}
        </Box>

        {/* User Footer */}
        <Box sx={{ p: '10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                navigate('/profile');
                if (isMobile) onDrawerToggle();
              }}
              sx={{
                borderRadius: '10px',
                py: '8px',
                px: '10px',
                transition: 'background .18s',
                '&:hover': { background: 'rgba(49,108,96,0.8)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <Avatar
                  src={userAvatarSrc || undefined}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '9px',
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
                      border: '2px solid var(--sb-bg, #080B18)',
                    }}
                  />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={userName}
                secondary={getRoleLabel(activeProfile?.role)}
                primaryTypographyProps={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#fff',
                  noWrap: true,
                }}
                secondaryTypographyProps={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.3)',
                  noWrap: true,
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setSignoutModalOpen(true)}
              sx={{
                borderRadius: '10px',
                py: '8px',
                px: '10px',
                transition: 'background .18s',
                '&:hover': {
                  background: 'rgba(232,69,69,0.15)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <LogoutIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: '12.5px',
                  color: 'rgba(255,255,255,0.5)',
                }}
              />
            </ListItemButton>
          </ListItem>
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
          borderRight: '1px solid rgba(255,255,255,0.07)',
          bgcolor: '#080B18',
          overflow: 'hidden',
          ...(isMobile && {
            backgroundImage: 'none',
            boxShadow: theme.shadows[8],
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;