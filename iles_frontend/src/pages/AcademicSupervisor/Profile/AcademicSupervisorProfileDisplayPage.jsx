// Academic Supervisor Profile Display Page - Read-only profile view
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  LinearProgress,
  Alert,
  Avatar,
  CardHeader,
} from '@mui/material';
import {
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { profileAPI } from '../../../services/api';
import { notifyError } from '../../../components/Common/AppToast';

const AcademicSupervisorProfileDisplayPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      if (user?.role !== 'academic_supervisor') {
        navigate('/dashboard');
        notifyError('Access denied', { title: 'Permission Denied' });
        return;
      }
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile');
      notifyError('Failed to load profile', { title: 'Profile Error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (!profile) return <Alert severity="error">{error}</Alert>;

  const supervisorProfile = profile.supervisor_profile || {};
  const completionPercent = supervisorProfile.completion_percentage || 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Academic Supervisor Profile
          </Typography>
          <Typography variant="body2" color="textSecondary">
            View your academic supervision information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate('/profile/edit')}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Profile Completion Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2">Profile Completion</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {completionPercent}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={completionPercent} />
        </CardContent>
      </Card>

      {/* Personal Info Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<Avatar src={profile.profile_picture} alt={profile.full_name} />}
              title={profile.full_name}
              subheader={profile.email}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Core Identity & Contact */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Core Identity & Contact
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="textSecondary">First Name</Typography>
              <Typography variant="body2">{profile.first_name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="textSecondary">Last Name</Typography>
              <Typography variant="body2">{profile.last_name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="textSecondary">Other Names</Typography>
              <Typography variant="body2">{profile.other_names || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="textSecondary">Phone Number</Typography>
              <Typography variant="body2">{profile.phone || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="textSecondary">Alternative Phone</Typography>
              <Typography variant="body2">{profile.alternative_phone || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="textSecondary">Email</Typography>
              <Typography variant="body2">{profile.email || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Country</Typography>
              <Typography variant="body2">{profile.country || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">City</Typography>
              <Typography variant="body2">{profile.city || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Institution Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Institution Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Institution Name</Typography>
              <Typography variant="body2">{supervisorProfile.organization_name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Faculty</Typography>
              <Typography variant="body2">{supervisorProfile.faculty || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Department</Typography>
              <Typography variant="body2">{supervisorProfile.department || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Academic Position/Title</Typography>
              <Typography variant="body2">{supervisorProfile.position || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Years in Academia</Typography>
              <Typography variant="body2">{supervisorProfile.years_of_experience || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Contact Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Office Email</Typography>
              <Typography variant="body2">{supervisorProfile.work_email || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Office Phone</Typography>
              <Typography variant="body2">{supervisorProfile.office_phone || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">Office Address</Typography>
              <Typography variant="body2">{supervisorProfile.office_address || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Academic Specialization */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Academic Specialization
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="body2">{supervisorProfile.specialization || 'N/A'}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AcademicSupervisorProfileDisplayPage;
