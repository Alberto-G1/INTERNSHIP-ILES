import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';
import { notifyError, notifySuccess } from '../../../components/Common/AppToast';
import { adminUsersAPI } from '../../../services/api';
import { resolveMediaUrl } from '../../../utils/mediaUrl';

const roleColor = (role) => {
  const map = {
    admin: 'error',
    student: 'primary',
    workplace_supervisor: 'warning',
    academic_supervisor: 'info',
  };
  return map[role] || 'default';
};

const AdminStaffManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUsersAPI.getUsers(roleFilter ? { role: roleFilter } : {});
      setUsers(res.data || []);
    } catch (error) {
      notifyError('Failed to load staff members', { title: 'Load Failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const full = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
      return (
        u.username?.toLowerCase().includes(term)
        || u.email?.toLowerCase().includes(term)
        || full.includes(term)
        || u.role?.toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  const toggleUserActive = async (user) => {
    try {
      setUpdatingId(user.id);
      await adminUsersAPI.updateUser(user.id, { is_active: !user.is_active });
      notifySuccess(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`, {
        title: 'Updated',
      });
      await loadUsers();
    } catch (error) {
      notifyError(error.response?.data?.error || 'Failed to update user', { title: 'Update Failed' });
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleSupervisorApproval = async (user) => {
    try {
      setUpdatingId(user.id);
      await adminUsersAPI.updateUser(user.id, { admin_approved: !user.admin_approved });
      notifySuccess(
        `${!user.admin_approved ? 'Approved' : 'Revoked'} supervisor account successfully`,
        { title: 'Updated' }
      );
      await loadUsers();
    } catch (error) {
      notifyError(error.response?.data?.error || 'Failed to update supervisor approval', {
        title: 'Update Failed',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <PageScaffold
      title="Staff Management"
      subtitle="Manage all system users including students, supervisors, and admins"
    >
      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, username, email, role"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Filter by role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="student">Students</MenuItem>
              <MenuItem value="workplace_supervisor">Workplace Supervisors</MenuItem>
              <MenuItem value="academic_supervisor">Academic Supervisors</MenuItem>
              <MenuItem value="admin">Admins</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <Alert severity="info" sx={{ height: '100%', alignItems: 'center' }}>
              Total users: {filtered.length}
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      <Stack spacing={1.2}>
        {loading ? (
          <Typography color="text.secondary">Loading staff records...</Typography>
        ) : filtered.length === 0 ? (
          <Alert severity="warning">No users found for the selected filters.</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ border: '1px solid #e5e7eb' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Staff Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Approval</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((user) => {
                  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
                  const isSupervisor = user.role === 'workplace_supervisor' || user.role === 'academic_supervisor';

                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Avatar
                            src={resolveMediaUrl(user.profile_picture)}
                            alt={fullName}
                            sx={{ width: 36, height: 36 }}
                          >
                            {fullName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{fullName}</Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{user.email}</Typography>
                            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>@{user.username}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={user.role.replaceAll('_', ' ')} color={roleColor(user.role)} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={user.is_active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {isSupervisor ? (
                          <Chip
                            label={user.admin_approved ? 'Approved' : 'Pending'}
                            size="small"
                            color={user.admin_approved ? 'success' : 'warning'}
                          />
                        ) : (
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>N/A</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.8} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            color={user.is_active ? 'error' : 'success'}
                            disabled={updatingId === user.id}
                            onClick={() => toggleUserActive(user)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          {isSupervisor && (
                            <Button
                              size="small"
                              variant="contained"
                              disabled={updatingId === user.id}
                              onClick={() => toggleSupervisorApproval(user)}
                            >
                              {user.admin_approved ? 'Revoke' : 'Approve'}
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </PageScaffold>
  );
};

export default AdminStaffManagementPage;
