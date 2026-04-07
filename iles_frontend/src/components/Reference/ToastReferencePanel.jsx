import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { notifyError, notifyInfo, notifySuccess, notifyWarning } from '../Common/AppToast';

const toastActions = [
  {
    label: 'Success toast',
    color: 'var(--green-700)',
    bg: 'var(--green-50)',
    border: 'rgba(46,139,91,0.18)',
    run: () => notifySuccess('The intern log was submitted successfully.', { title: 'Operation Successful', actionLabel: 'View Log' }),
  },
  {
    label: 'Error toast',
    color: 'var(--coral-700)',
    bg: 'var(--coral-50)',
    border: 'rgba(220,38,38,0.18)',
    run: () => notifyError('Unable to delete the record. Please try again.', { title: 'Action Failed', actionLabel: 'Retry' }),
  },
  {
    label: 'Info toast',
    color: 'var(--blue-700)',
    bg: 'var(--blue-50)',
    border: 'rgba(37,99,235,0.18)',
    run: () => notifyInfo('Week 4 evaluation is pending. Supervisor review is required.', { title: 'New Evaluation Due', actionLabel: 'Review Now' }),
  },
  {
    label: 'Warning toast',
    color: 'var(--amber-600)',
    bg: 'var(--amber-50)',
    border: 'rgba(245,158,11,0.18)',
    run: () => notifyWarning('Your session will expire in 5 minutes. Save your work now.', { title: 'Session Expiring Soon', actionLabel: 'Extend Session' }),
  },
];

const ToastReferencePanel = () => (
  <Card
    elevation={0}
    sx={{
      borderRadius: '22px',
      border: '1px solid var(--gray-200)',
      bgcolor: 'var(--gray-50)',
      boxShadow: 'none',
    }}
  >
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
          Toast messages
        </Typography>
        <Typography sx={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--gray-600)' }}>
          These live toasts are backed by the shared AppToast component, so they keep the same colors and spacing everywhere in the app.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {toastActions.map((action) => (
          <Button
            key={action.label}
            onClick={action.run}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderRadius: '14px',
              px: 2,
              py: 1.4,
              border: `1px solid ${action.border}`,
              bgcolor: action.bg,
              color: action.color,
              fontWeight: 600,
              '&:hover': {
                bgcolor: action.bg,
                borderColor: action.color,
                transform: 'translateY(-1px)',
              },
            }}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </CardContent>
  </Card>
);

export default ToastReferencePanel;