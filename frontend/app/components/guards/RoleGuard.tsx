// @ts-nocheck
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';

interface RoleGuardProps {
  allowedRoles: Array<string | number>;
  children?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    const returnUrl = location.pathname + location.search + location.hash;
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }

  const allowed = allowedRoles.map(String).includes(String(user.role));
  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
