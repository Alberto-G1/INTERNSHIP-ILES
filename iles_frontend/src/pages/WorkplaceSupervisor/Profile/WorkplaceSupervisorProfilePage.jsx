// Workplace Supervisor Profile Page - Different fields from other roles
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
  TextField,
  LinearProgress,
  Stack,
  Alert,
  Avatar,
  CardHeader,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { profileAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const WorkplaceSupervisorProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      // Verify this is a workplace supervisor
      if (user?.role !== 'workplace_supervisor') {
        navigate('/dashboard');
        toast.error('Access denied');
        return;
      }
      setProfile(response.data);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      supervisor_profile: {
        ...prev.supervisor_profile,
        [name]: value
      }
    }));
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await profileAPI.updateProfile(formData);
      setProfile(formData);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <LinearProgress />;
  if (!profile) return <Alert severity="error">{error}</Alert>;

  const supervisorProfile = formData?.supervisor_profile || profile.supervisor_profile || {};
  const completionPercent = supervisorProfile.completion_percentage || 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Workplace Supervisor Profile
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage your workplace supervision information
        </Typography>
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
              action={
                <Button
                  startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                  onClick={() => {
                    if (editMode) {
                      setFormData(profile);
                    }
                    setEditMode(!editMode);
                  }}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
              }
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

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="First Name" value={formData?.first_name || ''} disabled={!editMode} name="first_name" onChange={handleUserInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Last Name" value={formData?.last_name || ''} disabled={!editMode} name="last_name" onChange={handleUserInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Other Names" value={formData?.other_names || ''} disabled={!editMode} name="other_names" onChange={handleUserInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Phone Number" value={formData?.phone || ''} disabled={!editMode} name="phone" onChange={handleUserInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Alternative Phone" value={formData?.alternative_phone || ''} disabled={!editMode} name="alternative_phone" onChange={handleUserInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Email" value={formData?.email || ''} disabled />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Country" value={formData?.country || ''} disabled={!editMode} name="country" onChange={handleUserInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" value={formData?.city || ''} disabled={!editMode} name="city" onChange={handleUserInputChange} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Organization Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Organization Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={supervisorProfile.organization_name || ''}
                disabled={!editMode}
                name="organization_name"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organization Type"
                value={supervisorProfile.organization_type || ''}
                disabled={!editMode}
                name="organization_type"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Industry"
                value={supervisorProfile.industry || ''}
                disabled={!editMode}
                name="industry"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={supervisorProfile.location || ''}
                disabled={!editMode}
                name="location"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={supervisorProfile.department || ''}
                disabled={!editMode}
                name="department"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position/Title"
                value={supervisorProfile.position || ''}
                disabled={!editMode}
                name="position"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                type="number"
                inputProps={{ min: 0 }}
                value={supervisorProfile.years_of_experience || ''}
                disabled={!editMode}
                name="years_of_experience"
                onChange={handleInputChange}
              />
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

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Work Email"
                type="email"
                value={supervisorProfile.work_email || ''}
                disabled={!editMode}
                name="work_email"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Office Phone"
                value={supervisorProfile.office_phone || ''}
                disabled={!editMode}
                name="office_phone"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Work Phone"
                value={supervisorProfile.work_phone || ''}
                disabled={!editMode}
                name="work_phone"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Office Address"
                value={supervisorProfile.office_address || ''}
                disabled={!editMode}
                name="office_address"
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Professional Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Area of Specialization/Expertise"
                multiline
                rows={3}
                value={supervisorProfile.specialization || ''}
                disabled={!editMode}
                name="specialization"
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {editMode && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => {
              setFormData(profile);
              setEditMode(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default WorkplaceSupervisorProfilePage;
