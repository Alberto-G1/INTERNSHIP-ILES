// Student Profile Display Page - Read-only profile view
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
  TextField,
  LinearProgress,
  Alert,
  Avatar,
  CardHeader,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { profileAPI } from '../../../services/api';
import { notifyError } from '../../../components/Common/AppToast';

const StudentProfileDisplayPage = () => {
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

  const studentProfile = profile.student_profile || {};
  const completionPercent = studentProfile.completion_percentage || 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Student Profile
          </Typography>
          <Typography variant="body2" color="textSecondary">
            View your academic and internship information
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
          {completionPercent < 100 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Complete all fields to unlock internship opportunities
            </Alert>
          )}
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

      {/* Academic Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Academic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Registration Number</Typography>
              <Typography variant="body2">{studentProfile.registration_number || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Student Number</Typography>
              <Typography variant="body2">{studentProfile.student_number || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Institution</Typography>
              <Typography variant="body2">{studentProfile.institution || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Faculty/School</Typography>
              <Typography variant="body2">{studentProfile.faculty || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Department</Typography>
              <Typography variant="body2">{studentProfile.department || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Course/Program</Typography>
              <Typography variant="body2">{studentProfile.course || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Year of Study</Typography>
              <Typography variant="body2">{studentProfile.year_of_study || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Semester</Typography>
              <Typography variant="body2">{studentProfile.semester || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Expected Graduation Year</Typography>
              <Typography variant="body2">{studentProfile.expected_graduation_year || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Date of Birth</Typography>
              <Typography variant="body2">{studentProfile.date_of_birth || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Gender</Typography>
              <Typography variant="body2">
                {studentProfile.gender === 'M' ? 'Male' : studentProfile.gender === 'F' ? 'Female' : studentProfile.gender === 'O' ? 'Other' : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Nationality</Typography>
              <Typography variant="body2">{studentProfile.nationality || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Disability Status</Typography>
              <Typography variant="body2">{studentProfile.disability_status ? 'Yes' : 'No'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">Special Needs</Typography>
              <Typography variant="body2">{studentProfile.special_needs || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentProfileDisplayPage;
