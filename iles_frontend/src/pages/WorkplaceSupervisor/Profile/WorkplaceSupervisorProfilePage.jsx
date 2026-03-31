// Workplace Supervisor Profile Page - Routes to display page
import WorkplaceSupervisorProfileDisplayPage from './WorkplaceSupervisorProfileDisplayPage';

export default WorkplaceSupervisorProfileDisplayPage;
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
