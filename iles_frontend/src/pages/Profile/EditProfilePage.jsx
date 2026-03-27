// frontend/src/pages/Profile/EditProfilePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Grid
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    // Student fields
    registration_number: '',
    institution: '',
    faculty: '',
    course: '',
    year_of_study: '',
    date_of_birth: '',
    gender: '',
    expected_graduation_year: '',
    // Supervisor fields
    organization_name: '',
    department: '',
    position: '',
    work_email: '',
    office_phone: '',
    specialization: '',
    years_of_experience: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const profile = response.data;
      
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        // Student fields
        registration_number: profile.student_profile?.registration_number || '',
        institution: profile.student_profile?.institution || '',
        faculty: profile.student_profile?.faculty || '',
        course: profile.student_profile?.course || '',
        year_of_study: profile.student_profile?.year_of_study || '',
        date_of_birth: profile.student_profile?.date_of_birth || '',
        gender: profile.student_profile?.gender || '',
        expected_graduation_year: profile.student_profile?.expected_graduation_year || '',
        // Supervisor fields
        organization_name: profile.supervisor_profile?.organization_name || '',
        department: profile.supervisor_profile?.department || '',
        position: profile.supervisor_profile?.position || '',
        work_email: profile.supervisor_profile?.work_email || '',
        office_phone: profile.supervisor_profile?.office_phone || '',
        specialization: profile.supervisor_profile?.specialization || '',
        years_of_experience: profile.supervisor_profile?.years_of_experience || ''
      });
    } catch (err) {
      setError('Failed to load profile data');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await profileAPI.updateProfile(formData);
      updateUser(response.data);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Profile
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Update your personal and professional information
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Student Specific Fields */}
          {user?.role === 'student' && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Academic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Registration Number"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    helperText="Format: 6-20 alphanumeric characters"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Institution / University"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Faculty / School"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Course / Program"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Year of Study"
                    name="year_of_study"
                    value={formData.year_of_study}
                    onChange={handleChange}
                    inputProps={{ min: 1, max: 6 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Expected Graduation Year"
                    name="expected_graduation_year"
                    value={formData.expected_graduation_year}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <MenuItem value="">Prefer not to say</MenuItem>
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                    <MenuItem value="O">Other</MenuItem>
                    <MenuItem value="P">Prefer not to say</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </>
          )}

          {/* Supervisor Specific Fields */}
          {(user?.role === 'workplace_supervisor' || user?.role === 'academic_supervisor') && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Professional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Organization / Institution"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Position / Title"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Work Email"
                    name="work_email"
                    value={formData.work_email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Office Phone"
                    name="office_phone"
                    value={formData.office_phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Specialization / Expertise"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Years of Experience"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            </>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProfilePage;