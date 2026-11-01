import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Helper to retrieve authenticated token & user from storage
 */
export const getAuthSession = () => {
  try {
    const token =
      sessionStorage.getItem('token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('customer_token');

    let user = null;
    const rawUser =
      sessionStorage.getItem('user') ||
      localStorage.getItem('user') ||
      localStorage.getItem('admin_user') ||
      localStorage.getItem('customer_user');

    if (rawUser) {
      user = JSON.parse(rawUser);
    }

    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

/**
 * ProtectedRoute component
 * Ensures the user is logged in, and optionally matches required role(s)
 * @param {Array<string>} allowedRoles e.g. ['admin'] or ['customer', 'admin']
 */
export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const { token, user } = getAuthSession();

  // 1. Check if authenticated
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check role authorization if restricted
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = (user.role || 'customer').toLowerCase();
    const hasRole = allowedRoles.map((r) => r.toLowerCase()).includes(userRole);

    if (!hasRole) {
      // Role mismatch: redirect to their appropriate home
      if (userRole === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
      }
      return <Navigate to="/home" replace />;
    }
  }

  return <Outlet />;
};

/**
 * PublicOnlyRoute component
 * Redirects logged-in users away from /login, /register, and / to their respective dashboard
 */
export const PublicOnlyRoute = () => {
  const { token, user } = getAuthSession();

  if (token && user) {
    const userRole = (user.role || 'customer').toLowerCase();
    if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

