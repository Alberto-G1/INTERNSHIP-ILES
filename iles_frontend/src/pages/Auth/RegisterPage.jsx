// frontend/src/pages/Auth/RegisterPage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    other_names: '',
    role: 'student',
    phone: '',
    alternative_phone: '',
    country: '',
    city: '',
    // Student fields
    department: '',
    // Supervisor fields
    organization_name: '',
    position: '',
    company: '',  // For workplace supervisors
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: 'student', label: 'Student Intern' },
    { value: 'workplace_supervisor', label: 'Workplace Supervisor' },
    { value: 'academic_supervisor', label: 'Academic Supervisor' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Prepare data for submission
    const submitData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.password2,
      first_name: formData.first_name,
      last_name: formData.last_name,
      other_names: formData.other_names,
      role: formData.role,
      phone: formData.phone,
      alternative_phone: formData.alternative_phone,
      country: formData.country,
      city: formData.city,
    };
    
    // Add role-specific fields
    if (formData.role === 'student') {
      submitData.department = formData.department;
    } else if (formData.role === 'academic_supervisor') {
      submitData.organization_name = formData.organization_name;
      submitData.position = formData.position;
      submitData.department = formData.department;
    } else if (formData.role === 'workplace_supervisor') {
      submitData.organization_name = formData.organization_name;
      submitData.position = formData.position;
      submitData.company = formData.company;
    }
    
    try {
      await register(submitData);
      navigate('/dashboard');
    } catch (err) {
      // Handle validation errors from backend
      if (err.response?.data) {
        // Format error messages
        const errors = [];
        for (const [field, messages] of Object.entries(err.response.data)) {
          if (Array.isArray(messages)) {
            errors.push(`${field}: ${messages.join(', ')}`);
          } else {
            errors.push(messages);
          }
        }
        setError(errors.join('\n'));
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Other Names"
                  name="other_names"
                  value={formData.other_names}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  {roles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Alternative Phone"
                  name="alternative_phone"
                  value={formData.alternative_phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>
              
              {/* Student Specific Fields */}
              {formData.role === 'student' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </Grid>
              )}
              
              {/* Academic Supervisor Fields */}
              {formData.role === 'academic_supervisor' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Institution / University"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleChange}
                      helperText="Your academic institution"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      helperText="Your academic department"
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
                      helperText="e.g., Professor, Lecturer, Head of Department"
                    />
                  </Grid>
                </>
              )}
              
              {/* Workplace Supervisor Fields */}
              {formData.role === 'workplace_supervisor' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Company Name"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      helperText="Your job title"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Company Department"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}
              
              {/* Password Fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Confirm Password"
                  name="password2"
                  type="password"
                  value={formData.password2}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            
            <Box textAlign="center">
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;