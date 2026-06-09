// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { Search, Heart, BedDouble, Bath, Ruler, X, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { useAuth } from '~/hooks/useAuth';
import { useAddFavorite, useRemoveFavorite } from '~/hooks/api/useFavorites';
import SaveSearchModal from '~/components/modals/SaveSearchModal';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #1e3a5f, #2d1b69)',
  'linear-gradient(135deg, #3d266b, #1a3a5c)',
  'linear-gradient(135deg, #1a3a5c, #3d266b)',
];

const TYPE_COLORS: Record<string, string> = {
  apartment: 'bg-[rgba(74,144,217,0.15)] text-[#4A90D9]',
  condo: 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]',
  townhouse: 'bg-[rgba(251,191,36,0.12)] text-[#FBBF24]',
  house: 'bg-[rgba(248,113,113,0.12)] text-[#F87171]',
};

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  condo: 'Condo',
  townhouse: 'Townhouse',
  house: 'House',
};

const PRICE_RANGES = [
  { label: 'Under $1,000', value: '0-1000' },
  { label: '$1,000 \u2013 $1,500', value: '1000-1500' },
  { label: '$1,500 \u2013 $2,000', value: '1500-2000' },
  { label: '$2,000 \u2013 $3,000', value: '2000-3000' },
  { label: '$3,000+', value: '3000+' },
] as const;

const BED_OPTIONS = [
  { label: 'Studio', value: '0' },
  { label: '1 Bed', value: '1' },
  { label: '2 Beds', value: '2' },
  { label: '3 Beds', value: '3' },
  { label: '4+ Beds', value: '4' },
] as const;

const TYPE_OPTIONS = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'Condo', value: 'condo' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'House', value: 'house' },
] as const;

const selectBase = [
  'h-[42px] bg-white/5 border border-white/10 rounded-[10px] px-[14px]',
  'text-[#F1F5F9] text-[13px] outline-none',
  'focus:border-[rgba(74,144,217,0.5)] cursor-pointer',
  'transition-colors appearance-none',
  'bg-no-repeat pr-[36px]',
  'hover:bg-white/[0.06]',
].join(' ');

const caretSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

export default function SearchPage() {
  useDocumentTitle('Search Properties - NestFind');
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const LIMIT = 10;
  const { isAuthenticated } = useAuth();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();

  // Read URL params on mount / when searchParams change
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || '';
    setSearchText(q);

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice && maxPrice) {
      setPriceRange(`${minPrice}-${maxPrice}`);
    } else if (minPrice) {
      setPriceRange(`${minPrice}+`);
    } else if (maxPrice) {
      setPriceRange(`0-${maxPrice}`);
    } else {
      setPriceRange('');
    }

    setBedrooms(searchParams.get('bedrooms') || '');
    setPropertyType(searchParams.get('propertyType') || '');
    setPage(1);
  }, [searchParams]);

  // Seed favoritedIds from user's favorites on mount (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setFavoritedIds(new Set());
      return;
    }
    fetch(`${API}/favorites`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((json) => {
        const items = json?.data?.items ?? [];
        const ids = new Set(items.map((f: any) => f.propertyId || f.property?.id).filter(Boolean));
        setFavoritedIds(ids);
      })
      .catch(() => setFavoritedIds(new Set()));
  }, [isAuthenticated]);

  const buildParams = useCallback((pageNum: number = page): Record<string, string> => {
    const params: Record<string, string> = {};
    params.limit = String(LIMIT);
    params.page = String(pageNum);
    if (searchText) params.search = searchText;
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (min) params.minPrice = min;
      if (max && max !== '+') params.maxPrice = max;
      if (max === '+') params.minPrice = priceRange.replace('+', '');
    }
    if (bedrooms) params.bedrooms = bedrooms;
    if (propertyType) params.propertyType = propertyType;
    if (sortBy === 'price_asc') { params.sortBy = 'price'; params.sortOrder = 'ASC'; }
    else if (sortBy === 'price_desc') { params.sortBy = 'price'; params.sortOrder = 'DESC'; }
    else { params.sortBy = 'createdAt'; params.sortOrder = 'DESC'; }
    return params;
  }, [searchText, priceRange, bedrooms, propertyType, sortBy, page]);

  const fetchProperties = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API}/properties${qs ? '?' + qs : ''}`, { credentials: 'include' });
      const json = await res.json();
      const items = json?.data?.items ?? json?.data ?? [];
      const m = json?.data?.meta ?? { total: items.length, totalPages: 1 };
      setProperties(items);
      setMeta({ total: m.total ?? items.length, totalPages: m.totalPages ?? 1 });
    } catch (e: any) {
      setError(e.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset page when filters or sort change
  useEffect(() => {
    setPage(1);
  }, [searchText, priceRange, bedrooms, propertyType, sortBy]);

  useEffect(() => {
    fetchProperties(buildParams(page));
  }, [buildParams, fetchProperties, page]);

  const handleSearch = () => {
    setPage(1);
    fetchProperties(buildParams(1));
  };

  const toggleFav = (propertyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
        removeFav.mutate(propertyId);
      } else {
        next.add(propertyId);
        addFav.mutate(propertyId);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setPriceRange('');
    setBedrooms('');
    setPropertyType('');
    setSortBy('newest');
  };

  const hasActiveFilters = priceRange || bedrooms || propertyType || sortBy !== 'newest';

  return (
    <div className="flex-1 w-full">
      <div className="max-w-[1440px] mx-auto px-[24px] sm:px-[48px] py-[40px]">

        {/* Search Card */}
        <div className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[16px] p-[24px] sm:p-[32px] mb-[32px]">
          <div className="flex flex-col sm:flex-row gap-[12px]">
            <div className="relative flex-1">
              <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#64748B] w-[20px] h-[20px] pointer-events-none" />
              <input
                type="text"
                placeholder="Enter city, neighborhood, or ZIP..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                className="h-[52px] w-full bg-white/5 border border-white/10 rounded-[12px] pl-[48px] pr-[16px] text-[#F1F5F9] text-[15px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center justify-center gap-[8px] font-semibold cursor-pointer border-none bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white h-[52px] px-[28px] rounded-[12px] text-[15px] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-px transition-all shrink-0"
            >
              <Search className="w-[18px] h-[18px]" />
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden inline-flex items-center justify-center gap-[8px] font-medium cursor-pointer border border-white/10 bg-white/5 text-[#94A3B8] h-[52px] px-[20px] rounded-[12px] text-[14px] hover:bg-white/10 hover:text-[#F1F5F9] transition-all shrink-0"
            >
              <SlidersHorizontal className="w-[18px] h-[18px]" />
              Filters
            </button>
          </div>

          <div className={`flex flex-wrap gap-[10px] mt-[16px] pt-[16px] border-t border-white/[0.06] ${showMobileFilters ? '' : 'hidden sm:flex'}`}>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
              className={selectBase}
              style={{ backgroundImage: caretSvg, backgroundSize: '12px', backgroundPosition: 'right 12px center' }}
            >
              <option value="">Price Range</option>
              {PRICE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}
              className={selectBase}
              style={{ backgroundImage: caretSvg, backgroundSize: '12px', backgroundPosition: 'right 12px center' }}
            >
              <option value="">Bedrooms</option>
              {BED_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>

            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}
              className={selectBase}
              style={{ backgroundImage: caretSvg, backgroundSize: '12px', backgroundPosition: 'right 12px center' }}
            >
              <option value="">Property Type</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-[42px] inline-flex items-center gap-[6px] px-[14px] rounded-[10px] text-[13px] text-[#F87171] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.08)] hover:bg-[rgba(248,113,113,0.15)] transition-colors cursor-pointer font-medium"
              >
                <X className="w-[14px] h-[14px]" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px] mb-[24px]">
          <div>
            {!loading && !error && (
              <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
                {meta.total} {meta.total === 1 ? 'property' : 'properties'} found
              </h2>
            )}
          </div>
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => setShowSaveSearchModal(true)}
              className="h-[38px] inline-flex items-center gap-[6px] px-[14px] rounded-[10px] text-[13px] font-medium border border-[rgba(74,144,217,0.3)] bg-[rgba(74,144,217,0.08)] text-[#4A90D9] hover:bg-[rgba(74,144,217,0.15)] transition-colors cursor-pointer"
            >
              <Bookmark className="w-[14px] h-[14px]" />
              Save Search
            </button>
            <span className="text-[13px] text-[#64748B] hidden sm:inline">Sort by</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="h-[38px] bg-white/5 border border-white/10 rounded-[10px] px-[12px] text-[#F1F5F9] text-[13px] font-medium outline-none focus:border-[rgba(74,144,217,0.5)] cursor-pointer transition-colors appearance-none hover:bg-white/[0.06]"
              style={{ backgroundImage: caretSvg, backgroundSize: '12px', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', paddingRight: '32px' }}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-[100px] text-[#64748B]">
            <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
            <p className="text-[15px]">Searching for properties...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-[80px]">
            <div className="w-[56px] h-[56px] rounded-full bg-[rgba(248,113,113,0.1)] flex items-center justify-center mb-[16px]">
              <X className="w-[24px] h-[24px] text-[#F87171]" />
            </div>
            <p className="text-[18px] font-semibold text-[#F1F5F9]">Something went wrong</p>
            <p className="text-[14px] text-[#64748B] mt-[4px] mb-[20px]">{error}</p>
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center justify-center font-medium cursor-pointer border-none bg-white/10 text-[#F1F5F9] h-[42px] px-[24px] rounded-[10px] text-[14px] hover:bg-white/[0.15] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-[80px]">
            <div className="w-[56px] h-[56px] rounded-full bg-white/5 flex items-center justify-center mb-[16px]">
              <Search className="w-[24px] h-[24px] text-[#64748B]" />
            </div>
            <p className="text-[18px] font-semibold text-[#F1F5F9]">No properties found</p>
            <p className="text-[14px] text-[#64748B] mt-[4px]">Try adjusting your search filters</p>
          </div>
        )}

        {/* Property Grid */}
        {!loading && !error && properties.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              {properties.map((prop, i) => {
                const addr = prop.address || {};
                const typeLabel = TYPE_LABELS[prop.propertyType] || prop.propertyType || 'Property';
                const typeColor = TYPE_COLORS[prop.propertyType] || 'bg-white/10 text-[#94A3B8]';
                const photoUrl = prop.primaryPhoto?.url || prop.photos?.[0]?.url;
                const photos = photoUrl ? (photoUrl.startsWith('http') ? photoUrl : '/' + photoUrl) : null;
                return (
                  <Link
                    key={prop.id}
                    to={`/property/${prop.id}`}
                    className="group bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,144,217,0.15)] hover:-translate-y-[2px] hover:border-white/[0.14] no-underline text-inherit"
                  >
                    <div className="relative">
                      <div
                        className="h-[200px] bg-cover bg-center"
                        style={
                          photos
                            ? { backgroundImage: `url(${photos})` }
                            : { background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }
                        }
                      />
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
                      <span className={`inline-block px-[10px] py-[3px] rounded-full text-[11px] font-semibold mb-[10px] ${typeColor}`}>
                        {typeLabel}
                      </span>
                      <h3 className="text-[16px] font-semibold text-[#F1F5F9] mb-[6px] truncate leading-[1.3]">
                        {prop.title}
                      </h3>
                      <div className="text-[22px] font-bold tracking-[-0.02em]">
                        ${prop.price?.toLocaleString()}
                        <span className="text-[14px] font-normal text-[#64748B]">/mo</span>
                      </div>
                      <p className="text-[14px] text-[#94A3B8] mt-[4px] mb-[12px] truncate">
                        {addr.street || prop.addressStreet}, {addr.city || prop.addressCity}, {addr.state || prop.addressState}
                      </p>
                      <div className="flex items-center gap-[16px] text-[13px] text-[#64748B]">
                        <span className="inline-flex items-center gap-[6px]">
                          <BedDouble className="w-[15px] h-[15px]" />
                          {prop.bedrooms} {prop.bedrooms === 1 ? 'bd' : 'bd'}
                        </span>
                        <span className="inline-flex items-center gap-[6px]">
                          <Bath className="w-[15px] h-[15px]" />
                          {prop.bathrooms} {prop.bathrooms === 1 ? 'ba' : 'ba'}
                        </span>
                        {prop.squareFeet && (
                          <span className="inline-flex items-center gap-[6px]">
                            <Ruler className="w-[15px] h-[15px]" />
                            {prop.squareFeet.toLocaleString()} sqft
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-[6px] sm:gap-[8px] mt-[40px] flex-wrap">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center justify-center w-[36px] sm:w-[40px] h-[36px] sm:h-[40px] rounded-[10px] border border-white/10 bg-white/5 text-[#F1F5F9] transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" />
                </button>

                {(() => {
                  const total = meta.totalPages;
                  const current = page;
                  const pages: (number | string)[] = [];
                  const showFirst = current > 3;
                  const showLast = current < total - 2;
                  const start = Math.max(2, current - 1);
                  const end = Math.min(total - 1, current + 1);

                  pages.push(1);
                  if (showFirst && start > 2) pages.push('…');
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (showLast && end < total - 1) pages.push('…');
                  if (total > 1) pages.push(total);

                  return pages.map((p, idx) =>
                    p === '…' ? (
                      <span key={`ellipsis-${idx}`} className="inline-flex items-center justify-center w-[36px] sm:w-[40px] h-[36px] sm:h-[40px] text-[#64748B] text-[13px]">…</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p as number)}
                        className={`inline-flex items-center justify-center min-w-[36px] sm:min-w-[40px] h-[36px] sm:h-[40px] rounded-[10px] text-[13px] sm:text-[14px] font-medium transition-all ${
                          p === page
                            ? 'bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white shadow-[0_0_12px_rgba(74,144,217,0.25)]'
                            : 'border border-white/10 bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-[#F1F5F9]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="inline-flex items-center justify-center w-[36px] sm:w-[40px] h-[36px] sm:h-[40px] rounded-[10px] border border-white/10 bg-white/5 text-[#F1F5F9] transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <SaveSearchModal
        isOpen={showSaveSearchModal}
        onClose={() => setShowSaveSearchModal(false)}
        filters={{
          searchText: searchText || undefined,
          minPrice: priceRange ? parseInt(priceRange.split('-')[0], 10) : undefined,
          maxPrice: priceRange && priceRange.includes('-') ? parseInt(priceRange.split('-')[1], 10) : undefined,
          bedrooms: bedrooms || undefined,
          propertyType: propertyType || undefined,
        }}
      />
    </div>
  );
}
