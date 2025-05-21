// frontend/src/components/Goal/SubmitGoal.js
import React, { useState } from 'react';
import { Typography, Container, TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SubmitGoal() {
  const [goalDescription, setGoalDescription] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success' or 'error'
  const [submissionMessage, setSubmissionMessage] = useState('');
  const navigate = useNavigate();

  const handleGoalDescriptionChange = (event) => {
    setGoalDescription(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmissionStatus(null); // Reset status on new submission

    const token = localStorage.getItem('token');

    if (!token) {
      setSubmissionStatus('error');
      setSubmissionMessage('Authentication token not found. Please log in again.');
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post(
        '/api/goals',
        { description: goalDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissionStatus('success');
      toast.success(response.data.message || 'Goal submitted successfully!');
      setGoalDescription(''); // Clear the input field
      setTimeout(() => {
        navigate('/dashboard'); // Assuming you have a /dashboard route
      }, 2000);
    } catch (error) {
      setSubmissionStatus('error');
      const errorMessage = error.response?.data?.message || 'Failed to submit goal.';
      setSubmissionMessage(errorMessage);
      toast.error(errorMessage);
      console.error('Error submitting goal:', error);
      console.error('Backend Error Response:', error.response?.data);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Submit Your Learning Goal
      </Typography>
      <ToastContainer />
      {submissionStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {submissionMessage}
        </Alert>
      )}
      {submissionStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submissionMessage}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Learning Goal Description"
          multiline
          rows={4}
          fullWidth
          value={goalDescription}
          onChange={handleGoalDescriptionChange}
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
          Submit Goal
        </Button>
      </Box>
    </Container>
  );
}

export default SubmitGoal;