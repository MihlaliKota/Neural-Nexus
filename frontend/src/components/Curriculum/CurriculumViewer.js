import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CurriculumViewer() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [curriculumData, setCurriculumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurriculum();
  }, [goalId]);

  const fetchCurriculum = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/goals/${goalId}/curriculum`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurriculumData(response.data.data);
    } catch (error) {
      console.error('Error fetching curriculum:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load curriculum';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format curriculum for display
  const formatCurriculum = (curriculumText) => {
    if (!curriculumText) return '';
    
    let formatted = curriculumText
      .replace(/^# (.*$)/gim, '<h1 style="color: #1976d2; margin-top: 32px; margin-bottom: 20px; font-weight: bold; font-size: 2rem; border-bottom: 3px solid #1976d2; padding-bottom: 10px;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="color: #1976d2; margin-top: 28px; margin-bottom: 16px; font-weight: bold; font-size: 1.5rem;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="color: #1976d2; margin-top: 24px; margin-bottom: 12px; font-weight: bold; font-size: 1.25rem;">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 style="color: #1976d2; margin-top: 20px; margin-bottom: 8px; font-weight: bold; font-size: 1.1rem;">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #333; font-weight: 600;">$1</strong>')
      .replace(/^\* (.*$)/gim, '<li style="margin-bottom: 8px; padding-left: 8px; line-height: 1.6;">$1</li>')
      .replace(/^- (.*$)/gim, '<li style="margin-bottom: 8px; padding-left: 8px; line-height: 1.6;">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li style="margin-bottom: 8px; padding-left: 8px; line-height: 1.6; list-style-type: decimal;">$1</li>');
    
    // Wrap consecutive <li> elements in <ul> or <ol> tags
    formatted = formatted.replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, (match) => {
      if (match.includes('list-style-type: decimal')) {
        return '<ol style="margin: 16px 0; padding-left: 24px; background: #f9f9f9; padding: 16px; border-radius: 8px;">' + match + '</ol>';
      } else {
        return '<ul style="margin: 16px 0; padding-left: 24px; background: #f9f9f9; padding: 16px; border-radius: 8px;">' + match + '</ul>';
      }
    });
    
    // Handle paragraphs
    formatted = formatted
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        if (paragraph.startsWith('<h') || paragraph.startsWith('<ul') || paragraph.startsWith('<ol')) {
          return paragraph;
        }
        return `<p style="margin-bottom: 16px; line-height: 1.7; color: #444;">${paragraph}</p>`;
      })
      .join('');
    
    return formatted;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Learning Curriculum: ${curriculumData?.goalDescription}`,
          text: 'Check out my AI-generated learning curriculum!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('URL copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (!curriculumData?.curriculum) return;
    
    const element = document.createElement('a');
    const file = new Blob([curriculumData.curriculum], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `curriculum-${curriculumData.goalDescription.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Curriculum downloaded!');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        width: '100%'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <ToastContainer />
      
      {/* Full-width header with gradient background */}
      <Box 
        sx={{ 
          width: '100%',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          py: { xs: 3, sm: 4, md: 6 }
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          {/* Navigation and Title */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 },
              mb: 2 
            }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ mr: { xs: 0, sm: 2 }, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
              >
                Back to Dashboard
              </Button>
              
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon sx={{ mr: 1, color: 'primary.main', fontSize: { xs: 28, sm: 32 } }} />
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
                    }}
                  >
                    Learning Curriculum
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  AI-generated learning path for your goal
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flexDirection: { xs: 'row', sm: 'row' },
                justifyContent: { xs: 'flex-start', sm: 'flex-end' }
              }}>
                <Tooltip title="Print Curriculum">
                  <IconButton onClick={handlePrint} color="primary" size="small">
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share Curriculum">
                  <IconButton onClick={handleShare} color="primary" size="small">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download as Text">
                  <IconButton onClick={handleDownload} color="primary" size="small">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Goal Info Card */}
          {curriculumData && (
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Learning Goal
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {curriculumData.goalDescription}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'center',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' }
                }}>
                  <Chip 
                    label="AI Generated" 
                    color="primary" 
                    size="small"
                    icon={<SchoolIcon />}
                  />
                  {curriculumData.generatedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Generated on {new Date(curriculumData.generatedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      {/* Curriculum Content - Full Width with Constrained Inner Content */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 4, md: 6 },
            minHeight: '60vh',
            '@media print': {
              boxShadow: 'none',
              '& .MuiButton-root': { display: 'none' }
            }
          }}
        >
          {curriculumData?.curriculum ? (
            <Box
              className="curriculum-content"
              sx={{
                maxWidth: '900px', // Optimal reading width
                margin: '0 auto', // Center the content
                '& h1': { 
                  color: 'primary.main',
                  borderBottom: '3px solid #1976d2',
                  paddingBottom: '10px',
                  marginBottom: '20px',
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  fontWeight: 'bold'
                },
                '& h2': { 
                  color: 'primary.main',
                  marginTop: '28px',
                  marginBottom: '16px',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontWeight: 'bold'
                },
                '& h3': { 
                  color: 'primary.main',
                  marginTop: '24px',
                  marginBottom: '12px',
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  fontWeight: 'bold'
                },
                '& h4': { 
                  color: 'primary.main',
                  marginTop: '20px',
                  marginBottom: '8px',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 'bold'
                },
                '& p': { 
                  marginBottom: '16px',
                  lineHeight: 1.7,
                  color: '#444',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                },
                '& ul, & ol': { 
                  marginBottom: '16px',
                  paddingLeft: { xs: '20px', sm: '24px' },
                  background: '#f9f9f9',
                  padding: { xs: '12px', sm: '16px' },
                  borderRadius: '8px'
                },
                '& li': { 
                  marginBottom: '8px',
                  lineHeight: 1.6,
                  paddingLeft: '8px',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                },
                '& strong': {
                  color: '#333',
                  fontWeight: 600
                }
              }}
              dangerouslySetInnerHTML={{ 
                __html: formatCurriculum(curriculumData.curriculum) 
              }}
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No curriculum content available
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Footer Actions - Full Width Background */}
      <Box 
        sx={{ 
          width: '100%',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(245, 158, 11, 0.02) 100%)',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          py: 4
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              size="large"
              sx={{ 
                background: 'linear-gradient(45deg, #6366f1 30%, #818cf8 90%)',
                boxShadow: '0 3px 5px 2px rgba(99, 102, 241, .3)',
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default CurriculumViewer;