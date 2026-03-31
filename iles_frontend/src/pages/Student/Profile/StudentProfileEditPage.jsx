// Student Profile Edit Page - Editable profile form
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

const StudentProfileEditPage = () => {
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
      student_profile: {
        ...prev.student_profile,
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

  const studentProfile = formData?.student_profile || profile.student_profile || {};

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Edit Student Profile
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Update your academic and internship information
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

      {/* Academic Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Academic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Registration Number"
                value={studentProfile.registration_number || ''}
                name="registration_number"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student Number"
                value={studentProfile.student_number || ''}
                name="student_number"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Institution"
                value={studentProfile.institution || ''}
                name="institution"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Faculty/School"
                value={studentProfile.faculty || ''}
                name="faculty"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={studentProfile.department || ''}
                name="department"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course/Program"
                value={studentProfile.course || ''}
                name="course"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year of Study"
                type="number"
                inputProps={{ min: 1, max: 6 }}
                value={studentProfile.year_of_study || ''}
                name="year_of_study"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Semester"
                type="number"
                inputProps={{ min: 1 }}
                value={studentProfile.semester || ''}
                name="semester"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expected Graduation Year"
                type="number"
                value={studentProfile.expected_graduation_year || ''}
                name="expected_graduation_year"
                onChange={handleInputChange}
                variant="outlined"
              />
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

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={studentProfile.date_of_birth || ''}
                name="date_of_birth"
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                select
                value={studentProfile.gender || ''}
                name="gender"
                onChange={handleInputChange}
                SelectProps={{ native: true }}
                variant="outlined"
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
                <option value="P">Prefer not to say</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nationality"
                value={studentProfile.nationality || ''}
                name="nationality"
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Disability Status"
                select
                value={`${Boolean(studentProfile.disability_status)}`}
                name="disability_status"
                onChange={(e) => {
                  const value = e.target.value === 'true';
                  setFormData((prev) => ({
                    ...prev,
                    student_profile: {
                      ...prev.student_profile,
                      disability_status: value,
                    },
                  }));
                }}
                SelectProps={{ native: true }}
                variant="outlined"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Special Needs"
                value={studentProfile.special_needs || ''}
                name="special_needs"
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

export default StudentProfileEditPage;
