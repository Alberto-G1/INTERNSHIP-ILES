// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext';

// Layout Components
import Layout from './components/Layout/Layout';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';

// Student Pages
import StudentDashboard from './pages/Student/Dashboard/StudentDashboard';
import StudentProfileDisplayPage from './pages/Student/Profile/StudentProfileDisplayPage';
import StudentProfileEditPage from './pages/Student/Profile/StudentProfileEditPage';
import StudentLogsPage from './pages/Student/Logs/StudentLogsPage';
import StudentPlacementsPage from './pages/Student/Placements/StudentPlacementsPage';

// Workplace Supervisor Pages
import WorkplaceSupervisorDashboard from './pages/WorkplaceSupervisor/Dashboard/WorkplaceSupervisorDashboard';
import WorkplaceSupervisorProfileDisplayPage from './pages/WorkplaceSupervisor/Profile/WorkplaceSupervisorProfileDisplayPage';
import WorkplaceSupervisorProfileEditPage from './pages/WorkplaceSupervisor/Profile/WorkplaceSupervisorProfileEditPage';
import WorkplaceSupervisorLogsPage from './pages/WorkplaceSupervisor/Logs/WorkplaceSupervisorLogsPage';
import WorkplaceSupervisorPlacementsPage from './pages/WorkplaceSupervisor/Placements/WorkplaceSupervisorPlacementsPage';

// Academic Supervisor Pages
import AcademicSupervisorDashboard from './pages/AcademicSupervisor/Dashboard/AcademicSupervisorDashboard';
import AcademicSupervisorProfileDisplayPage from './pages/AcademicSupervisor/Profile/AcademicSupervisorProfileDisplayPage';
import AcademicSupervisorProfileEditPage from './pages/AcademicSupervisor/Profile/AcademicSupervisorProfileEditPage';
import AcademicSupervisorLogsPage from './pages/AcademicSupervisor/Logs/AcademicSupervisorLogsPage';
import AcademicSupervisorPlacementsPage from './pages/AcademicSupervisor/Placements/AcademicSupervisorPlacementsPage';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import AdminProfileDisplayPage from './pages/Admin/Profile/AdminProfileDisplayPage';
import AdminProfileEditPage from './pages/Admin/Profile/AdminProfileEditPage';
import AdminLogsPage from './pages/Admin/LogsPage';
import AdminPlacementsPage from './pages/Admin/Placements/AdminPlacementsPage';
import AdminApprovalsPage from './pages/Admin/Approvals/AdminApprovalsPage';

// Shared Feature Pages
import EvaluationsPage from './pages/Evaluations/EvaluationsPage';
import InternsPage from './pages/Interns/InternsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';

const queryClient = new QueryClient();

const buildTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#1A5C3A',
      light: '#2E8B5B',
      dark: '#0E3A24',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FBB040',
      dark: '#B45309',
    },
    error: {
      main: '#C0392B',
    },
    background: mode === 'dark'
      ? {
          default: '#0D1117',
          paper: '#161F2E',
        }
      : {
          default: '#F9FAFB',
          paper: '#FFFFFF',
        },
    text: mode === 'dark'
      ? {
          primary: '#F1F5F9',
          secondary: '#CBD5E1',
        }
      : {
          primary: '#111827',
          secondary: '#4B5563',
        },
  },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.3px',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Poppins, Segoe UI, sans-serif',
          backgroundColor: mode === 'dark' ? 'var(--surface)' : '#F9FAFB',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${mode === 'dark' ? '#1E293B' : '#E5E7EB'}`,
          borderRadius: 14,
          boxShadow: mode === 'dark'
            ? '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.25)'
            : '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: mode === 'dark' ? 'var(--white)' : '#FFFFFF',
        },
      },
    },
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
    '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
    // ... rest of shadows
  ],
});

const AppShell = () => {
  const { mode } = useThemeMode();
  const theme = buildTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        gutter={14}
        toastOptions={{
          duration: 4600,
          style: {
            fontFamily: '"Poppins", sans-serif',
            borderRadius: '14px',
          },
        }}
      />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<DashboardRouter />} />
              <Route path="profile" element={<ProfileDisplayRouter />} />
              <Route path="profile/edit" element={<ProfileEditRouter />} />
              <Route path="logs" element={<LogsRouter />} />
              <Route path="placements" element={<PlacementsRouter />} />
              <Route path="evaluations" element={<EvaluationsPage />} />
              <Route path="interns" element={<InternsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin/approvals" element={<AdminApprovalsRoute />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <AppShell />
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}


// Role-based Dashboard Router
const DashboardRouter = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'student':
      return <StudentDashboard />;
    case 'workplace_supervisor':
      return <WorkplaceSupervisorDashboard />;
    case 'academic_supervisor':
      return <AcademicSupervisorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

// Role-based Profile Display Router
const ProfileDisplayRouter = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'student':
      return <StudentProfileDisplayPage />;
    case 'workplace_supervisor':
      return <WorkplaceSupervisorProfileDisplayPage />;
    case 'academic_supervisor':
      return <AcademicSupervisorProfileDisplayPage />;
    case 'admin':
      return <AdminProfileDisplayPage />;
    default:
      return <Navigate to="/login" />;
  }
};

// Role-based Profile Edit Router
const ProfileEditRouter = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'student':
      return <StudentProfileEditPage />;
    case 'workplace_supervisor':
      return <WorkplaceSupervisorProfileEditPage />;
    case 'academic_supervisor':
      return <AcademicSupervisorProfileEditPage />;
    case 'admin':
      return <AdminProfileEditPage />;
    default:
      return <Navigate to="/login" />;
  }
};

const LogsRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'student':
      return <StudentLogsPage />;
    case 'workplace_supervisor':
      return <WorkplaceSupervisorLogsPage />;
    case 'academic_supervisor':
      return <AcademicSupervisorLogsPage />;
    case 'admin':
      return <AdminLogsPage />;
    default:
      return <Navigate to="/login" />;
  }
};

const PlacementsRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'student':
      return <StudentPlacementsPage />;
    case 'workplace_supervisor':
      return <WorkplaceSupervisorPlacementsPage />;
    case 'academic_supervisor':
      return <AcademicSupervisorPlacementsPage />;
    case 'admin':
      return <AdminPlacementsPage />;
    default:
      return <Navigate to="/login" />;
  }
};

const AdminApprovalsRoute = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <AdminApprovalsPage />;
};

export default App;