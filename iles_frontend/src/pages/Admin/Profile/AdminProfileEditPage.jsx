// Admin Profile Edit Page - Editable profile form
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
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { profileAPI } from '../../../services/api';
import { notifyError, notifySuccess } from '../../../components/Common/AppToast';
import ProfilePictureField from '../../../components/Common/ProfilePictureField';
import { buildProfileUpdateFormData } from '../../../utils/profileFormData';
import { resolveMediaUrl } from '../../../utils/mediaUrl';

const AdminProfileEditPage = () => {
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
      if (user?.role !== 'admin') {
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
    setFormData((prev) => ({
      ...prev,
      admin_profile: {
        ...prev.admin_profile,
        [name]: value,
      },
    }));
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      profile_picture: file,
    }));
  };

  const handleAdminToggle = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      admin_profile: {
        ...prev.admin_profile,
        [name]: checked,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await profileAPI.updateProfile(buildProfileUpdateFormData(formData));
      setProfile(response.data);
      setFormData(response.data);
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

  const adminProfile = formData?.admin_profile || profile.admin_profile || {};

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Edit Administrator Profile
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Update your account information
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <ProfilePictureField
            label="Profile Picture"
            currentSrc={resolveMediaUrl(profile.profile_picture)}
            value={formData?.profile_picture}
            onChange={handleProfilePictureChange}
          />
        </CardContent>
      </Card>

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

      {/* Admin Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Admin Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Admin Level"
                select
                value={adminProfile.admin_level || 'staff'}
                name="admin_level"
                onChange={handleInputChange}
                SelectProps={{ native: true }}
                variant="outlined"
              >
                <option value="standard">Standard</option>
                <option value="staff">Staff</option>
                <option value="senior">Senior Admin</option>
                <option value="super">Super Admin</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={adminProfile.department || ''}
                name="department"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Permissions
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(adminProfile.can_manage_users)}
                    onChange={handleAdminToggle}
                    name="can_manage_users"
                  />
                }
                label="Can Manage Users"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(adminProfile.can_assign_placements)}
                    onChange={handleAdminToggle}
                    name="can_assign_placements"
                  />
                }
                label="Can Assign Placements"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(adminProfile.can_view_reports)}
                    onChange={handleAdminToggle}
                    name="can_view_reports"
                  />
                }
                label="Can View Reports"
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

export default AdminProfileEditPage;
