// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeOff, Zap, Heart, MapPin, Menu, Calendar, MessageSquare, ClipboardList, Star, Bell, Bookmark, Search, ClipboardCheck } from 'lucide-react';
import { useAuth } from '~/hooks/useAuth';
import NotificationBell from '~/components/shared/NotificationBell';
import RecentlyViewedStrip from '~/components/shared/RecentlyViewedStrip';
import RecommendationSection from '~/components/shared/RecommendationSection';
import { RoleEnum } from '~/enums/role.enum';
import { useAddFavorite, useRemoveFavorite } from '~/hooks/api/useFavorites';
import { Sheet } from '~/components/ui/sheet';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

const HOW_IT_WORKS_STEPS = [
  { num: '1', title: 'Search & Filter', desc: 'Enter your preferred location and refine by price, beds, and property type. Results update instantly.', Icon: Search },
  { num: '2', title: 'Explore & Save', desc: 'Browse photos, check amenities, view locations on the map, and save favorites with one click.', Icon: Heart },
  { num: '3', title: 'Connect & Tour', desc: 'Message landlords directly, schedule in-person or virtual tours, and read verified renter reviews.', Icon: Calendar },
  { num: '4', title: 'Apply & Move', desc: 'Submit your rental application, track its status, and get notified when it is approved.', Icon: ClipboardCheck },
];

const CHIP_LABELS = ['Apartments', 'Houses', 'Condos', 'Pet-Friendly', 'Under $2,000'] as const;

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #1e3a5f, #2d1b69)',
  'linear-gradient(135deg, #3d266b, #1a3a5c)',
  'linear-gradient(135deg, #1a3a5c, #3d266b)',
];

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  condo: 'Condo',
  townhouse: 'Townhouse',
  house: 'House',
};

const FOOTER_COLUMNS = [
  {
    title: 'Discover',
    links: [
      { label: 'Browse Properties', to: '/search' },
      { label: 'Map Search', to: '/map-search' },
      { label: 'How It Works', href: '#how-it-works' },
    ],
  },
  {
    title: 'For Renters',
    links: [
      { label: 'Favorites', to: '/favorites' },
      { label: 'Saved Searches', to: '/saved-searches' },
      { label: 'Inquiries', to: '/inquiries' },
      { label: 'Book a Tour', to: '/tours' },
      { label: 'Messages', to: '/messages' },
      { label: 'Applications', to: '/applications' },
    ],
  },
  {
    title: 'Owners',
    links: [
      { label: 'List a Property', to: '/admin/properties/new' },
      { label: 'Owner Dashboard', to: '/admin/dashboard' },
    ],
  },
];

export default function LandingPage() {
  const [searchText, setSearchText] = useState('');
  const [featured, setFeatured] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const navigate = useNavigate();

  const HERO_SLIDES = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80',
  ];

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleChipClick = (label: string) => {
    setSearchText(label);
  };

  const toggleFav = (propertyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
        removeFavorite.mutate(propertyId);
      } else {
        next.add(propertyId);
        addFavorite.mutate(propertyId);
      }
      return next;
    });
  };

  // Seed favoritedIds from user's favorites on mount (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setFavoritedIds(new Set());
      return;
    }
    fetch(`${API_BASE}/favorites`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((json) => {
        const items = json?.data?.items ?? [];
        const ids = new Set(items.map((f: any) => f.propertyId || f.property?.id).filter(Boolean));
        setFavoritedIds(ids);
      })
      .catch(() => setFavoritedIds(new Set()));
  }, [isAuthenticated]);

  useEffect(() => {
    fetch(`${API_BASE}/properties?sortBy=createdAt&sortOrder=DESC&limit=6`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => setFeatured(json?.data?.items ?? []))
      .catch(() => setFeatured([]))
      .finally(() => setFeaturedLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#F1F5F9]">
      {/* Nav — transparent at top, fixed dark on scroll */}
      <nav className={`fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${scrolled ? 'bg-[#0B0F1A]/95 backdrop-blur-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-transparent'}`}>
        <div className="max-w-[1440px] mx-auto flex justify-between items-center px-[24px] sm:px-[48px] py-[16px]">
          <div className="text-[24px] font-bold bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] bg-clip-text text-transparent">
            NestFind
          </div>
          {/* Desktop links */}
          <div className="hidden lg:flex gap-[32px] items-center">
            <Link to="/search" className={`no-underline text-[14px] font-medium transition-colors ${scrolled ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-white/80 hover:text-white'}`}>
              Browse
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/favorites" className={`no-underline text-[14px] font-medium transition-colors ${scrolled ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-white/80 hover:text-white'}`}>
                  Favorites
                </Link>
                <Link to="/inquiries" className={`no-underline text-[14px] font-medium transition-colors ${scrolled ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-white/80 hover:text-white'}`}>
                  Inquiries
                </Link>
                <Link to="/recommendations" className={`no-underline text-[14px] font-medium transition-colors ${scrolled ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-white/80 hover:text-white'}`}>
                  For You
                </Link>
                <Link to="/saved-searches" className={`no-underline text-[14px] font-medium transition-colors ${scrolled ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-white/80 hover:text-white'}`}>
                  Saved
                </Link>
                <Link to="/map-search" className={`no-underline text-[14px] font-medium transition-colors ${scrolled ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-white/80 hover:text-white'}`}>
                  Map
                </Link>
                <Link to="/tours" className={`no-underline text-[14px] font-medium transition-colors ${scrolled ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-white/80 hover:text-white'}`}>
                  Tours
                </Link>
                <Link to="/messages" className={`no-underline text-[14px] font-medium transition-colors ${scrolled ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-white/80 hover:text-white'}`}>
                  Messages
                </Link>
                <Link to="/applications" className={`no-underline text-[14px] font-medium transition-colors ${scrolled ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-white/80 hover:text-white'}`}>
                  Applications
                </Link>
                <NotificationBell />
                <Link to="/profile" className="flex items-center gap-2 no-underline group">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center transition-all group-hover:shadow-[0_0_12px_rgba(74,144,217,0.3)]">
                    {user?.avatarUrl ? (
                      <img src={(user.avatarUrl.startsWith('/') ? user.avatarUrl : '/' + user.avatarUrl)} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[12px] font-bold text-white">{(user?.name || 'User').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className={`inline-flex items-center justify-center font-semibold cursor-pointer border-none no-underline h-[40px] px-[16px] rounded-[8px] text-[14px] transition-colors ${scrolled ? 'bg-white/5 text-[#F1F5F9] hover:bg-white/10' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Sign In
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center font-semibold cursor-pointer border-none no-underline bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white h-[48px] px-[24px] rounded-[12px] text-[14px] hover:-translate-y-[1px]">
                  Join Now
                </Link>
              </>
            )}
          </div>
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={`lg:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${scrolled ? 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile nav sheet for landing */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <div className="p-4 space-y-1">
          {isAuthenticated && (
            <div className="flex items-center gap-3 px-4 py-4 mb-2 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center shrink-0">
                {user?.avatarUrl ? (
                  <img src={(user.avatarUrl.startsWith('/') ? user.avatarUrl : '/' + user.avatarUrl)} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[14px] font-bold text-white">{(user?.name || 'User').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#F1F5F9] truncate">{(user?.name || user?.email?.split('@')[0] || 'User')}</p>
                <p className="text-[12px] text-[#64748B] truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <Link to="/search" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
            Browse
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                Favorites
              </Link>
              <Link to="/inquiries" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                Inquiries
              </Link>
              <Link to="/recommendations" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                For You
              </Link>
              <Link to="/saved-searches" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                Saved
              </Link>
              <Link to="/map-search" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                Map
              </Link>
              <Link to="/tours" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                Tours
              </Link>
              <Link to="/messages" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                Messages
              </Link>
              <Link to="/applications" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                Applications
              </Link>
              <div className="px-4 py-3" onClick={() => setMenuOpen(false)}>
                <NotificationBell />
              </div>
              <Link to="/profile" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="text-[16px] text-[#94A3B8] no-underline font-medium hover:text-[#F1F5F9] transition-colors py-3 px-4 rounded-lg hover:bg-white/5 block" onClick={() => setMenuOpen(false)}>
                Join Now
              </Link>
            </>
          )}
        </div>
      </Sheet>

      {/* Hero — full viewport width with slider */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-[24px] sm:px-[48px] overflow-hidden">
        {/* Background slider */}
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt="Luxury building"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#0B0F1A]/60" />
          {/* Bottom gradient fade into page */}
          <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-[#0B0F1A] to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-[900px] mx-auto">
          <h1 className="text-[42px] sm:text-[56px] md:text-[72px] font-bold leading-[1.05] mb-[24px] tracking-[-0.02em] text-white">
            Find Your{' '}
            <span className="bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] bg-clip-text text-transparent">
              Perfect Nest
            </span>
            ,<br />
            Without the Noise
          </h1>
          <p className="text-[#94A3B8] text-[16px] sm:text-[18px] max-w-[520px] mx-auto mb-[40px]">
            Browse thousands of verified rental properties. Clean, ad-free, and focused on what matters &mdash; finding your next home.
          </p>

          {/* Search bar */}
          <div className="flex max-w-[640px] mx-auto gap-0">
            <input
              type="text"
              placeholder="Enter city, neighborhood, or ZIP code..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="flex-1 h-[56px] bg-white/10 backdrop-blur-[12px] border border-white/20 border-r-0 rounded-l-[12px] px-[20px] text-[#F1F5F9] text-[16px] outline-none focus:border-[rgba(74,144,217,0.5)] placeholder:text-[#94A3B8]"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center justify-center font-semibold cursor-pointer border-none no-underline bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white h-[56px] px-[20px] sm:px-[32px] rounded-r-[12px] text-[14px] sm:text-[16px] hover:-translate-y-[1px] shrink-0"
            >
              <span className="hidden sm:inline">Search Properties</span>
              <span className="sm:hidden">Search</span>
            </button>
          </div>

          {/* Chips */}
          <div className="flex gap-[8px] justify-center mt-[24px] flex-wrap">
            {CHIP_LABELS.map((label) => (
              <span
                key={label}
                onClick={() => handleChipClick(label)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleChipClick(label); }}
                role="button"
                tabIndex={0}
                className="px-[16px] py-[8px] bg-white/10 backdrop-blur-[8px] border border-white/20 rounded-full text-[13px] text-[#F1F5F9] cursor-pointer hover:bg-white/20 hover:text-white transition-colors"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Slider dots — bottom right */}
        <div className="absolute bottom-[32px] right-[24px] sm:right-[48px] z-10 flex gap-[10px]">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentSlide(i)}
              className={`w-[10px] h-[10px] rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Content sections — back in container */}
      <div className="max-w-[1440px] mx-auto">
        <section id="how-it-works" className="px-[24px] sm:px-[48px] py-[80px]">
          {/* Section header */}
          <div className="text-center max-w-[640px] mx-auto mb-[64px]">
            <div className="inline-flex items-center gap-[8px] px-[14px] py-[6px] rounded-full bg-[rgba(74,144,217,0.1)] border border-[rgba(74,144,217,0.2)] text-[#4A90D9] text-[12px] font-semibold uppercase tracking-[0.08em] mb-[16px]">
              <Zap className="w-[14px] h-[14px]" />
              How It Works
            </div>
            <h2 className="text-[32px] sm:text-[40px] font-bold mb-[16px] tracking-[-0.02em] leading-[1.15]">
              Your next home in{' '}
              <span className="bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] bg-clip-text text-transparent">
                4 simple steps
              </span>
            </h2>
            <p className="text-[#94A3B8] text-[16px] sm:text-[18px] leading-relaxed">
              From search to signed lease — NestFind streamlines every part of your rental journey.
            </p>
          </div>

          {/* Steps */}
          <div className="relative max-w-[1100px] mx-auto">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-[40px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-[#4A90D9]/30 via-[#7C3AED]/30 to-[#4A90D9]/30" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[32px] lg:gap-[24px]">
              {HOW_IT_WORKS_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className="relative group"
                >
                  <div className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[16px] p-[28px] text-center transition-all duration-300 hover:border-[rgba(74,144,217,0.3)] hover:shadow-[0_0_30px_rgba(74,144,217,0.1)] hover:-translate-y-[4px] hover:bg-white/[0.06]">
                    {/* Step number badge */}
                    <div className="relative inline-flex items-center justify-center w-[56px] h-[56px] rounded-[16px] bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] mb-[20px] shadow-[0_8px_24px_rgba(74,144,217,0.25)] group-hover:shadow-[0_12px32px_rgba(74,144,217,0.35)] group-hover:scale-105 transition-all duration-300">
                      <step.Icon className="w-[24px] h-[24px] text-white" strokeWidth={2} />
                      <span className="absolute -top-[8px] -right-[8px] w-[24px] h-[24px] rounded-full bg-[#0B0F1A] border border-white/10 flex items-center justify-center text-[11px] font-bold text-[#4A90D9]">
                        {step.num}
                      </span>
                    </div>

                    <h4 className="text-[18px] font-semibold mb-[10px] tracking-[-0.01em]">{step.title}</h4>
                    <p className="text-[#94A3B8] text-[14px] leading-[1.6]">{step.desc}</p>
                  </div>

                  {/* Arrow connector on mobile/tablet between cards */}
                  {i < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="flex lg:hidden items-center justify-center py-[12px]">
                      <div className="w-[2px] h-[24px] bg-gradient-to-b from-[#4A90D9]/40 to-[#7C3AED]/40 rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-[48px]">
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-[8px] font-semibold cursor-pointer border-none no-underline bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white h-[52px] px-[32px] rounded-[12px] text-[15px] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-[1px] transition-all"
            >
              <Search className="w-[18px] h-[18px]" />
              Start Your Search
            </Link>
          </div>
        </section>

        <section className="px-[24px] sm:px-[48px] py-[64px]">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4A90D9] mb-[8px]">
            Featured Properties
          </div>
          <h2 className="text-[36px] font-bold mb-[16px] tracking-[-0.02em]">
            Homes you might love
          </h2>
          <p className="text-[#94A3B8] text-[16px] max-w-[560px] mb-[48px]">
            Hand-picked listings from our curated collection.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            {featuredLoading ? (
              <p className="text-[#64748B] text-[14px] col-span-full text-center py-[40px]">Loading featured properties...</p>
            ) : featured.length === 0 ? (
              <p className="text-[#64748B] text-[14px] col-span-full text-center py-[40px]">No featured properties available.</p>
            ) : (
              featured.map((prop, i) => {
                const addr = prop.address || {};
                const typeLabel = PROPERTY_TYPE_LABELS[prop.propertyType] || prop.propertyType || 'Property';
                const photoUrl = prop.primaryPhoto?.url || prop.photos?.[0]?.url;
                const photos = photoUrl ? (photoUrl.startsWith('http') ? photoUrl : '/' + photoUrl) : null;
                return (
                  <Link
                    key={prop.id}
                    to={`/property/${prop.id}`}
                    className="bg-white/[0.04] backdrop-blur-[12px] border border-white/10 rounded-[12px] overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,144,217,0.15)] hover:-translate-y-[2px] no-underline text-inherit block"
                  >
                    <div className="relative">
                      <div
                        className="h-[200px] bg-cover bg-center flex items-center justify-center text-[48px] text-white/10"
                        style={
                          photos
                            ? { backgroundImage: `url(${photos})` }
                            : { background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }
                        }
                      >
                        {!photos && (prop.propertyType === 'house' ? '🏡' : prop.propertyType === 'condo' ? '🏢' : '🏠')}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => toggleFav(prop.id, e)}
                        className="absolute top-[12px] right-[12px] w-[40px] h-[40px] rounded-full flex items-center justify-center cursor-pointer border border-white/20 bg-black/30 backdrop-blur-[10px] transition-all duration-200 hover:scale-110 hover:bg-black/50 hover:shadow-[0_0_15px_rgba(248,113,113,0.3)] active:scale-90"
                        aria-label={favoritedIds.has(prop.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart
                          className={`w-[18px] h-[18px] transition-all duration-300 ${favoritedIds.has(prop.id) ? 'scale-110' : ''}`}
                          fill={favoritedIds.has(prop.id) ? '#F87171' : 'none'}
                          stroke={favoritedIds.has(prop.id) ? '#F87171' : '#ffffff'}
                          strokeWidth={favoritedIds.has(prop.id) ? 0 : 1.5}
                        />
                        {favoritedIds.has(prop.id) && (
                          <span className="absolute inset-0 rounded-full animate-ping bg-[rgba(248,113,113,0.15)]" />
                        )}
                      </button>
                    </div>
                    <div className="p-[20px]">
                      <span className="inline-block px-[10px] py-[2px] rounded-full text-[11px] font-semibold mb-[8px] text-[#4ADE80] bg-[rgba(74,222,128,0.1)] shadow-[0_0_8px_rgba(74,222,128,0.2)]">
                        Available Now
                      </span>
                      <h3 className="text-[16px] font-semibold text-[#F1F5F9] mb-[6px] truncate leading-[1.3]">
                        {prop.title}
                      </h3>
                      <div className="text-[22px] font-bold">
                        ${prop.price?.toLocaleString()}
                        <span className="text-[14px] font-normal text-[#94A3B8]">/mo</span>
                      </div>
                      <div className="text-[#94A3B8] text-[14px] mt-[4px] mb-[8px]">
                        {addr.street || prop.addressStreet}, {addr.city || prop.addressCity}, {addr.state || prop.addressState}
                      </div>
                      <div className="flex gap-[16px] text-[13px] text-[#64748B]">
                        <span>{prop.bedrooms} {prop.bedrooms === 1 ? 'bd' : 'bd'}</span>
                        <span>{prop.bathrooms} {prop.bathrooms === 1 ? 'ba' : 'ba'}</span>
                        {prop.squareFeet && <span>{prop.squareFeet.toLocaleString()} sqft</span>}
                        <span>{typeLabel}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {isAuthenticated && <RecentlyViewedStrip />}
        {isAuthenticated && <RecommendationSection />}

        <section className="px-[24px] sm:px-[48px] py-[64px]">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4A90D9] mb-[8px]">
            Why NestFind
          </div>
          <h2 className="text-[36px] font-bold mb-[16px] tracking-[-0.02em]">
            Built for renters, not advertisers
          </h2>
          <p className="text-[#94A3B8] text-[16px] max-w-[560px] mb-[48px]">
            We focused on what actually matters when finding a rental.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            {[
              { title: 'Ad-Free Browsing', desc: 'No sponsored listings cluttering your search. Every result is organic.', Icon: EyeOff },
              { title: 'Instant Filters', desc: 'Real-time filtering by price, beds, and type. No page reloads.', Icon: Zap },
              { title: 'Quick Favorites', desc: 'Save properties with one click. Access your favorites from anywhere.', Icon: Heart },
              { title: 'Map View', desc: 'See exactly where each property is. Integrated Google Maps on every listing.', Icon: MapPin },
              { title: 'Direct Messaging', desc: 'Chat with landlords in real time. No phone calls or emails needed.', Icon: MessageSquare },
              { title: 'Tour Scheduling', desc: 'Book in-person or virtual tours with available time slots.', Icon: Calendar },
              { title: 'Verified Reviews', desc: 'Read honest reviews from verified renters who have lived there.', Icon: Star },
              { title: 'Smart Notifications', desc: 'Get alerts for new listings, replies, and application updates.', Icon: Bell },
            ].map((feat) => (
              <div key={feat.title} className="text-center p-[24px]">
                <div className="w-[48px] h-[48px] rounded-[12px] bg-[rgba(74,144,217,0.1)] flex items-center justify-center mx-auto mb-[12px] text-[#4A90D9]">
                  <feat.Icon className="w-[24px] h-[24px]" strokeWidth={2} />
                </div>
                <h4 className="text-[16px] font-semibold mb-[6px]">{feat.title}</h4>
                <p className="text-[#94A3B8] text-[13px]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 bg-[#080C14]">
          <div className="max-w-[1440px] mx-auto px-[24px] sm:px-[48px] py-[48px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-[32px]">
              {/* Brand */}
              <div className="md:col-span-2 lg:col-span-2">
                <Link to="/" className="text-[20px] font-bold bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] bg-clip-text text-transparent no-underline">
                  NestFind
                </Link>
                <p className="text-[14px] text-[#64748B] mt-[12px] max-w-[320px] leading-relaxed">
                  Discover your perfect rental home. Browse verified properties, connect with landlords, and move in with confidence.
                </p>
              </div>

              {/* Links */}
              {FOOTER_COLUMNS
                .filter((col) => col.title !== 'Owners' || user?.role === RoleEnum.ADMIN)
                .map((col) => (
                  <div key={col.title}>
                    <h5 className="text-[12px] font-semibold uppercase tracking-[0.08em] mb-[16px] text-[#F1F5F9]">
                      {col.title}
                    </h5>
                    <ul className="space-y-[10px]">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          {link.to ? (
                            <Link
                              to={link.to}
                              className="text-[14px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors"
                            >
                              {link.label}
                            </Link>
                          ) : (
                            <a
                              href={link.href}
                              className="text-[14px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors"
                            >
                              {link.label}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>

            {/* Bottom bar */}
            <div className="mt-[40px] pt-[24px] border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-[12px]">
              <p className="text-[12px] text-[#64748B]">
                &copy; {new Date().getFullYear()} NestFind. All rights reserved.
              </p>
              <div className="flex items-center gap-[24px]">
                <Link to="/search" className="text-[12px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors">Browse</Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/favorites" className="text-[12px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors">Favorites</Link>
                    <Link to="/profile" className="text-[12px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors">Profile</Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-[12px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors">Sign In</Link>
                    <Link to="/register" className="text-[12px] text-[#64748B] no-underline hover:text-[#4A90D9] transition-colors">Join Now</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
