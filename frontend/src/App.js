// frontend/src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import SubmitGoal from './components/Goal/SubmitGoal';
import Dashboard from './components/Dashboard/Dashboard'; // Import the Dashboard component
import { Container } from '@mui/material';

function App() {
  return (
    <Container maxWidth="sm">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/submit-goal" element={<SubmitGoal />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Add the dashboard route */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Container>
  );
}

export default App;