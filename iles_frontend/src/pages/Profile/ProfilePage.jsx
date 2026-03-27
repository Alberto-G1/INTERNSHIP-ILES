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
  Alert,
  LinearProgress,
  Chip,
  Skeleton
} from '@mui/material';
import { Edit as EditIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.data);
      
      // Get completion status
      const completionResponse = await profileAPI.getCompletion();
      setCompletion(completionResponse.data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Skeleton variant="rectangular" height={200} />
        <Skeleton variant="text" sx={{ mt: 2 }} />
        <Skeleton variant="text" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const getRoleLabel = (role) => {
    const roles = {
      student: 'Student Intern',
      workplace_supervisor: 'Workplace Supervisor',
      academic_supervisor: 'Academic Supervisor',
      admin: 'System Administrator'
    };
    return roles[role] || role;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              My Profile
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {user?.first_name} {user?.last_name}
            </Typography>
            <Chip 
              label={getRoleLabel(user?.role)} 
              color="primary" 
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </Button>
        </Box>
      </Paper>

      {/* Profile Completion */}
      {completion && !completion.completed && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.light' }}>
          <Typography variant="h6" gutterBottom>
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Please complete your profile to access all system features
          </Typography>
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={completion.percentage} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {completion.percentage}% complete
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
            onClick={() => navigate('/profile/edit')}
          >
            Complete Profile
          </Button>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <InfoRow label="Username" value={user?.username} />
                <InfoRow label="Email" value={user?.email} />
                <InfoRow label="Phone" value={user?.phone || 'Not provided'} />
                <InfoRow label="Member Since" value={new Date(user?.created_at).toLocaleDateString()} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Role-Specific Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
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

// Helper components
const InfoRow = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography variant="body2" color="textSecondary">{label}</Typography>
    <Typography variant="body1">{value || '—'}</Typography>
  </Box>
);

const StudentInfo = ({ profile }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <InfoRow label="Registration Number" value={profile.registration_number} />
    <InfoRow label="Institution" value={profile.institution} />
    <InfoRow label="Faculty" value={profile.faculty || 'Not provided'} />
    <InfoRow label="Course" value={profile.course} />
    <InfoRow label="Year of Study" value={profile.year_of_study} />
    <InfoRow label="Expected Graduation" value={profile.expected_graduation_year} />
    <InfoRow label="Gender" value={profile.gender || 'Not specified'} />
    <InfoRow label="Internship Status" value={profile.internship_status?.replace('_', ' ')} />
  </Box>
);

const SupervisorInfo = ({ profile }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <InfoRow label="Type" value={profile.supervisor_type_display} />
    <InfoRow label="Organization" value={profile.organization_name} />
    <InfoRow label="Department" value={profile.department || 'Not provided'} />
    <InfoRow label="Position" value={profile.position} />
    <InfoRow label="Work Email" value={profile.work_email || profile.user_email} />
    <InfoRow label="Office Phone" value={profile.office_phone || 'Not provided'} />
    <InfoRow label="Specialization" value={profile.specialization || 'Not specified'} />
    <InfoRow label="Experience" value={profile.years_of_experience ? `${profile.years_of_experience} years` : 'Not specified'} />
  </Box>
);

const AdminInfo = ({ profile }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <InfoRow label="Admin Level" value={profile.admin_level} />
    <InfoRow label="Department" value={profile.department || 'Not assigned'} />
  </Box>
);

export default ProfilePage;