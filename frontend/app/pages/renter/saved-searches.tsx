// @ts-nocheck
import { Link } from 'react-router-dom';
import { Bookmark, Bell, BellOff, Trash2, Search, Loader2 } from 'lucide-react';
import { useSavedSearches } from '~/hooks/api/useSavedSearches';

export default function SavedSearchesPage() {
  const { data: savedSearches, isLoading, isError, deleteSearch, toggleAlerts } = useSavedSearches();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px] text-[#64748B]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px]">Loading saved searches...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <p className="text-[18px] font-semibold text-[#F1F5F9]">Something went wrong</p>
        <p className="text-[14px] text-[#64748B] mt-[4px]">Unable to load saved searches</p>
      </div>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Bookmark className="w-[48px] h-[48px] text-[#64748B] mb-[16px]" />
        <p className="text-[18px] font-semibold text-[#F1F5F9]">No saved searches yet</p>
        <p className="text-[14px] text-[#64748B] mt-[4px] mb-[20px]">Save your favorite searches to get alerts for new listings</p>
        <Link
          to="/search"
          className="inline-flex items-center justify-center font-semibold cursor-pointer border-none bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white h-[48px] px-[28px] rounded-[12px] text-[14px] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] transition-all"
        >
          <Search className="w-[18px] h-[18px] mr-[8px]" />
          Start Searching
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-[24px] sm:px-[48px] py-[40px]">
      <div className="flex items-center gap-[10px] mb-[8px]">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[rgba(74,144,217,0.1)] flex items-center justify-center">
          <Bookmark className="w-[20px] h-[20px] text-[#4A90D9]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">Saved Searches</h1>
          <p className="text-[14px] text-[#64748B]">Quick access to your favorite searches</p>
        </div>
      </div>

      <div className="mt-[32px] space-y-[12px]">
        {savedSearches.map((search) => {
          const searchParams = new URLSearchParams({
            ...(search.searchText ? { search: search.searchText } : {}),
            ...(search.minPrice ? { minPrice: String(search.minPrice) } : {}),
            ...(search.maxPrice ? { maxPrice: String(search.maxPrice) } : {}),
            ...(search.bedrooms !== null ? { bedrooms: String(search.bedrooms) } : {}),
            ...(search.propertyType ? { propertyType: search.propertyType } : {}),
          }).toString();

          return (
            <div
              key={search.id}
              className="relative bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] p-[20px] flex flex-col sm:flex-row sm:items-center gap-[16px] hover:border-white/[0.14] transition-all group"
            >
              {/* Clickable overlay that navigates to search */}
              <Link
                to={`/search?${searchParams}`}
                className="absolute inset-0 z-0 rounded-[12px] no-underline"
                aria-label={`Run search: ${search.name}`}
              />

              <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
                <h3 className="text-[16px] font-semibold text-[#F1F5F9] truncate">{search.name}</h3>
                <div className="flex flex-wrap gap-[6px] mt-[8px]">
                  {search.searchText && (
                    <span className="px-[8px] py-[2px] rounded-full text-[11px] bg-[rgba(74,144,217,0.1)] text-[#4A90D9]">
                      {search.searchText}
                    </span>
                  )}
                  {(search.minPrice || search.maxPrice) && (
                    <span className="px-[8px] py-[2px] rounded-full text-[11px] bg-[rgba(74,222,128,0.1)] text-[#4ADE80]">
                      ${search.minPrice || 0} - ${search.maxPrice || '∞'}
                    </span>
                  )}
                  {search.bedrooms !== null && (
                    <span className="px-[8px] py-[2px] rounded-full text-[11px] bg-[rgba(251,191,36,0.1)] text-[#FBBF24]">
                      {search.bedrooms === 0 ? 'Studio' : `${search.bedrooms} bd`}
                    </span>
                  )}
                  {search.propertyType && (
                    <span className="px-[8px] py-[2px] rounded-full text-[11px] bg-[rgba(248,113,113,0.1)] text-[#F87171]">
                      {search.propertyType}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-[8px] shrink-0 relative z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAlerts(search.id, !search.alertEnabled);
                  }}
                  className={`w-[36px] h-[36px] rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                    search.alertEnabled
                      ? 'border-[rgba(74,144,217,0.3)] bg-[rgba(74,144,217,0.1)] text-[#4A90D9] hover:bg-[rgba(74,144,217,0.2)]'
                      : 'border-white/10 bg-white/5 text-[#64748B] hover:text-[#F1F5F9] hover:bg-white/10'
                  }`}
                  title={search.alertEnabled ? 'Disable alerts' : 'Enable alerts'}
                >
                  {search.alertEnabled ? <Bell className="w-[16px] h-[16px]" /> : <BellOff className="w-[16px] h-[16px]" />}
                </button>

                <Link
                  to={`/search?${searchParams}`}
                  onClick={(e) => e.stopPropagation()}
                  className="h-[36px] px-[14px] rounded-full flex items-center justify-center border border-[rgba(74,144,217,0.3)] bg-[rgba(74,144,217,0.1)] text-[#4A90D9] text-[13px] font-medium hover:bg-[rgba(74,144,217,0.2)] transition-all no-underline"
                >
                  <Search className="w-[14px] h-[14px] mr-[6px]" />
                  Search
                </Link>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSearch(search.id);
                  }}
                  className="w-[36px] h-[36px] rounded-full flex items-center justify-center border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.05)] text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] transition-all cursor-pointer"
                  title="Delete search"
                >
                  <Trash2 className="w-[16px] h-[16px]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
