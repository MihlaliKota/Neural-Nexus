// frontend/src/components/Dashboard/Dashboard.js
import React from 'react';
import { Typography, Container, Card, CardContent, Grid, LinearProgress, Button, Box } from '@mui/material';

function Dashboard() {
  // Dummy data for learning paths (replace with actual data later)
  const learningPaths = [
    {
      title: 'Web Development Mastery',
      description: 'Full-stack development from basics to advanced',
      duration: '6 months',
      students: '2,456 students',
      progress: 42,
    },
    {
      title: 'Data Science Foundations',
      description: 'From statistics to machine learning',
      duration: '8 months',
      students: '1,892 students',
      progress: 15,
    },
    {
      title: 'Mobile App Development',
      description: 'Build native and cross-platform mobile apps',
      duration: '6 months',
      students: '1,567 students',
      progress: 0,
    },
    {
      title: 'DevOps Engineering',
      description: 'Master CI/CD, containerization, and cloud deployment',
      duration: '8 months',
      students: '1,245 students',
      progress: 0,
    },
    {
      title: 'UI/UX Design',
      description: 'Design beautiful and functional user interfaces',
      duration: '5 months',
      students: '1,876 students',
      progress: 0,
    },
    // Add more learning paths as needed
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Learning Paths
        </Typography>
        <Button variant="contained" color="primary">
          + Create Custom Path
        </Button>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" size="small" sx={{ mr: 1 }}>All Paths</Button>
        <Button variant="outlined" size="small" sx={{ mr: 1 }}>Enrolled</Button>
        <Button variant="outlined" size="small">Recommended</Button>
      </Box>
      <Grid container spacing={3}>
        {learningPaths.map((path, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <Typography variant="h6" gutterBottom>
                    {path.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {path.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {path.duration} | {path.students}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      Your progress
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {path.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={path.progress} />
                </div>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary">
                    {path.progress > 0 ? 'Continue Learning' : 'Enroll'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Dashboard;