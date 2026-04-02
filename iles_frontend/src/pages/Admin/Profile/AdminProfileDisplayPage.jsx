// Admin Profile Display Page - Read-only profile view
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
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { profileAPI } from '../../../services/api';
import { notifyError } from '../../../components/Common/AppToast';
import { resolveMediaUrl } from '../../../utils/mediaUrl';

const AdminProfileDisplayPage = () => {
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
      if (user?.role !== 'admin') {
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

  const adminProfile = profile.admin_profile || {};

  const getAdminLevelLabel = (level) => {
    const labels = {
      standard: 'Standard',
      staff: 'Staff',
      senior: 'Senior Admin',
      super: 'Super Admin'
    };
    return labels[level] || level;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Administrator Profile
          </Typography>
          <Typography variant="body2" color="textSecondary">
            System administrator account information
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

      {/* Personal Info Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<Avatar src={resolveMediaUrl(profile.profile_picture)} alt={profile.full_name} />}
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

      {/* Admin Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Admin Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Admin Level</Typography>
              <Chip label={getAdminLevelLabel(adminProfile.admin_level)} color="primary" sx={{ mt: 0.5 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">Department</Typography>
              <Typography variant="body2">{adminProfile.department || 'N/A'}</Typography>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label="Can Manage Users"
                  variant={adminProfile.can_manage_users ? 'filled' : 'outlined'}
                  color={adminProfile.can_manage_users ? 'success' : 'default'}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label="Can Assign Placements"
                  variant={adminProfile.can_assign_placements ? 'filled' : 'outlined'}
                  color={adminProfile.can_assign_placements ? 'success' : 'default'}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label="Can View Reports"
                  variant={adminProfile.can_view_reports ? 'filled' : 'outlined'}
                  color={adminProfile.can_view_reports ? 'success' : 'default'}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminProfileDisplayPage;
