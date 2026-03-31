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
  BusinessCenter as PlacementsIcon,
  Logout as LogoutIcon,
  FiberManualRecord as DotIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import {
  DRAWER_WIDTH,
  COLLAPSED_DRAWER_WIDTH,
  NAVIGATION,
  getRoleColor,
  getRoleLabel,
} from './layoutConfig';
import AppConfirmModal from '../Common/AppConfirmModal';

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
  };

  return {
    ...item,
    icon: iconMap[item.label] || DashboardIcon,
  };
});

const STYLES = `
  @keyframes sidebarFadeIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes badgePulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.15); }
  }
  @keyframes activeGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(46,139,91,0.18); }
    50%       { box-shadow: 0 0 0 4px rgba(46,139,91,0.10); }
  }
  @keyframes logoPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(46,139,91,0.35); }
    60%       { box-shadow: 0 0 0 6px rgba(46,139,91,0); }
  }
  @keyframes avatarRing {
    0%, 100% { box-shadow: 0 0 0 0 rgba(46,139,91,0.4); }
    60%       { box-shadow: 0 0 0 5px rgba(46,139,91,0); }
  }
`;

const Sidebar = ({ mobileOpen, onDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [pendingReviews] = useState(3);
  const [unreadNotifications] = useState(5);
  const [signoutModalOpen, setSignoutModalOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!document.getElementById('sidebar-keyframes')) {
      const tag = document.createElement('style');
      tag.id = 'sidebar-keyframes';
      tag.textContent = STYLES;
      document.head.appendChild(tag);
    }
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const filteredNav = navigation.filter(item =>
    item.roles.includes(user?.role || 'student')
  );

  const groupedNav = ['Overview', 'Management', 'System'].map((section) => ({
    section,
    items: filteredNav.filter((item) => item.section === section),
  }));

  const handleLogout = async () => {
    setSignoutModalOpen(false);
    await logout();
    navigate('/login');
  };

  const userInitial = user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U';
  const userName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username;

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header with close button for mobile */}
      <Box
        sx={{
          p: '18px 20px 16px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, var(--green-600) 0%, var(--green-900) 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 15,
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: '-0.5px',
              flexShrink: 0,
              animation: 'logoPulse 3s ease-in-out infinite',
              cursor: 'default',
              userSelect: 'none',
            }}
          >
            A
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '15px',
                lineHeight: 1.1,
                letterSpacing: '0.5px',
                color: 'text.primary',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              AILES
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
              <DotIcon sx={{ fontSize: 6, color: 'var(--green-400)' }} />
              <Typography sx={{ color: 'text.secondary', fontSize: '10px', letterSpacing: '0.6px' }}>
                v2.4.0
              </Typography>
            </Box>
          </Box>
        </Box>
        {isMobile && (
          <IconButton onClick={onDrawerToggle} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 1.5, overflowY: 'auto', overflowX: 'hidden' }}>
        {groupedNav.map(({ section, items }, sectionIdx) =>
          items.length > 0 ? (
            <Box
              key={section}
              sx={{
                px: 1.5,
                pt: 0.6,
                pb: 1.2,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                transition: `opacity 0.35s ease ${0.1 + sectionIdx * 0.06}s, transform 0.35s ease ${0.1 + sectionIdx * 0.06}s`,
              }}
            >
              <Typography
                sx={{
                  px: 1,
                  pb: 0.6,
                  fontSize: '9.5px',
                  color: 'text.secondary',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
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
                    <ListItem
                      key={item.path}
                      disablePadding
                      sx={{
                        mb: 0.4,
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateX(0)' : 'translateX(-8px)',
                        transition: `opacity 0.3s ease ${0.15 + sectionIdx * 0.06 + itemIdx * 0.04}s, transform 0.3s ease ${0.15 + sectionIdx * 0.06 + itemIdx * 0.04}s`,
                      }}
                    >
                      <ListItemButton
                        onClick={() => {
                          navigate(item.path);
                          if (isMobile) onDrawerToggle();
                        }}
                        onMouseEnter={() => setHoveredPath(item.path)}
                        onMouseLeave={() => setHoveredPath(null)}
                        sx={{
                          py: 0.85,
                          px: 1.1,
                          borderRadius: '8px',
                          position: 'relative',
                          overflow: 'hidden',
                          bgcolor: isActive
                            ? 'action.selected'
                            : isHovered
                            ? 'action.hover'
                            : 'transparent',
                          animation: isActive ? 'activeGlow 3s ease-in-out infinite' : 'none',
                          transition: 'background-color 0.18s ease, box-shadow 0.18s ease',
                          '&::before': isActive
                            ? {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '20%',
                                height: '60%',
                                width: '3px',
                                borderRadius: '0 3px 3px 0',
                                bgcolor: 'var(--green-600)',
                                transition: 'height 0.2s ease',
                              }
                            : {},
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 28,
                            color: isActive ? 'var(--green-700)' : isHovered ? 'var(--green-600)' : 'text.secondary',
                            transition: 'color 0.18s ease, transform 0.18s ease',
                            transform: isHovered && !isActive ? 'scale(1.1)' : 'scale(1)',
                          }}
                        >
                          <Icon sx={{ fontSize: 17 }} />
                        </ListItemIcon>

                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: '13px',
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? 'var(--green-900)' : isHovered ? 'text.primary' : 'text.secondary',
                            fontFamily: "'Poppins', sans-serif",
                            transition: 'color 0.18s ease, font-weight 0.18s ease',
                          }}
                        />

                        {badge && (
                          <Chip
                            label={badge}
                            size="small"
                            sx={{
                              height: 18,
                              minWidth: 18,
                              fontSize: '10px',
                              bgcolor: '#F59E0B',
                              color: '#fff',
                              fontWeight: 700,
                              fontFamily: "'Poppins', sans-serif",
                              animation: 'badgePulse 2s ease-in-out infinite',
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
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s',
        }}
      >
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => {
              navigate('/profile');
              if (isMobile) onDrawerToggle();
            }}
            sx={{
              borderRadius: '8px',
              py: 0.85,
              px: 1.1,
              transition: 'background-color 0.18s ease',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <Avatar
                className="sidebar-avatar"
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: getRoleColor(user?.role),
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif",
                  transition: 'transform 0.18s ease',
                  '&:hover': { transform: 'scale(1.08)' },
                }}
              >
                {userInitial}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={userName}
              secondary={getRoleLabel(user?.role)}
              primaryTypographyProps={{
                fontSize: '12.5px',
                fontWeight: 500,
                color: 'text.primary',
                fontFamily: "'Poppins', sans-serif",
                noWrap: true,
              }}
              secondaryTypographyProps={{
                fontSize: '10.5px',
                color: 'text.secondary',
                fontFamily: "'Poppins', sans-serif",
                noWrap: true,
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => setSignoutModalOpen(true)}
            sx={{
              borderRadius: '8px',
              py: 0.85,
              px: 1.1,
              transition: 'background-color 0.18s ease',
              '&:hover': {
                bgcolor: 'var(--coral-100)',
                '& .logout-icon': { transform: 'translateX(3px)' },
                '& .logout-text': { color: 'var(--coral-700)' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <LogoutIcon
                className="logout-icon"
                sx={{
                  fontSize: 16,
                  color: 'text.secondary',
                  transition: 'transform 0.2s ease, color 0.18s ease',
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '13px',
                color: 'text.secondary',
                fontFamily: "'Poppins', sans-serif",
                className: 'logout-text',
                sx: { transition: 'color 0.18s ease' },
              }}
            />
          </ListItemButton>
        </ListItem>
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
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
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