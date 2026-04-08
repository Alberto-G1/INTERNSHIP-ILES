// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext';
import ailesMuiTheme from './theme';

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
import WorkplaceSupervisorAssignmentPage from './pages/Student/Placements/WorkplaceSupervisorAssignmentPage';

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
import AdminAuditLogsPage from './pages/Admin/AuditLogsPage';
import AdminPlacementsPage from './pages/Admin/Placements/AdminPlacementsPage';
import AdminApprovalsPage from './pages/Admin/Approvals/AdminApprovalsPage';
import AdminStaffManagementPage from './pages/Admin/UserManagement/AdminStaffManagementPage';

// Shared Feature Pages
import EvaluationsPage from './pages/Evaluations/EvaluationsPage';
import InternsPage from './pages/Interns/InternsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import ReferencePage from './pages/Reference/ReferencePage';

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';

/* ── React Query client ── */
const queryClient = new QueryClient();

/* ══════════════════════════════════════
   APP SHELL
   Reads the current theme mode from
   context and passes the right variant
   of ailesMuiTheme to MUI ThemeProvider.
══════════════════════════════════════ */
const AppShell = () => {
  const { mode } = useThemeMode();

  /*
   * ailesMuiTheme is a function that accepts 'light' | 'dark'
   * and returns the correctly configured MUI theme object.
   * This keeps dark-mode palette switching working exactly
   * as before, but now through our unified theme file.
   */
  const theme = ailesMuiTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/*
       * react-hot-toast Toaster — minimal config here because
       * AppToast.jsx renders fully custom cards via toast.custom().
       * The style override below is a safety net for any plain
       * toast() calls that don't use our custom card.
       */}
      <Toaster
        position="top-right"
        gutter={12}
        containerStyle={{ top: 24, right: 24 }}
        toastOptions={{
          duration: 4600,
          style: {
            fontFamily: "'Poppins', sans-serif",
            borderRadius: '14px',
            background: 'var(--panel-bg)',
            color: 'var(--ink)',
            border: '1px solid var(--gray-200)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: 0,           // AppToastCard handles its own padding
          },
        }}
      />

      <Router>
        <AuthProvider>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reference"       element={<ReferencePage />} />
            <Route path="/pops-and-messages" element={<ReferencePage />} />

            {/* ── Protected routes (inside Layout shell) ── */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard"   element={<DashboardRouter />} />
              <Route path="profile"     element={<ProfileDisplayRouter />} />
              <Route path="profile/edit" element={<ProfileEditRouter />} />
              <Route path="logs"        element={<LogsRouter />} />
              <Route path="placements"  element={<PlacementsRouter />} />
              <Route path="placements/supervisor-assignment" element={<WorkplaceSupervisorAssignmentPage />} />
              <Route path="placements/:placementId/supervisor" element={<WorkplaceSupervisorAssignmentPage />} />
              <Route path="evaluations"   element={<EvaluationsPage />} />
              <Route path="interns"       element={<InternsPage />} />
              <Route path="reports"       element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings"      element={<SettingsPage />} />
              <Route path="admin/audit-logs" element={<AdminAuditLogsRoute />} />
              <Route path="admin/approvals"  element={<AdminApprovalsRoute />} />
              <Route path="admin/staff"      element={<AdminStaffRoute />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

/* ══════════════════════════════════════
   ROOT APP
══════════════════════════════════════ */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <AppShell />
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

/* ══════════════════════════════════════
   ROLE-BASED ROUTERS
   All original switch logic preserved.
══════════════════════════════════════ */

const DashboardRouter = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'student':              return <StudentDashboard />;
    case 'workplace_supervisor': return <WorkplaceSupervisorDashboard />;
    case 'academic_supervisor':  return <AcademicSupervisorDashboard />;
    case 'admin':                return <AdminDashboard />;
    default:                     return <Navigate to="/login" />;
  }
};

const ProfileDisplayRouter = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'student':              return <StudentProfileDisplayPage />;
    case 'workplace_supervisor': return <WorkplaceSupervisorProfileDisplayPage />;
    case 'academic_supervisor':  return <AcademicSupervisorProfileDisplayPage />;
    case 'admin':                return <AdminProfileDisplayPage />;
    default:                     return <Navigate to="/login" />;
  }
};

const ProfileEditRouter = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'student':              return <StudentProfileEditPage />;
    case 'workplace_supervisor': return <WorkplaceSupervisorProfileEditPage />;
    case 'academic_supervisor':  return <AcademicSupervisorProfileEditPage />;
    case 'admin':                return <AdminProfileEditPage />;
    default:                     return <Navigate to="/login" />;
  }
};

const LogsRouter = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'student':              return <StudentLogsPage />;
    case 'workplace_supervisor': return <WorkplaceSupervisorLogsPage />;
    case 'academic_supervisor':  return <AcademicSupervisorLogsPage />;
    case 'admin':                return <AdminLogsPage />;
    default:                     return <Navigate to="/login" />;
  }
};

const PlacementsRouter = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'student':              return <StudentPlacementsPage />;
    case 'workplace_supervisor': return <WorkplaceSupervisorPlacementsPage />;
    case 'academic_supervisor':  return <AcademicSupervisorPlacementsPage />;
    case 'admin':                return <AdminPlacementsPage />;
    default:                     return <Navigate to="/login" />;
  }
};

const AdminApprovalsRoute = () => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return <AdminApprovalsPage />;
};

const AdminStaffRoute = () => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return <AdminStaffManagementPage />;
};

const AdminAuditLogsRoute = () => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return <AdminAuditLogsPage />;
};

export default App;