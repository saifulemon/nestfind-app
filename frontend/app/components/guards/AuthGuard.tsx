import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, authChecked } = useAuth();
  const location = useLocation();

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = location.pathname + location.search + location.hash;
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
