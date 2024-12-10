// src/components/ProtectedRoute.js
import { useRole } from './RoleProvider';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = useRole();

  if (!role) {
    return <p>Loading...</p>; // Optionally redirect to login if not authenticated
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />; // Redirect if role isn't allowed
  }

  return children;
};

export default ProtectedRoute;
