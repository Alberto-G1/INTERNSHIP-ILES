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
  '/admin/audit-logs': { title: 'Audit Logs', subtitle: 'Trace user and system actions for governance and diagnostics' },
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
  { section: 'System', path: '/admin/audit-logs', label: 'Audit Logs', roles: ['admin'] },
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

export const ROLE_GRADIENTS = {
  student: 'linear-gradient(135deg, #C05500, #F08C30)',
  workplace_supervisor: 'linear-gradient(135deg, #2F3DAA, #5569E0)',
  academic_supervisor: 'linear-gradient(135deg, #6D28D9, #9C4AFF)',
  admin: 'linear-gradient(135deg, #1A7A57, #2DAF83)',
};

export const NAV_ICONS = {
  Dashboard: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  Logs: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  Evaluations: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  Interns: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
  Reports: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  Notifications: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>',
  Profile: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  Approvals: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  Settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  Placements: '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
  Staff: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
  'Audit Logs': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
};

export const getRoleGradient = (role) => ROLE_GRADIENTS[role] || ROLE_GRADIENTS.admin;

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
      { path: '/admin/audit-logs', label: 'Audit Logs' },
      { path: '/admin/approvals', label: 'Supervisor Approvals' },
      { path: '/settings', label: 'Settings' },
    ];
  }

  return baseLinks;
};