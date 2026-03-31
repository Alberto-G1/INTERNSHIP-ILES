// Admin Profile Page - Routes to display page
import AdminProfileDisplayPage from './AdminProfileDisplayPage';

export default AdminProfileDisplayPage;

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
                disabled={!editMode}
                name="admin_level"
                onChange={handleInputChange}
                SelectProps={{ native: true }}
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
                disabled={!editMode}
                name="department"
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
                    disabled={!editMode}
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
                    disabled={!editMode}
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
                    disabled={!editMode}
                  />
                }
                label="Can View Reports"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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

export default AdminProfilePage;
