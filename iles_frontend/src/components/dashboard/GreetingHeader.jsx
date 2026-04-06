// frontend/src/components/Dashboard/GreetingHeader.jsx
import { Box, Typography } from '@mui/material';
import { getRoleGradient } from '../Layout/layoutConfig';

const GreetingHeader = ({ 
  greeting = 'Good morning', 
  name = '', 
  role = 'admin',
  stats = [],
  subtitle = '',
}) => {
  const getGreetingClass = () => {
    const classes = {
      admin: 'greeting-admin',
      workplace_supervisor: 'greeting-workplace',
      academic_supervisor: 'greeting-academic',
      student: 'greeting-student',
    };
    return classes[role] || 'greeting-admin';
  };

  const getArtwork = () => {
    const artworks = {
      admin: (
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" stroke="rgba(45,175,131,0.4)" strokeWidth="1"/>
          <circle cx="40" cy="40" r="26" stroke="rgba(85,105,224,0.3)" strokeWidth="1"/>
          <circle cx="40" cy="40" r="16" fill="rgba(45,175,131,0.15)"/>
          <path d="M40 4v72M4 40h72" stroke="rgba(45,175,131,0.2)" strokeWidth="1"/>
          <path d="M40 4A36 36 0 0176 40" stroke="rgba(45,175,131,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="40" cy="4" r="4" fill="rgba(45,175,131,0.8)"/>
        </svg>
      ),
      workplace_supervisor: (
        <svg viewBox="0 0 80 80" fill="none">
          <rect x="12" y="20" width="56" height="44" rx="6" stroke="rgba(155,172,239,0.5)" strokeWidth="1"/>
          <path d="M22 36h36M22 46h28M22 56h18" stroke="rgba(155,172,239,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="59" cy="22" r="11" fill="rgba(85,105,224,0.3)"/>
          <path d="M54 22l3.5 3.5L62 18" stroke="rgba(155,172,239,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      academic_supervisor: (
        <svg viewBox="0 0 80 80" fill="none">
          <path d="M40 10l30 15v20l-30 15L10 45V25z" stroke="rgba(196,174,255,0.5)" strokeWidth="1" fill="rgba(124,58,237,0.08)"/>
          <path d="M40 10v50M10 25l30 15 30-15" stroke="rgba(196,174,255,0.3)" strokeWidth="1"/>
          <circle cx="40" cy="10" r="4" fill="rgba(196,174,255,0.8)"/>
          <circle cx="10" cy="25" r="3" fill="rgba(196,174,255,0.5)"/>
          <circle cx="70" cy="25" r="3" fill="rgba(196,174,255,0.5)"/>
        </svg>
      ),
      student: (
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="32" stroke="rgba(45,175,131,0.3)" strokeWidth="1"/>
          <path d="M40 8A32 32 0 0172 40" stroke="rgba(45,175,131,0.8)" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="40" cy="8" r="5" fill="rgba(45,175,131,0.9)"/>
          <circle cx="40" cy="40" r="8" fill="rgba(45,175,131,0.2)"/>
          <circle cx="40" cy="40" r="3" fill="rgba(45,175,131,0.6)"/>
        </svg>
      ),
    };
    return artworks[role] || artworks.admin;
  };

  return (
    <Box
      className={getGreetingClass()}
      sx={{
        borderRadius: '20px',
        p: '28px 32px',
        mb: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        background: role === 'admin' 
          ? 'linear-gradient(135deg, #0F1635 0%, #1A2D5A 50%, #162840 100%)'
          : role === 'workplace_supervisor'
          ? 'linear-gradient(135deg, #1A1050 0%, #2C1A6E 50%, #1A2A5E 100%)'
          : role === 'academic_supervisor'
          ? 'linear-gradient(135deg, #2A0A5E 0%, #1A1050 50%, #0F1635 100%)'
          : 'linear-gradient(135deg, #0A2B1A 0%, #0F3522 50%, #0A2520 100%)',
        color: '#fff',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: role === 'admin'
            ? 'radial-gradient(ellipse 280px 180px at 80% 50%, rgba(45,175,131,0.15) 0%, transparent 60%), radial-gradient(ellipse 200px 200px at 20% 80%, rgba(85,105,224,0.12) 0%, transparent 60%)'
            : role === 'workplace_supervisor'
            ? 'radial-gradient(ellipse 280px 200px at 90% 40%, rgba(85,105,224,0.2) 0%, transparent 60%), radial-gradient(ellipse 200px 180px at 10% 80%, rgba(45,175,131,0.1) 0%, transparent 60%)'
            : role === 'academic_supervisor'
            ? 'radial-gradient(ellipse 260px 180px at 85% 45%, rgba(124,58,237,0.2) 0%, transparent 60%), radial-gradient(ellipse 220px 200px at 15% 70%, rgba(240,140,48,0.1) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 280px 200px at 85% 40%, rgba(45,175,131,0.18) 0%, transparent 60%), radial-gradient(ellipse 200px 180px at 15% 80%, rgba(240,140,48,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '6px' }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#22C55E',
              animation: 'pulse-dot 2s ease-in-out infinite',
              '@keyframes pulse-dot': {
                '0%,100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.4, transform: 'scale(0.8)' },
              },
            }}
          />
          <Typography sx={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'rgba(255,255,255,0.7)' }}>
            Live · Spring 2025 Cohort
          </Typography>
        </Box>
        
        <Typography
          sx={{
            fontFamily: "'Fraunces', serif",
            fontSize: { xs: '20px', sm: '27px' },
            fontWeight: 700,
            lineHeight: 1.15,
            mb: '6px',
          }}
        >
          {greeting}{name ? `, ${name}` : ''}.
        </Typography>
        
        {subtitle && (
          <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', maxWidth: 440, lineHeight: 1.55 }}>
            {subtitle}
          </Typography>
        )}
        
        {stats.length > 0 && (
          <Box sx={{ display: 'flex', gap: '24px', mt: '18px', flexWrap: 'wrap' }}>
            {stats.map((stat, idx) => (
              <Box key={idx}>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', mt: '2px', opacity: 0.6 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      
      <Box sx={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
        {getArtwork()}
      </Box>
    </Box>
  );
};

export default GreetingHeader;