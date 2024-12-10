// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PatientDashboard from './pages/PatientDashBoard';
import TherapistDashboard from './pages/TherapistDashBoard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { RoleProvider } from './components/RoleProvider';
import SignUp from './components/Signup';
import Login from './components/Login';
import TherapistSetup from './components/TherapistSetup';
import SupervisorInfo from './components/SupervisorInfo'; // import SupervisorInfo
import Questionnaire from './components/Questionnarie';
import './App.css';

const App = () => {
  return (
    <RoleProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

          {/* Supervisor Info Route */}
          <Route path="/supervisor-info" element={<SupervisorInfo />} /> {/* Add Supervisor Info route */}

          {/* Protected Route for the Questionnaire */}
          <Route
            path="/questionnaire"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Questionnaire />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes for Dashboards */}
          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Route for the Therapist-Setup */}
          <Route
            path="/therapist-setup"
            element={
              <ProtectedRoute allowedRoles={['therapist']}>
                <TherapistSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/therapist-dashboard"
            element={
              <ProtectedRoute allowedRoles={['therapist']}>
                <TherapistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </RoleProvider>
  );
};

export default App;
