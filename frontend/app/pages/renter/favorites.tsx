// @ts-nocheck
import { Link } from 'react-router-dom';
import { Heart, Trash2, BedDouble, Bath, Ruler } from 'lucide-react';
import { useFavoriteList, useRemoveFavorite } from '~/hooks/api/useFavorites';
import type { FavoriteItem } from '~/types/api/favorite';

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

export default function FavoritesPage() {
  const { data, isLoading, isError, error } = useFavoriteList();
  const removeFav = useRemoveFavorite();

  const favorites = data?.items ?? [];
  const count = data?.meta?.total ?? favorites.length;

  const handleRemove = (propertyId: string) => {
    removeFav.mutate(propertyId);
  };

  return (
    <div className="w-full">
      <div className="pt-[24px] sm:pt-[48px] px-[24px] sm:px-[48px] pb-0">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4A90D9] mb-[8px]">Saved</div>
        <h2 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em]">
          My Favorites <span className="text-[#94A3B8] font-normal text-[18px] sm:text-[20px]">({count})</span>
        </h2>
      </div>

      <section className="p-[24px] sm:p-[48px]" style={{ paddingTop: '24px' }}>
        {isLoading && (
          <div className="flex items-center justify-center py-[80px] text-[#64748B] text-[16px]">
            Loading favorites...
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-[80px] text-[#F87171] text-[16px]">
            {(error as Error)?.message || 'Failed to load favorites'}
          </div>
        )}

        {!isLoading && !isError && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-[80px] text-[#64748B]">
            <Heart className="w-[48px] h-[48px] mb-[16px] text-[#64748B]" />
            <p className="text-[18px]">No favorites yet</p>
            <p className="text-[14px] mt-[8px]">Save properties you like by clicking the heart icon</p>
            <Link to="/search" className="mt-[16px] text-[#4A90D9] hover:underline">Browse properties</Link>
          </div>
        )}

        {!isLoading && !isError && favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {favorites.map((fav: FavoriteItem, i: number) => {
              const prop = fav.property;
              const typeLabel = TYPE_LABELS[prop.propertyType] || prop.propertyType || 'Property';
              const typeColor = TYPE_COLORS[prop.propertyType] || 'bg-white/10 text-[#94A3B8]';
              const photoUrl = prop.primaryPhoto?.url || prop.photos?.[0]?.url;
              const photos = photoUrl ? (photoUrl.startsWith('http') ? photoUrl : '/' + photoUrl) : null;
              return (
                <div key={fav.id} className="group bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,144,217,0.15)] hover:-translate-y-[2px] hover:border-white/[0.14]">
                  <div className="relative">
                    <div
                      className="h-[200px] bg-cover bg-center"
                      style={
                        photos
                          ? { backgroundImage: `url(${photos})` }
                          : { background: 'linear-gradient(135deg,rgba(74,144,217,0.35),rgba(124,58,237,0.35))' }
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(prop.id)}
                      className="absolute top-[12px] right-[12px] w-[40px] h-[40px] rounded-full flex items-center justify-center cursor-pointer border border-white/20 bg-black/30 backdrop-blur-[10px] transition-all duration-200 hover:scale-110 hover:bg-black/50 hover:shadow-[0_0_15px_rgba(248,113,113,0.3)] active:scale-90"
                      aria-label="Remove from favorites"
                    >
                      <Heart
                        className="w-[18px] h-[18px] scale-110"
                        fill="#F87171"
                        stroke="#F87171"
                        strokeWidth={0}
                      />
                      <span className="absolute inset-0 rounded-full animate-ping bg-[rgba(248,113,113,0.15)]" />
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
                      {prop.addressStreet || ''}, {prop.addressCity || ''}, {prop.addressState || ''} {prop.addressZipCode || ''}
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
                    <div className="flex gap-[8px] mt-[16px]">
                      <Link to={`/property/${prop.id}`} className="inline-flex items-center justify-center gap-[8px] font-semibold cursor-pointer border transition-all duration-200 font-[inherit] no-underline flex-1 h-[40px] px-[14px] rounded-[10px] text-[14px] bg-white/10 text-[#F1F5F9] border-white/10 hover:bg-white/[0.15]">View Details</Link>
                      <button type="button"
                        onClick={() => handleRemove(prop.id)}
                        disabled={removeFav.isPending}
                        className="inline-flex items-center justify-center gap-[8px] font-semibold cursor-pointer border transition-all duration-200 font-[inherit] h-[40px] px-[14px] rounded-[10px] text-[14px] bg-white/10 border-white/10 text-[#F87171] hover:bg-white/[0.15] disabled:opacity-50"
                        data-testid={`A-08-fav-remove-${i}`}
                      >
                        <Trash2 className="w-[16px] h-[16px]" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
