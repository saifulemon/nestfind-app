import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, authChecked } = useAuth();

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
