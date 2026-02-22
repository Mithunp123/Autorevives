import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { PageLoader } from '@/components/ui';

/**
 * ProtectedRoute — requires authentication.
 * If roles is specified, restricts to those roles only (RBAC).
 */
export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * PublicRoute — redirects to dashboard if already authenticated.
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) return <PageLoader />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
