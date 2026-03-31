// Workplace Supervisor Profile Edit Page - Editable profile form
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
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { profileAPI } from '../../../services/api';
import { notifyError, notifySuccess } from '../../../components/Common/AppToast';

const WorkplaceSupervisorProfileEditPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      if (user?.role !== 'workplace_supervisor') {
        navigate('/dashboard');
        notifyError('Access denied', { title: 'Permission Denied' });
        return;
      }
      setProfile(response.data);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to load profile');
      notifyError('Failed to load profile', { title: 'Profile Error' });
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
      setSaving(true);
      await profileAPI.updateProfile(formData);
      setProfile(formData);
      notifySuccess('Profile updated successfully', { title: 'Profile Saved' });
      navigate('/profile');
    } catch (err) {
      notifyError('Failed to update profile', { title: 'Save Failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (!profile) return <Alert severity="error">{error}</Alert>;

  const supervisorProfile = formData?.supervisor_profile || profile.supervisor_profile || {};

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Edit Workplace Supervisor Profile
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Update your workplace supervision information
        </Typography>
      </Box>

      {/* Core Identity & Contact */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Core Identity & Contact
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name"
                value={formData?.first_name || ''}
                name="first_name"
                onChange={handleUserInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData?.last_name || ''}
                name="last_name"
                onChange={handleUserInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Other Names"
                value={formData?.other_names || ''}
                name="other_names"
                onChange={handleUserInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData?.phone || ''}
                name="phone"
                onChange={handleUserInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Alternative Phone"
                value={formData?.alternative_phone || ''}
                name="alternative_phone"
                onChange={handleUserInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Email"
                value={formData?.email || ''}
                disabled
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData?.country || ''}
                name="country"
                onChange={handleUserInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData?.city || ''}
                name="city"
                onChange={handleUserInputChange}
                variant="outlined"
              />
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
                name="organization_name"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organization Type"
                value={supervisorProfile.organization_type || ''}
                name="organization_type"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Industry"
                value={supervisorProfile.industry || ''}
                name="industry"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={supervisorProfile.location || ''}
                name="location"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={supervisorProfile.department || ''}
                name="department"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position/Title"
                value={supervisorProfile.position || ''}
                name="position"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                type="number"
                inputProps={{ min: 0 }}
                value={supervisorProfile.years_of_experience || ''}
                name="years_of_experience"
                onChange={handleInputChange}
                variant="outlined"
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
                name="work_email"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Office Phone"
                value={supervisorProfile.office_phone || ''}
                name="office_phone"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Work Phone"
                value={supervisorProfile.work_phone || ''}
                name="work_phone"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Office Address"
                value={supervisorProfile.office_address || ''}
                name="office_address"
                onChange={handleInputChange}
                variant="outlined"
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
                name="specialization"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={() => navigate('/profile')}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Stack>
    </Container>
  );
};

export default WorkplaceSupervisorProfileEditPage;
