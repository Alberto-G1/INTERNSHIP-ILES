// frontend/src/components/Layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { DRAWER_WIDTH } from './layoutConfig';

const Layout = () => {
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
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;