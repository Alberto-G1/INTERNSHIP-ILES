// frontend/src/components/Layout/Layout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { DRAWER_WIDTH } from './layoutConfig';
import { useEffect, useState } from 'react';

const Layout = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          ml: `${DRAWER_WIDTH}px`,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar />
        <Box
          component="main"
          sx={{
            px: { xs: 2, md: 3.5 },
            py: { xs: 2, md: 3 },
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(6px)' : 'translateY(0)',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;