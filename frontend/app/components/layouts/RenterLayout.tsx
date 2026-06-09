// @ts-nocheck
import { useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import Header from '~/components/layout/header';
import { Loader2 } from 'lucide-react';
import { RoleEnum } from '~/enums/role.enum';

const routeAccess: Record<string, Array<string | number>> = {
  '/search': [RoleEnum.RENTER, RoleEnum.ADMIN],
  '/favorites': [RoleEnum.RENTER],
  '/inquiries': [RoleEnum.RENTER],
  '/profile': [RoleEnum.RENTER, RoleEnum.ADMIN],
};

export default function RenterLayout() {
  const { isAuthenticated, authChecked, user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authChecked && !isAuthenticated && !isLoading) {
      const returnUrl = location.pathname + location.search + location.hash;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`, { replace: true });
    }
  }, [authChecked, isAuthenticated, isLoading, navigate, location]);

  if (!authChecked || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const currentPath = '/' + location.pathname.split('/').filter(Boolean)[0];
  const allowedRoles = routeAccess[currentPath];
  if (allowedRoles && !allowedRoles.map(String).includes(String(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0B0F1A] text-[#F1F5F9]">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-white/[0.06] bg-[#080C14]">
        <div className="max-w-[1440px] mx-auto px-[24px] sm:px-[48px] py-[24px] flex flex-col sm:flex-row items-center justify-between gap-[12px]">
          <Link to="/" className="text-[14px] font-bold bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] bg-clip-text text-transparent no-underline">
            NestFind
          </Link>
          <p className="text-[12px] text-[#64748B]">
            &copy; {new Date().getFullYear()} NestFind. All rights reserved.
          </p>
          <div className="flex items-center gap-[20px]">
            <Link to="/search" className="text-[12px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors">Browse</Link>
            <Link to="/profile" className="text-[12px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
