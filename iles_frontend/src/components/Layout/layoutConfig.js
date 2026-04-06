// frontend/src/components/Layout/layoutConfig.js
// Design tokens and navigation config — matches AILES design system (styles_base.txt)

export const DRAWER_WIDTH = 264; // --sb-w: 264px from design tokens
export const COLLAPSED_DRAWER_WIDTH = 72;

export const PAGE_TITLES = {
  '/dashboard':                          { title: 'Dashboard',            subtitle: 'Good morning, Spring 2025 cohort' },
  '/logs':                               { title: 'Logs',                 subtitle: 'Weekly internship log entries' },
  '/placements':                         { title: 'Placements',           subtitle: 'Placement coordination and tracking' },
  '/placements/supervisor-assignment':   { title: 'Supervisor Assignment', subtitle: 'Assign and manage workplace supervisor for approved placement' },
  '/evaluations':                        { title: 'Evaluations',          subtitle: 'Supervisor reviews and assessments' },
  '/interns':                            { title: 'Interns',              subtitle: 'Cohort intern management' },
  '/reports':                            { title: 'Reports',              subtitle: 'Cohort analytics and insights' },
  '/notifications':                      { title: 'Notifications',        subtitle: 'System updates and alerts' },
  '/profile':                            { title: 'Profile',              subtitle: 'Your personal information' },
  '/settings':                           { title: 'Settings',             subtitle: 'System configuration' },
  '/admin/audit-logs':                   { title: 'Audit Logs',           subtitle: 'Trace user and system actions for governance and diagnostics' },
  '/admin/approvals':                    { title: 'Supervisor Approvals', subtitle: 'Review and approve supervisor accounts' },
  '/admin/staff':                        { title: 'Staff Management',     subtitle: 'Manage students and staff members' },
};

export const NAVIGATION = [
  { section: 'Overview',    path: '/dashboard',                        label: 'Dashboard',            roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'Overview',    path: '/logs',                             label: 'Logs',                 roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'Overview',    path: '/evaluations',                      label: 'Evaluations',          roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'Management',  path: '/placements',                       label: 'Placements',           roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'Management',  path: '/placements/supervisor-assignment', label: 'Supervisor Assignment',roles: ['student'] },
  { section: 'Management',  path: '/interns',                          label: 'Interns',              roles: ['workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'Management',  path: '/reports',                          label: 'Reports',              roles: ['admin'] },
  { section: 'Management',  path: '/notifications',                    label: 'Notifications',        roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'System',      path: '/profile',                          label: 'Profile',              roles: ['student', 'workplace_supervisor', 'academic_supervisor', 'admin'] },
  { section: 'System',      path: '/admin/audit-logs',                 label: 'Audit Logs',           roles: ['admin'] },
  { section: 'System',      path: '/admin/approvals',                  label: 'Approvals',            roles: ['admin'] },
  { section: 'System',      path: '/admin/staff',                      label: 'Staff',                roles: ['admin'] },
  { section: 'System',      path: '/settings',                         label: 'Settings',             roles: ['admin'] },
];

/* ─── Role display labels ──────────────────────────────────────── */
export const ROLE_LABELS = {
  student:              'Student Intern',
  workplace_supervisor: 'Workplace Supervisor',
  academic_supervisor:  'Academic Supervisor',
  admin:                'Administrator',
};

/* ─── Role accent colours — triadic palette from styles_base ─────
   admin     → teal  (#45C99A dot)
   workplace → indigo (#7389EA dot)
   academic  → violet (#A855F7 dot)
   student   → amber  (#F08C30 dot)
────────────────────────────────────────────────────────────────── */
export const ROLE_COLORS = {
  student:              '#F08C30',
  workplace_supervisor: '#7389EA',
  academic_supervisor:  '#A855F7',
  admin:                '#45C99A',
};

/* ─── Role gradient (for avatars) ─────────────────────────────── */
export const ROLE_GRADIENTS = {
  student:              'linear-gradient(135deg, #C05500, #F08C30)',
  workplace_supervisor: 'linear-gradient(135deg, #2F3DAA, #5569E0)',
  academic_supervisor:  'linear-gradient(135deg, #6D28D9, #9C4AFF)',
  admin:                'linear-gradient(135deg, #1A7A57, #2DAF83)',
};

export const getRoleLabel    = (role) => ROLE_LABELS[role]    || role || 'User';
export const getRoleColor    = (role) => ROLE_COLORS[role]    || '#8A90B4';
export const getRoleGradient = (role) => ROLE_GRADIENTS[role] || 'linear-gradient(135deg, #3D4466, #8A90B4)';

export const getUserMenuLinks = (role) => {
  const baseLinks = [
    { path: '/dashboard',     label: 'Dashboard'     },
    { path: '/profile',       label: 'My Profile'    },
    { path: '/notifications', label: 'Notifications' },
  ];

  if (role === 'admin') {
    return [
      ...baseLinks,
      { path: '/admin/audit-logs', label: 'Audit Logs'           },
      { path: '/admin/approvals',  label: 'Supervisor Approvals' },
      { path: '/settings',         label: 'Settings'             },
    ];
  }

  return baseLinks;
};