import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';

const PageScaffold = ({
  title,
  subtitle,
  chips = [],
  stats = [],
  children,
}) => {
  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ color: 'text.secondary', fontSize: '12.5px' }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {chips.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {chips.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              size="small"
              sx={{
                borderRadius: '999px',
                bgcolor: '#EEF9F3',
                color: '#1A5C3A',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>
      )}

      {stats.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: 4,
                    height: '100%',
                    bgcolor: stat.accent || '#2E8B5B',
                  }}
                />
                <CardContent sx={{ py: 2.1 }}>
                  <Typography sx={{ color: '#9CA3AF', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.45px' }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: '28px', lineHeight: 1.15, fontWeight: 600, mt: 0.8 }}>
                    {stat.value}
                  </Typography>
                  {stat.helper && (
                    <Typography sx={{ mt: 0.4, color: '#4B5563', fontSize: '12px' }}>
                      {stat.helper}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Card>
        <CardContent>{children}</CardContent>
      </Card>
    </Box>
  );
};

export default PageScaffold;