import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const authRoutes = [
  {
    title: 'Sign In',
    path: '/login',
    description: 'The main entry point for returning users. Uses the shared AuthShell and themed inputs.',
    chips: ['AuthShell', 'Theme-aware fields', 'Toast feedback'],
  },
  {
    title: 'Sign Up',
    path: '/register',
    description: 'Role-based registration with the same shell, shared validation patterns, and responsive layout.',
    chips: ['Role picker', 'Password strength', 'Responsive form'],
  },
  {
    title: 'Forgot Password',
    path: '/forgot-password',
    description: 'Multi-step password reset flow with OTP and success states in the same visual system.',
    chips: ['OTP flow', 'Step states', 'Shared layout tokens'],
  },
];

const AuthReferencePanel = () => (
  <Box
    sx={{
      display: 'grid',
      gap: 2,
      gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
    }}
  >
    {authRoutes.map((route) => (
      <Card
        key={route.path}
        elevation={0}
        sx={{
          height: '100%',
          borderRadius: '22px',
          border: '1px solid var(--gray-200)',
          bgcolor: 'var(--gray-50)',
          boxShadow: 'none',
        }}
      >
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
            {route.title}
          </Typography>
          <Typography sx={{ mt: 1, fontSize: '14px', lineHeight: 1.7, color: 'var(--gray-600)', flex: 1 }}>
            {route.description}
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
            {route.chips.map((chip) => (
              <Box
                key={chip}
                sx={{
                  px: 1.1,
                  py: 0.6,
                  borderRadius: '999px',
                  bgcolor: 'var(--green-50)',
                  color: 'var(--green-700)',
                  border: '1px solid rgba(46,139,91,0.12)',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {chip}
              </Box>
            ))}
          </Stack>

          <Button
            component={RouterLink}
            to={route.path}
            variant="contained"
            disableElevation
            sx={{
              mt: 2.4,
              alignSelf: 'flex-start',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.2,
              py: 1.1,
              bgcolor: 'var(--green-900)',
              boxShadow: '0 10px 20px rgba(26,92,58,0.18)',
              '&:hover': { bgcolor: 'var(--green-700)' },
            }}
          >
            Open live page
          </Button>
        </CardContent>
      </Card>
    ))}
  </Box>
);

export default AuthReferencePanel;