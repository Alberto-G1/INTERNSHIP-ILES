// frontend/src/pages/Profile/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
  Avatar,
  IconButton,
  LinearProgress,
  Stack,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.data);
      const completionResponse = await profileAPI.getCompletion();
      setCompletion(completionResponse.data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'student': return '#2E8B5B';
      case 'workplace_supervisor': return '#F59E0B';
      case 'academic_supervisor': return '#5B82A6';
      case 'admin': return '#C0392B';
      default: return '#4B5563';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'student': return 'Student Intern';
      case 'workplace_supervisor': return 'Workplace Supervisor';
      case 'academic_supervisor': return 'Academic Supervisor';
      case 'admin': return 'System Administrator';
      default: return user?.role;
    }
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LinearProgress sx={{ width: 200 }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profile Header */}
      <Paper
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          mb: 3,
        }}
      >
        <Box
          sx={{
            height: 120,
            background: `linear-gradient(135deg, ${getRoleColor()} 0%, ${getRoleColor()}cc 100%)`,
          }}
        />
        <Box sx={{ px: 3, pb: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mt: -5 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: getRoleColor(),
                  border: '4px solid white',
                  fontSize: 36,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {getInitials()}
              </Avatar>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={getRoleLabel()}
                    size="small"
                    sx={{
                      bgcolor: getRoleColor(),
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                  {completion && !completion.completed && (
                    <Chip
                      label="Profile Incomplete"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate('/profile/edit')}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Edit Profile
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Profile Completion */}
      {completion && !completion.completed && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.light', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please complete your profile to access all system features
          </Typography>
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={completion.percentage}
              sx={{ height: 8, borderRadius: 4, bgcolor: 'warning.main' }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {completion.percentage}% complete
            </Typography>
          </Box>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeIcon fontSize="small" color="primary" />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <InfoRow icon={<EmailIcon />} label="Email" value={user?.email} />
                <InfoRow icon={<PhoneIcon />} label="Phone" value={user?.phone || 'Not provided'} />
                <InfoRow icon={<CalendarIcon />} label="Member Since" value={new Date(user?.created_at).toLocaleDateString()} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Role-Specific Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user?.role === 'student' ? <SchoolIcon /> : <BusinessIcon />}
                {user?.role === 'student' ? 'Academic Information' : 'Professional Information'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {user?.role === 'student' && profile?.student_profile && (
                <StudentInfo profile={profile.student_profile} />
              )}
              
              {(user?.role === 'workplace_supervisor' || user?.role === 'academic_supervisor') && 
               profile?.supervisor_profile && (
                <SupervisorInfo profile={profile.supervisor_profile} />
              )}
              
              {user?.role === 'admin' && profile?.admin_profile && (
                <AdminInfo profile={profile.admin_profile} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

// Helper Components
const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ color: 'text.secondary', minWidth: 32 }}>{icon}</Box>
    <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ flex: 1 }}>
      {value || '—'}
    </Typography>
  </Box>
);

const StudentInfo = ({ profile }) => (
  <Stack spacing={2}>
    <InfoRow icon={<BadgeIcon />} label="Registration Number" value={profile.registration_number} />
    <InfoRow icon={<SchoolIcon />} label="Institution" value={profile.institution} />
    <InfoRow icon={<SchoolIcon />} label="Faculty" value={profile.faculty || 'Not provided'} />
    <InfoRow icon={<WorkIcon />} label="Course" value={profile.course} />
    <InfoRow icon={<BadgeIcon />} label="Year of Study" value={profile.year_of_study} />
    <InfoRow icon={<CalendarIcon />} label="Expected Graduation" value={profile.expected_graduation_year} />
    <InfoRow icon={<BadgeIcon />} label="Internship Status" value={profile.internship_status?.replace('_', ' ')} />
  </Stack>
);

const SupervisorInfo = ({ profile }) => (
  <Stack spacing={2}>
    <InfoRow icon={<BusinessIcon />} label="Type" value={profile.supervisor_type_display} />
    <InfoRow icon={<BusinessIcon />} label="Organization" value={profile.organization_name} />
    <InfoRow icon={<LocationIcon />} label="Department" value={profile.department || 'Not provided'} />
    <InfoRow icon={<WorkIcon />} label="Position" value={profile.position} />
    <InfoRow icon={<EmailIcon />} label="Work Email" value={profile.work_email || profile.user_email} />
    <InfoRow icon={<PhoneIcon />} label="Office Phone" value={profile.office_phone || 'Not provided'} />
    <InfoRow icon={<WorkIcon />} label="Specialization" value={profile.specialization || 'Not specified'} />
    <InfoRow icon={<CalendarIcon />} label="Experience" value={profile.years_of_experience ? `${profile.years_of_experience} years` : 'Not specified'} />
  </Stack>
);

const AdminInfo = ({ profile }) => (
  <Stack spacing={2}>
    <InfoRow icon={<BadgeIcon />} label="Admin Level" value={profile.admin_level} />
    <InfoRow icon={<BusinessIcon />} label="Department" value={profile.department || 'Not assigned'} />
  </Stack>
);

export default ProfilePage;