// @ts-nocheck
import { Link, Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F1A] text-[#F1F5F9]">
      <header className="border-b border-white/[0.08] bg-[#0B0F1A]">
        <div className="max-w-[1440px] mx-auto flex h-16 items-center px-[24px] sm:px-[48px]">
          <Link
            to="/"
            className="text-[20px] font-bold bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] bg-clip-text text-transparent no-underline"
          >
            NestFind
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-white/[0.06] bg-[#080C14]">
        <div className="max-w-[1440px] mx-auto px-[24px] sm:px-[48px] py-[24px] flex flex-col sm:flex-row items-center justify-between gap-[12px]">
          <Link
            to="/"
            className="text-[14px] font-bold bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] bg-clip-text text-transparent no-underline"
          >
            NestFind
          </Link>
          <p className="text-[12px] text-[#64748B]">
            &copy; {new Date().getFullYear()} NestFind. All rights reserved.
          </p>
          <div className="flex items-center gap-[20px]">
            <Link
              to="/search"
              className="text-[12px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors"
            >
              Browse
            </Link>
            <Link
              to="/login"
              className="text-[12px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
