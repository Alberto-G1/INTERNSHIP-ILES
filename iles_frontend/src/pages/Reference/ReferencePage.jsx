import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReferenceSection from '../../components/Reference/ReferenceSection';
import AuthReferencePanel from '../../components/Reference/AuthReferencePanel';
import ToastReferencePanel from '../../components/Reference/ToastReferencePanel';
import ModalReferencePanel from '../../components/Reference/ModalReferencePanel';

const pillSx = {
  px: 1.25,
  py: 0.65,
  borderRadius: '999px',
  border: '1px solid var(--gray-200)',
  bgcolor: 'var(--panel-bg)',
  color: 'var(--gray-600)',
  fontSize: '11px',
  fontWeight: 600,
};

const ReferencePage = () => (
  <Box
    sx={{
      minHeight: '100vh',
      py: { xs: 3, md: 5 },
      background: 'radial-gradient(circle at top left, rgba(46,139,91,0.12), transparent 28%), linear-gradient(180deg, var(--bg) 0%, var(--surface) 100%)',
    }}
  >
    <Container maxWidth="xl">
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: { xs: '28px', md: '36px' },
          border: '1px solid var(--gray-200)',
          bgcolor: 'var(--panel-bg)',
          boxShadow: '0 24px 70px rgba(15,23,42,0.08)',
          p: { xs: 2.5, md: 4 },
          mb: 3,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 'auto -120px -120px auto',
            width: 280,
            height: 280,
            borderRadius: '50%',
            bgcolor: 'rgba(26,92,58,0.08)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        />
        <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Box sx={pillSx}>Live route</Box>
            <Box sx={pillSx}>Auth</Box>
            <Box sx={pillSx}>Toasts</Box>
            <Box sx={pillSx}>Modals</Box>
          </Stack>

          <Box>
            <Typography sx={{ fontSize: { xs: '30px', md: '44px' }, fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.05, color: 'var(--ink)' }}>
              AILES UI reference
            </Typography>
            <Typography sx={{ mt: 1.5, maxWidth: 820, fontSize: { xs: '15px', md: '16px' }, lineHeight: 1.8, color: 'var(--gray-600)' }}>
              The auth screens are already live at their own routes, and this page exposes the popup, toast, and modal system in one place using the same shared MUI/token styling as the app shell.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              disableElevation
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: 'var(--green-900)',
                '&:hover': { bgcolor: 'var(--green-700)' },
              }}
            >
              Open auth routes
            </Button>
            <Button
              component={RouterLink}
              to="/pops-and-messages"
              variant="outlined"
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'var(--gray-200)',
                color: 'var(--gray-700)',
                '&:hover': {
                  borderColor: 'var(--green-600)',
                  bgcolor: 'rgba(46,139,91,0.05)',
                },
              }}
            >
              Jump to this page
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={3}>
        <ReferenceSection
          eyebrow="Auth pages"
          title="Reusable auth shell, now as live routes"
          description="Login, registration, and password reset already sit on live routes and share the same shell, tokens, and form primitives. This section keeps them discoverable from a single reference page."
        >
          <AuthReferencePanel />
        </ReferenceSection>

        <ReferenceSection
          eyebrow="Toasts"
          title="Message system"
          description="Trigger the four toast variants used across the app. They are powered by the shared toast component and keep the same brand palette in light and dark mode."
        >
          <ToastReferencePanel />
        </ReferenceSection>

        <ReferenceSection
          eyebrow="Modals"
          title="Confirmation dialogs"
          description="The modal variants are built from the reusable confirm-dialog shell and mirror the layouts in the HTML reference, including destructive, approval, and reset flows."
        >
          <ModalReferencePanel />
        </ReferenceSection>
      </Stack>
    </Container>
  </Box>
);

export default ReferencePage;