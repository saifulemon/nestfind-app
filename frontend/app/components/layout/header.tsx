// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '~/hooks/useAuth';
import { Sheet } from '~/components/ui/sheet';
import NotificationBell from '~/components/shared/NotificationBell';

function getAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith('/') ? url : '/' + url;
}

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarUrl = getAvatarUrl(user?.avatarUrl);
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  const navLinkClass = 'text-[14px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block';
  const mobileNavLinkClass = 'text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block';

  return (
    <header className="border-b border-white/[0.08] bg-[#0B0F1A]">
      <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-[24px] sm:px-[48px]">
        <Link to="/" className="text-[20px] font-bold bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] bg-clip-text text-transparent">
          NestFind
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link to="/search" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
            Browse
          </Link>
          <Link to="/#how-it-works" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
            How It Works
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
                Favorites
              </Link>
              <Link to="/inquiries" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
                Inquiries
              </Link>
              <Link to="/recommendations" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
                For You
              </Link>
              <Link to="/saved-searches" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
                Saved
              </Link>
              <Link to="/map-search" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
                Map
              </Link>
              <Link to="/tours" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
                Tours
              </Link>
              <Link to="/messages" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
                Messages
              </Link>
              <Link to="/applications" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
                Applications
              </Link>
              <NotificationBell />
              <Link to="/profile" className="flex items-center gap-2 no-underline group">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center transition-all group-hover:shadow-[0_0_12px_rgba(74,144,217,0.3)]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[12px] font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center font-semibold cursor-pointer border-none no-underline bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white h-[36px] px-[16px] rounded-[8px] text-[13px] hover:-translate-y-[1px] transition-all">
                Join Now
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="sm:hidden w-10 h-10 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile nav sheet */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <div className="p-4 space-y-1">
          {isAuthenticated && (
            <div className="flex items-center gap-3 px-4 py-4 mb-2 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[14px] font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#F1F5F9] truncate">{displayName}</p>
                <p className="text-[12px] text-[#64748B] truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <Link to="/search" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
            Browse
          </Link>
          <Link to="/#how-it-works" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
            How It Works
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                Favorites
              </Link>
              <Link to="/inquiries" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                Inquiries
              </Link>
              <Link to="/recommendations" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                For You
              </Link>
              <Link to="/saved-searches" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                Saved Searches
              </Link>
              <Link to="/map-search" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                Map Search
              </Link>
              <Link to="/tours" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                My Tours
              </Link>
              <Link to="/messages" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                Messages
              </Link>
              <Link to="/applications" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                Applications
              </Link>
              <Link to="/profile" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                Join Now
              </Link>
            </>
          )}
        </div>
      </Sheet>
    </header>
  );
}
