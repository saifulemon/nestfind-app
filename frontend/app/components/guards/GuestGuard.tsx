import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import { getHomeRouteForRole } from '~/utils/getHomeRouteForRole';
import { Loader2 } from 'lucide-react';

export function GuestGuard() {
  const { isAuthenticated, authChecked, user } = useAuth();
  const [searchParams] = useSearchParams();

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      return <Navigate to={returnUrl} replace />;
    }
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return <Outlet />;
}
