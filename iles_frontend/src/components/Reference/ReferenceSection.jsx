import { Box, Paper, Stack, Typography } from '@mui/material';

const ReferenceSection = ({ eyebrow, title, description, actions, children }) => (
  <Paper
    elevation={0}
    sx={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: { xs: '24px', md: '28px' },
      border: '1px solid var(--gray-200)',
      bgcolor: 'var(--panel-bg)',
      boxShadow: '0 18px 50px rgba(15,23,42,0.08)',
      p: { xs: 2.5, md: 3.5 },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        inset: 'auto -80px -80px auto',
        width: 180,
        height: 180,
        borderRadius: '50%',
        bgcolor: 'rgba(46,139,91,0.08)',
        filter: 'blur(6px)',
        pointerEvents: 'none',
      }}
    />
    <Stack spacing={1.1} sx={{ position: 'relative', zIndex: 1, mb: 2.5 }}>
      <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
        {eyebrow}
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'flex-end' }} justifyContent="space-between">
        <Box>
          <Typography sx={{ fontSize: { xs: '22px', md: '26px' }, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--ink)', lineHeight: 1.15 }}>
            {title}
          </Typography>
          <Typography sx={{ mt: 1, fontSize: '14px', lineHeight: 1.7, color: 'var(--gray-600)', maxWidth: 760 }}>
            {description}
          </Typography>
        </Box>
        {actions && <Box>{actions}</Box>}
      </Stack>
    </Stack>
    <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
  </Paper>
);

export default ReferenceSection;