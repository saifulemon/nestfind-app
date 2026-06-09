// @ts-nocheck
import { Link, Outlet } from 'react-router-dom';
import { GuestGuard } from '~/components/guards/GuestGuard';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F1A] text-[#F1F5F9]">
      <header className="border-b border-white/[0.08] bg-[#0B0F1A]">
        <div className="max-w-[1440px] mx-auto flex h-14 items-center px-[24px] sm:px-[48px]">
          <Link
            to="/"
            className="text-[18px] font-bold bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] bg-clip-text text-transparent no-underline"
          >
            NestFind
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <GuestGuard>
          <Outlet />
        </GuestGuard>
      </main>
    </div>
  );
}
