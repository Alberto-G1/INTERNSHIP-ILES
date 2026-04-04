// frontend/src/components/Layout/layoutConfig.js

export const DRAWER_WIDTH = 240; // Increased slightly for better readability
export const COLLAPSED_DRAWER_WIDTH = 72; // For mobile collapsed state

export const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Good morning, Spring 2025 cohort' },
  '/logs': { title: 'Logs', subtitle: 'Weekly internship log entries' },
  '/placements': { title: 'Placements', subtitle: 'Placement coordination and tracking' },
  '/placements/supervisor-assignment': { title: 'Supervisor Assignment', subtitle: 'Assign and manage workplace supervisor for approved placement' },
  '/evaluations': { title: 'Evaluations', subtitle: 'Supervisor reviews and assessments' },
  '/interns': { title: 'Interns', subtitle: 'Cohort intern management' },
  '/reports': { title: 'Reports', subtitle: 'Cohort analytics and insights' },
  '/notifications': { title: 'Notifications', subtitle: 'System updates and alerts' },
  '/profile': { title: 'Profile', subtitle: 'Your personal information' },
  '/settings': { title: 'Settings', subtitle: 'System configuration' },
  '/admin/approvals': { title: 'Supervisor Approvals', subtitle: 'Review and approve supervisor accounts' },
  '/admin/staff': { title: 'Staff Management', subtitle: 'Manage students and staff members' },
};

export const NAVIGATION = [
  { section: 'Overview', path: '/dashboard', label: 'Dashboard', roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'Overview', path: '/logs', label: 'Logs', roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'Overview', path: '/evaluations', label: 'Evaluations', roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'Management', path: '/placements', label: 'Placements', roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'Management', path: '/placements/supervisor-assignment', label: 'Supervisor Assignment', roles: ['student'] },
  { section: 'Management', path: '/interns', label: 'Interns', roles: ['workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'Management', path: '/reports', label: 'Reports', roles: ['admin'] },
  { section: 'Management', path: '/notifications', label: 'Notifications', roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'System', path: '/profile', label: 'Profile', roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'System', path: '/admin/approvals', label: 'Approvals', roles: ['admin'] },
  { section: 'System', path: '/admin/staff', label: 'Staff', roles: ['admin'] },
  { section: 'System', path: '/settings', label: 'Settings', roles: ['admin'] },
];

export const ROLE_LABELS = {
  student: 'Student Intern',
  workplace_supervisor: 'Workplace Supervisor',
  academic_supervisor: 'Academic Supervisor',
  admin: 'Administrator',
};

export const ROLE_COLORS = {
  student: '#2E8B5B',
  workplace_supervisor: '#F59E0B',
  academic_supervisor: '#5B82A6',
  admin: '#C0392B',
};

export const getRoleLabel = (role) => ROLE_LABELS[role] || role || 'User';

export const getRoleColor = (role) => ROLE_COLORS[role] || '#4B5563';

export const getUserMenuLinks = (role) => {
  const baseLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'My Profile' },
    { path: '/notifications', label: 'Notifications' },
  ];

  if (role === 'admin') {
    return [
      ...baseLinks,
      { path: '/admin/approvals', label: 'Supervisor Approvals' },
      { path: '/settings', label: 'Settings' },
    ];
  }

  return baseLinks;
};