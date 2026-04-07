import { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { DRAWER_WIDTH } from './layoutConfig';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((current) => !current);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          onMenuClick={handleDrawerToggle}
          isMobile={isMobile}
          showMobileMenuButton={false}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: 'var(--bg)',
            px: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 3, md: 4 },
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
          <Box
            sx={{
              width: '100%',
              maxWidth: isMobile ? '100%' : `calc(100vw - ${DRAWER_WIDTH}px)`,
              mx: 'auto',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>

      {isMobile && (
        <Box
          component="button"
          onClick={handleDrawerToggle}
          aria-label="Toggle navigation menu"
          sx={{
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            zIndex: 1300,
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--t700)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(22,122,87,0.38)',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform .18s cubic-bezier(.4,0,.2,1), box-shadow .18s cubic-bezier(.4,0,.2,1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(22,122,87,0.46)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </Box>
      )}
    </Box>
  );
};

export default Layout;