import React, { useState } from 'react';
import {
  Typography,
  Container,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  InputAdornment,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  LocalOffer as TagIcon,
  Notes as NotesIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon,
  TipsAndUpdates as TipsIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SubmitGoal() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    description: '',
    priority: 'medium',
    category: 'general',
    targetDate: null,
    notes: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTips, setShowTips] = useState(true);
  
  // Curriculum state
  const [curriculum, setCurriculum] = useState('');
  const [showCurriculumDialog, setShowCurriculumDialog] = useState(false);
  const [isGeneratingCurriculum, setIsGeneratingCurriculum] = useState(false);
  
  const navigate = useNavigate();

  const categories = [
    { value: 'web-development', label: 'Web Development', icon: '💻', color: '#3b82f6' },
    { value: 'data-science', label: 'Data Science', icon: '📊', color: '#8b5cf6' },
    { value: 'mobile-development', label: 'Mobile Development', icon: '📱', color: '#06b6d4' },
    { value: 'devops', label: 'DevOps', icon: '⚙️', color: '#6366f1' },
    { value: 'design', label: 'UI/UX Design', icon: '🎨', color: '#ec4899' },
    { value: 'business', label: 'Business', icon: '💼', color: '#f59e0b' },
    { value: 'language', label: 'Programming Language', icon: '🔤', color: '#10b981' },
    { value: 'general', label: 'General', icon: '📚', color: '#64748b' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: '#10b981', description: 'Learn at your own pace' },
    { value: 'medium', label: 'Medium Priority', color: '#f59e0b', description: 'Regular focus needed' },
    { value: 'high', label: 'High Priority', color: '#ef4444', description: 'Important for career growth' },
    { value: 'urgent', label: 'Urgent', color: '#7c3aed', description: 'Critical deadline approaching' }
  ];

  const steps = [
    { label: 'Define Your Goal', icon: DescriptionIcon },
    { label: 'Set Priority & Timeline', icon: FlagIcon },
    { label: 'Add Details', icon: NotesIcon },
    { label: 'Review & Submit', icon: CheckIcon }
  ];

  const learningTips = [
    "Be specific about what you want to learn - 'Master React hooks' is better than 'Learn React'",
    "Set realistic deadlines that give you enough time to practice",
    "Break down complex topics into smaller, manageable goals",
    "Include why you want to learn this - it helps with motivation"
  ];

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      targetDate: date
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const formatCurriculum = (curriculumText) => {
    if (!curriculumText) return '';
    
    let formatted = curriculumText
      .replace(/^# (.*$)/gim, '<h2 style="color: #6366f1; margin-top: 32px; margin-bottom: 20px; font-weight: 700; font-size: 1.75rem;">$1</h2>')
      .replace(/^## (.*$)/gim, '<h3 style="color: #6366f1; margin-top: 28px; margin-bottom: 16px; font-weight: 600; font-size: 1.5rem;">$1</h3>')
      .replace(/^### (.*$)/gim, '<h4 style="color: #6366f1; margin-top: 24px; margin-bottom: 12px; font-weight: 600; font-size: 1.25rem;">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1e293b; font-weight: 600;">$1</strong>')
      .replace(/^\* (.*$)/gim, '<li style="margin-bottom: 12px; padding-left: 8px; line-height: 1.7;">$1</li>')
      .replace(/^- (.*$)/gim, '<li style="margin-bottom: 12px; padding-left: 8px; line-height: 1.7;">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li style="margin-bottom: 12px; padding-left: 8px; line-height: 1.7; list-style-type: decimal;">$1</li>');
    
    formatted = formatted.replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, (match) => {
      if (match.includes('list-style-type: decimal')) {
        return '<ol style="margin: 20px 0; padding-left: 28px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">' + match + '</ol>';
      } else {
        return '<ul style="margin: 20px 0; padding-left: 28px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">' + match + '</ul>';
      }
    });
    
    formatted = formatted
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        if (paragraph.startsWith('<h') || paragraph.startsWith('<ul') || paragraph.startsWith('<ol')) {
          return paragraph;
        }
        return `<p style="margin-bottom: 20px; line-height: 1.8; color: #475569;">${paragraph}</p>`;
      })
      .join('');
    
    return formatted;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setIsGeneratingCurriculum(true);
    setSubmissionStatus(null);

    const token = localStorage.getItem('token');

    if (!token) {
      setSubmissionStatus('error');
      setSubmissionMessage('Authentication token not found. Please log in again.');
      toast.error('Authentication token not found. Please log in again.');
      setIsSubmitting(false);
      setIsGeneratingCurriculum(false);
      return;
    }

    if (!formData.description.trim()) {
      setSubmissionStatus('error');
      setSubmissionMessage('Please provide a goal description.');
      toast.error('Please provide a goal description.');
      setIsSubmitting(false);
      setIsGeneratingCurriculum(false);
      return;
    }

    try {
      const response = await axios.post(
        '/api/goals',
        {
          description: formData.description.trim(),
          priority: formData.priority,
          category: formData.category,
          targetDate: formData.targetDate,
          notes: formData.notes.trim(),
          tags: formData.tags
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissionStatus('success');
      toast.success(response.data.message || 'Goal submitted successfully!');
      
      if (response.data.curriculum) {
        setCurriculum(response.data.curriculum);
        setShowCurriculumDialog(true);
        toast.success('🧠 AI Learning Curriculum Generated!');
      } else {
        toast.info('Goal saved! Curriculum generation may take a moment.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
      
      // Reset form
      setFormData({
        description: '',
        priority: 'medium',
        category: 'general',
        targetDate: null,
        notes: '',
        tags: []
      });
      setActiveStep(0);

    } catch (error) {
      setSubmissionStatus('error');
      const errorMessage = error.response?.data?.message || 'Failed to submit goal.';
      setSubmissionMessage(errorMessage);
      toast.error(errorMessage);
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
      setIsGeneratingCurriculum(false);
    }
  };

  const handleCloseCurriculumDialog = () => {
    setShowCurriculumDialog(false);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              label="What do you want to learn?"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={handleInputChange('description')}
              required
              placeholder="e.g., I want to learn React.js to build modern web applications with focus on hooks, state management, and best practices..."
              helperText="Be specific about your learning goals - the AI will create a personalized curriculum based on this"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <LightbulbIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={handleInputChange('category')}
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  </InputAdornment>
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{category.icon}</span>
                      <Typography>{category.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              How important is this goal?
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {priorities.map((priority) => (
                <Grid item xs={12} sm={6} key={priority.value}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: 2,
                      borderColor: formData.priority === priority.value ? priority.color : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Chip 
                          label={priority.label}
                          sx={{ 
                            bgcolor: alpha(priority.color, 0.1),
                            color: priority.color,
                            fontWeight: 600
                          }}
                        />
                        {formData.priority === priority.value && (
                          <CheckIcon sx={{ color: priority.color }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {priority.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <DatePicker
              label="Target Completion Date (Optional)"
              value={formData.targetDate}
              onChange={handleDateChange}
              minDate={new Date()}
              sx={{ width: '100%' }}
            />
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Tags (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add tags to organize your goals
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  label="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="e.g., javascript, frontend"
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TagIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  color="primary"
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:disabled': { bgcolor: 'action.disabledBackground' }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            <TextField
              label="Additional Notes (Optional)"
              multiline
              rows={3}
              fullWidth
              value={formData.notes}
              onChange={handleInputChange('notes')}
              placeholder="Any specific requirements, preferences, or context for your learning goal..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <NotesIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      
      case 3:
        const selectedCategory = categories.find(cat => cat.value === formData.category);
        const selectedPriority = priorities.find(pri => pri.value === formData.priority);
        
        return (
          <Box>
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              icon={<AutoAwesomeIcon />}
            >
              Your personalized AI curriculum will be generated after submission!
            </Alert>

            <Card sx={{ bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Goal Summary
                </Typography>
                
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <DescriptionIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Learning Goal"
                      secondary={formData.description || 'Not specified'}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CategoryIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Category"
                      secondary={
                        <Chip
                          label={selectedCategory?.label}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(selectedCategory?.color || '#000', 0.1),
                            color: selectedCategory?.color
                          }}
                          icon={<span style={{ marginLeft: 8 }}>{selectedCategory?.icon}</span>}
                        />
                      }
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <FlagIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Priority"
                      secondary={
                        <Chip
                          label={selectedPriority?.label}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(selectedPriority?.color || '#000', 0.1),
                            color: selectedPriority?.color
                          }}
                        />
                      }
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                  
                  {formData.targetDate && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <ScheduleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Target Date"
                        secondary={formData.targetDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                  )}
                  
                  {formData.tags.length > 0 && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <TagIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tags"
                        secondary={
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {formData.tags.map((tag, index) => (
                              <Chip key={index} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
                        }
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <ToastContainer position="top-right" />
        
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Create Your Learning Goal
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Define what you want to learn and let AI create your personalized curriculum
          </Typography>
        </Box>

        {/* Tips Section */}
        <Collapse in={showTips}>
          <Paper sx={{ p: 3, mb: 4, bgcolor: alpha('#6366f1', 0.05), border: `1px solid ${alpha('#6366f1', 0.2)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TipsIcon sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Tips for Better Results
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setShowTips(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <List dense>
              {learningTips.map((tip, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Collapse>

        {submissionStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submissionMessage}
          </Alert>
        )}

        {/* Stepper */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: activeStep >= index ? 'primary.main' : 'action.disabledBackground',
                        color: 'white',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {React.createElement(step.icon, { fontSize: 'small' })}
                    </Box>
                  )}
                >
                  <Typography variant="h6" sx={{ fontWeight: activeStep === index ? 600 : 400 }}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 3 }}>
                    {getStepContent(index)}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {index > 0 && (
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={isSubmitting}
                      >
                        Back
                      </Button>
                    )}
                    {index < steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={index === 0 && !formData.description.trim()}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.description.trim()}
                        sx={{ 
                          minWidth: 200,
                          background: 'linear-gradient(45deg, #6366f1 30%, #818cf8 90%)',
                          boxShadow: '0 3px 5px 2px rgba(99, 102, 241, .3)',
                        }}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SchoolIcon />}
                      >
                        {isSubmitting ? 'Generating AI Curriculum...' : 'Submit & Generate Curriculum'}
                      </Button>
                    )}
                    {index === steps.length - 1 && (
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/dashboard')}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Curriculum Dialog */}
        <Dialog
          open={showCurriculumDialog}
          onClose={handleCloseCurriculumDialog}
          maxWidth="lg"
          fullWidth
          scroll="paper"
          PaperProps={{
            sx: { 
              maxHeight: '90vh',
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Your AI-Generated Learning Curriculum
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Personalized learning path created just for you
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseCurriculumDialog}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {curriculum ? (
              <Box
                sx={{
                  '& h2': { 
                    color: 'primary.main', 
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    paddingBottom: '12px',
                    marginBottom: '20px' 
                  },
                  '& h3': { 
                    color: 'primary.dark',
                    marginTop: '32px',
                    marginBottom: '16px'
                  },
                  '& h4': { 
                    color: 'primary.main',
                    marginTop: '24px',
                    marginBottom: '12px'
                  },
                  '& p': { 
                    marginBottom: '20px',
                    lineHeight: 1.8 
                  },
                  '& ul, & ol': { 
                    marginBottom: '20px',
                    paddingLeft: '28px',
                    background: '#f8fafc',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  },
                  '& li': { 
                    marginBottom: '12px',
                    lineHeight: 1.7
                  },
                  '& strong': {
                    color: 'text.primary',
                    fontWeight: 600
                  }
                }}
                dangerouslySetInnerHTML={{ 
                  __html: formatCurriculum(curriculum) 
                }}
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress size={48} />
                <Typography variant="h6" sx={{ mt: 3 }}>
                  Generating your personalized curriculum...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This may take 15-30 seconds
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={handleCloseCurriculumDialog} 
              color="primary"
              variant="outlined"
              size="large"
            >
              Close
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/dashboard')}
              color="primary"
              size="large"
              sx={{ 
                background: 'linear-gradient(45deg, #6366f1 30%, #818cf8 90%)',
                boxShadow: '0 3px 5px 2px rgba(99, 102, 241, .3)',
              }}
            >
              Go to Dashboard
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}

export default SubmitGoal;