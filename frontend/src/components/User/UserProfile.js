// frontend/src/components/User/UserProfile.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserProfile() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categoryLabels = {
    'web-development': 'Web Development',
    'data-science': 'Data Science',
    'mobile-development': 'Mobile Development',
    'devops': 'DevOps',
    'design': 'UI/UX Design',
    'business': 'Business',
    'language': 'Programming Language',
    'general': 'General'
  };

  const statusLabels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    paused: 'Paused'
  };

  const statusColors = {
    pending: '#757575',
    'in-progress': '#2196f3',
    completed: '#4caf50',
    paused: '#ff9800'
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { user, stats } = response.data.data;
      setUser(user);
      setStats(stats);
      setProfileForm({
        name: user.name,
        email: user.email
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  const handleProfileInputChange = (field) => (event) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePasswordInputChange = (field) => (event) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setError('Name and email are required');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/user/profile', profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/user/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password changed successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileForm({
      name: user.name,
      email: user.email
    });
    setError('');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <ToastContainer />
      
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Profile & Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account and view your learning statistics
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Profile" />
            <Tab label="Security" />
            <Tab label="Statistics" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 3 }}>
            {error}
          </Alert>
        )}

        {/* Profile Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      mb: 2
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Profile Information
                  </Typography>
                  {!isEditing ? (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileForm.name}
                      onChange={handleProfileInputChange('name')}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileInputChange('email')}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Security Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Keep your account secure by using a strong password
            </Typography>

            <Grid container spacing={2} sx={{ maxWidth: 500 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange('currentPassword')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange('newPassword')}
                  helperText="Must be at least 6 characters"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange('confirmPassword')}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SecurityIcon />}
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Statistics Tab */}
        {activeTab === 2 && stats && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Learning Statistics
            </Typography>
            
            <Grid container spacing={3}>
              {/* Goal Status Overview */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Goals by Status
                    </Typography>
                    <List dense>
                      {Object.entries(stats).filter(([key]) => key !== 'total').map(([status, count]) => (
                        <ListItem key={status} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: statusColors[status]
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={statusLabels[status]}
                            secondary={`${count} goals`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Summary Card */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Summary
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Goals:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {stats.total}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Completion Rate:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Active Goals:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {stats['in-progress'] + stats.pending}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default UserProfile;