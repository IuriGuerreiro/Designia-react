import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/state/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'seller' | 'admin';
  requiresAuth?: boolean;
}

/**
 * Route guard component to protect routes based on user roles
 *
 * @param children - The component to render if access is granted
 * @param requiredRole - Required role ('seller' or 'admin'). Sellers can access everything users can, admins can access everything.
 * @param requiresAuth - If true, user must be authenticated (default: true)
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiresAuth = true
}) => {
  const { isAuthenticated, isAdmin, isSeller, canSellProducts, isLoading } = useAuth();

  // Still loading, don't render anything yet
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check authentication requirement
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (requiredRole === 'admin') {
    // Admin-only route
    if (!isAdmin()) {
      return <Navigate to="/" replace />;
    }
  } else if (requiredRole === 'seller') {
    // Seller route (sellers and admins can access)
    if (!canSellProducts()) {
      return <Navigate to="/" replace />;
    }
  }

  // All checks passed, render the protected component
  return <>{children}</>;
};

export default RoleGuard;