// @ts-nocheck
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';

interface RoleGuardProps {
  allowedRoles: Array<string | number>;
  children?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = allowedRoles.map(String).includes(String(user.role));
  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
