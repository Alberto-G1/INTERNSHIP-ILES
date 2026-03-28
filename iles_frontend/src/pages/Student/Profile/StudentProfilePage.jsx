// Student Profile Page - Role-specific profile management
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
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { profileAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const StudentProfilePage = () => {
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

  const studentProfile = formData?.student_profile || profile.student_profile || {};
  const completionPercent = studentProfile.completion_percentage || 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Student Profile
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage your academic and internship information
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

      {/* Academic Information */}
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
                disabled={!editMode}
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
                disabled={!editMode}
                name="student_number"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Institution"
                value={studentProfile.institution || ''}
                disabled={!editMode}
                name="institution"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Faculty/School"
                value={studentProfile.faculty || ''}
                disabled={!editMode}
                name="faculty"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={studentProfile.department || ''}
                disabled={!editMode}
                name="department"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course/Program"
                value={studentProfile.course || ''}
                disabled={!editMode}
                name="course"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year of Study"
                type="number"
                inputProps={{ min: 1, max: 6 }}
                value={studentProfile.year_of_study || ''}
                disabled={!editMode}
                name="year_of_study"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Semester"
                type="number"
                inputProps={{ min: 1 }}
                value={studentProfile.semester || ''}
                disabled={!editMode}
                name="semester"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expected Graduation Year"
                type="number"
                value={studentProfile.expected_graduation_year || ''}
                disabled={!editMode}
                name="expected_graduation_year"
                onChange={handleInputChange}
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
                disabled={!editMode}
                name="date_of_birth"
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                select
                value={studentProfile.gender || ''}
                disabled={!editMode}
                name="gender"
                onChange={handleInputChange}
                SelectProps={{ native: true }}
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
                disabled={!editMode}
                name="nationality"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Disability Status"
                select
                value={`${Boolean(studentProfile.disability_status)}`}
                disabled={!editMode}
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
                disabled={!editMode}
                name="special_needs"
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {editMode && (
        <Box sx={{ display: 'flex', gap: 2, justify: 'flex-end' }}>
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

export default StudentProfilePage;
