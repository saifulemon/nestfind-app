import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, BedDouble, Bath, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecentlyViewed } from '~/hooks/api/usePropertyViews';
import type { PropertyView } from '~/types/api/property-view';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #1e3a5f, #2d1b69)',
  'linear-gradient(135deg, #3d266b, #1a3a5c)',
  'linear-gradient(135deg, #1a3a5c, #3d266b)',
];

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  condo: 'Condo',
  townhouse: 'Townhouse',
  house: 'House',
};

const TYPE_COLORS: Record<string, string> = {
  apartment: 'bg-[rgba(74,144,217,0.15)] text-[#4A90D9]',
  condo: 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]',
  townhouse: 'bg-[rgba(251,191,36,0.12)] text-[#FBBF24]',
  house: 'bg-[rgba(248,113,113,0.12)] text-[#F87171]',
};

const CARD_WIDTH = 276; // 260px card + 16px gap

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function RecentlyViewedStrip() {
  const { data: views, isLoading, isError } = useRecentlyViewed(12);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  // Swipe/drag is handled natively by CSS snap-x snap-mandatory

  const validViews = useMemo(() => {
    const map = new Map<string, PropertyView>();
    for (const v of views) {
      if (!v.property) continue;
      const existing = map.get(v.propertyId);
      if (!existing) {
        map.set(v.propertyId, v);
      } else if (new Date(v.lastViewedAt) > new Date(existing.lastViewedAt)) {
        // Keep the newer one but sum view counts
        map.set(v.propertyId, {
          ...v,
          viewCount: (v.viewCount || 0) + (existing.viewCount || 0),
        });
      } else {
        // Existing is newer, just add the count
        map.set(v.propertyId, {
          ...existing,
          viewCount: (existing.viewCount || 0) + (v.viewCount || 0),
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastViewedAt).getTime() - new Date(a.lastViewedAt).getTime()
    );
  }, [views]);

  const getMetrics = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { visibleCount: 1, totalPages: 1 };
    const visibleCount = Math.max(1, Math.floor(el.clientWidth / CARD_WIDTH));
    const totalPages = Math.max(1, Math.ceil(validViews.length / visibleCount));
    return { visibleCount, totalPages };
  }, [validViews.length]);

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { visibleCount, totalPages } = getMetrics();
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    const pageWidth = visibleCount * CARD_WIDTH;
    const page = Math.round(el.scrollLeft / pageWidth);
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
    setTotalPages(totalPages);
  }, [getMetrics]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollToPage = useCallback((targetPage: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { visibleCount, totalPages } = getMetrics();
    const page = Math.max(0, Math.min(targetPage, totalPages - 1));
    const pageWidth = visibleCount * CARD_WIDTH;
    el.scrollTo({ left: page * pageWidth, behavior: 'smooth' });
  }, [getMetrics]);

  const scrollByCards = useCallback((direction: 'left' | 'right') => {
    scrollToPage(currentPage + (direction === 'left' ? -1 : 1));
  }, [currentPage, scrollToPage]);

  // Native CSS snap-x handles swipe on touch devices — no JS touch handlers needed
  // to avoid fighting with the browser's snap-mandatory scroll behaviour.

  if (isLoading) {
    return (
      <section className="px-[24px] sm:px-[48px] py-[48px]">
        <div className="flex items-center gap-[10px] mb-[24px]">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-[rgba(74,144,217,0.1)] flex items-center justify-center animate-pulse">
            <Clock className="w-[18px] h-[18px] text-[#4A90D9] opacity-50" />
          </div>
          <div className="space-y-2">
            <div className="h-[24px] w-[160px] bg-white/10 rounded animate-pulse" />
            <div className="h-[14px] w-[200px] bg-white/5 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-[16px] overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[260px] bg-white/[0.03] border border-white/[0.06] rounded-[12px] overflow-hidden animate-pulse"
            >
              <div className="h-[160px] bg-white/5" />
              <div className="p-[16px] space-y-2">
                <div className="h-[18px] w-[80px] bg-white/5 rounded" />
                <div className="h-[14px] w-[140px] bg-white/5 rounded" />
                <div className="h-[12px] w-[100px] bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) return null;

  if (validViews.length === 0) {
    return (
      <section className="px-[24px] sm:px-[48px] py-[48px]">
        <div className="flex items-center gap-[10px] mb-[16px]">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-[rgba(74,144,217,0.1)] flex items-center justify-center">
            <Clock className="w-[18px] h-[18px] text-[#4A90D9]" />
          </div>
          <div>
            <h2 className="text-[24px] font-bold tracking-[-0.02em]">Recently Viewed</h2>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[12px] p-[24px] text-center">
          <Eye className="w-[24px] h-[24px] text-[#64748B] mx-auto mb-[8px]" />
          <p className="text-[14px] text-[#94A3B8]">
            No recently viewed properties. Start browsing to see your history here.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center justify-center mt-[12px] px-[16px] h-[36px] rounded-[8px] text-[13px] font-medium bg-[rgba(74,144,217,0.1)] text-[#4A90D9] hover:bg-[rgba(74,144,217,0.2)] transition-colors no-underline"
          >
            Browse Properties
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-[24px] sm:px-[48px] py-[48px]">
      <div className="flex items-center justify-between mb-[24px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-[rgba(74,144,217,0.1)] flex items-center justify-center">
            <Clock className="w-[18px] h-[18px] text-[#4A90D9]" />
          </div>
          <div>
            <h2 className="text-[24px] font-bold tracking-[-0.02em]">Recently Viewed</h2>
            <p className="text-[13px] text-[#64748B]">Properties you checked out recently</p>
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          <Link
            to="/search"
            className="hidden sm:inline-flex items-center gap-[6px] text-[13px] font-medium text-[#4A90D9] hover:text-[#5BA0E9] transition-colors no-underline mr-[8px]"
          >
            Browse more
          </Link>
          <button
            type="button"
            onClick={() => scrollByCards('left')}
            disabled={!canScrollLeft}
            className="w-[36px] h-[36px] rounded-full border border-white/[0.1] bg-white/[0.04] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous"
          >
            <ChevronLeft className="w-[16px] h-[16px]" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards('right')}
            disabled={!canScrollRight}
            className="w-[36px] h-[36px] rounded-full border border-white/[0.1] bg-white/[0.04] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <ChevronRight className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="flex gap-[16px] overflow-x-auto pb-[12px] snap-x snap-mandatory scroll-smooth touch-pan-x cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {validViews.map((view, i) => {
            const prop = view.property!;
            const photoUrl = prop.photos?.find((p) => p.isPrimary)?.url || prop.photos?.[0]?.url;
            const photo = photoUrl ? (photoUrl.startsWith('http') ? photoUrl : '/' + photoUrl) : null;
            const typeLabel = TYPE_LABELS[prop.propertyType] || prop.propertyType || 'Property';
            const typeColor = TYPE_COLORS[prop.propertyType] || 'bg-white/10 text-[#94A3B8]';

            return (
              <Link
                key={view.id}
                to={`/property/${prop.id}`}
                className="flex-shrink-0 w-[260px] snap-start bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] overflow-hidden transition-all duration-300 hover:shadow-[0_0_24px_rgba(74,144,217,0.15)] hover:-translate-y-[2px] hover:border-white/[0.14] no-underline text-inherit group"
              >
                <div className="relative">
                  <div
                    className="h-[160px] bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={photo ? { backgroundImage: `url(${photo})` } : { background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                  />
                  {/* Type badge */}
                  <span className={`absolute top-[10px] left-[10px] px-[8px] py-[3px] rounded-full text-[10px] font-semibold ${typeColor}`}>
                    {typeLabel}
                  </span>
                  {/* View time badge */}
                  <span className="absolute bottom-[10px] right-[10px] px-[8px] py-[3px] rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-[8px] text-white/90 border border-white/10">
                    {timeAgo(view.lastViewedAt)}
                  </span>
                </div>
                <div className="p-[16px]">
                  <div className="text-[18px] font-bold mb-[6px]">
                    ${prop.price?.toLocaleString()}
                    <span className="text-[12px] font-normal text-[#64748B]">/mo</span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#F1F5F9] truncate mb-[6px] leading-[1.3]">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-[4px] text-[12px] text-[#94A3B8] mb-[10px]">
                    <MapPin className="w-[12px] h-[12px] shrink-0" />
                    <span className="truncate">{prop.addressCity}, {prop.addressState}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-[#64748B]">
                    <div className="flex items-center gap-[12px]">
                      <span className="inline-flex items-center gap-[4px]">
                        <BedDouble className="w-[13px] h-[13px]" />
                        {prop.bedrooms} {prop.bedrooms === 1 ? 'bd' : 'bd'}
                      </span>
                      <span className="inline-flex items-center gap-[4px]">
                        <Bath className="w-[13px] h-[13px]" />
                        {prop.bathrooms} {prop.bathrooms === 1 ? 'ba' : 'ba'}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-[4px]">
                      <Eye className="w-[12px] h-[12px]" />
                      {view.viewCount}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right-edge scroll fade */}
        {canScrollRight && (
          <div className="absolute top-0 right-0 bottom-[12px] w-[60px] bg-gradient-to-l from-[#0B0F1A] to-transparent pointer-events-none hidden sm:block" />
        )}
      </div>

      {/* Page dot indicators */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-[6px] mt-[16px]">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToPage(i)}
              className={`h-[6px] rounded-full transition-all ${
                i === currentPage ? 'bg-[#4A90D9] w-[18px]' : 'bg-white/20 w-[6px] hover:bg-white/40'
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile swipe hint */}
      {validViews.length > 1 && (
        <p className="text-center text-[11px] text-[#64748B] mt-[8px] sm:hidden">
          Swipe to explore
        </p>
      )}
    </section>
  );
}
