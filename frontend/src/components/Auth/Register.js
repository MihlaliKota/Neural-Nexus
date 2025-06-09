import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert, 
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const steps = ['Personal Info', 'Security', 'Confirmation'];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: 'Enter password', color: '#e0e0e0' };
    if (password.length < 6) return { strength: 25, label: 'Too short', color: '#ef4444' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    if (strength <= 25) return { strength, label: 'Weak', color: '#ef4444' };
    if (strength <= 50) return { strength, label: 'Fair', color: '#f59e0b' };
    if (strength <= 75) return { strength, label: 'Good', color: '#3b82f6' };
    return { strength: 100, label: 'Strong', color: '#10b981' };
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
    } else if (activeStep === 1) {
      if (!validatePassword(password)) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              helperText="We'll use this for login and notifications"
            />
          </>
        );
      
      case 1:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            
            {/* Password strength indicator */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Password strength
                </Typography>
                <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 600 }}>
                  {passwordStrength.label}
                </Typography>
              </Box>
              <Box sx={{ height: 4, bgcolor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    width: `${passwordStrength.strength}%`,
                    bgcolor: passwordStrength.color,
                    transition: 'all 0.3s ease',
                  }}
                />
              </Box>
            </Box>
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      
      case 2:
        return (
          <>
            <Box sx={{ mb: 3, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Confirm Your Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {email}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link to="#" style={{ textDecoration: 'none', fontWeight: 500 }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="#" style={{ textDecoration: 'none', fontWeight: 500 }}>
                    Privacy Policy
                  </Link>
                </Typography>
              }
            />
          </>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 480,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #6366f1 30%, #f59e0b 90%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px 0 rgba(99, 102, 241, 0.24)',
              }}
            >
              <SchoolIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Join Neural Nexus
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start your AI-powered learning journey today
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !agreeToTerms}
                sx={{ 
                  background: 'linear-gradient(45deg, #6366f1 30%, #818cf8 90%)',
                  boxShadow: '0 3px 5px 2px rgba(99, 102, 241, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4f46e5 30%, #6366f1 90%)',
                  }
                }}
                endIcon={isLoading ? null : <CheckCircleIcon />}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  background: 'linear-gradient(45deg, #6366f1 30%, #818cf8 90%)',
                  boxShadow: '0 3px 5px 2px rgba(99, 102, 241, .3)',
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Already have an account?
          </Typography>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              sx={{ fontWeight: 600 }}
            >
              Sign In
            </Button>
          </Link>
        </Box>
      </Paper>

      {/* Background decoration */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.05,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

export default Register;