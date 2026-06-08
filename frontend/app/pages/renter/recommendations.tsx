// @ts-nocheck
import { Link } from 'react-router-dom';
import { Sparkles, BedDouble, Bath, Ruler, Loader2, Heart } from 'lucide-react';
import { useRecommendations } from '~/hooks/api/useRecommendations';

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

export default function RecommendationsPage() {
  const { data: recommendations, isLoading, isError } = useRecommendations(12);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px] text-[#64748B]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px]">Finding properties for you...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <p className="text-[18px] font-semibold text-[#F1F5F9]">Something went wrong</p>
        <p className="text-[14px] text-[#64748B] mt-[4px]">Unable to load recommendations</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Sparkles className="w-[48px] h-[48px] text-[#64748B] mb-[16px]" />
        <p className="text-[18px] font-semibold text-[#F1F5F9]">Start exploring to get recommendations</p>
        <p className="text-[14px] text-[#64748B] mt-[4px] mb-[20px]">Browse properties and save favorites for personalized suggestions</p>
        <Link
          to="/search"
          className="inline-flex items-center justify-center font-semibold cursor-pointer border-none bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white h-[48px] px-[28px] rounded-[12px] text-[14px] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] transition-all"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-[24px] sm:px-[48px] py-[40px]">
      <div className="flex items-center gap-[12px] mb-[8px]">
        <div className="w-[40px] h-[40px] rounded-[12px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] flex items-center justify-center">
          <Sparkles className="w-[20px] h-[20px] text-white" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">Recommended For You</h1>
          <p className="text-[14px] text-[#64748B]">Based on your favorites and browsing history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] mt-[32px]">
        {recommendations.map((prop, i) => {
          const addr = prop.address || {};
          const typeLabel = TYPE_LABELS[prop.propertyType] || prop.propertyType || 'Property';
          const typeColor = TYPE_COLORS[prop.propertyType] || 'bg-white/10 text-[#94A3B8]';
          const photoUrl = prop.photos?.find((p) => p.isPrimary)?.url || prop.photos?.[0]?.url;
          const photo = photoUrl ? (photoUrl.startsWith('http') ? photoUrl : '/' + photoUrl) : null;

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
                    photo
                      ? { backgroundImage: `url(${photo})` }
                      : { background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }
                  }
                />
                {prop.matchReasons && prop.matchReasons.length > 0 && (
                  <div className="absolute top-[12px] left-[12px] flex flex-wrap gap-[4px]">
                    {prop.matchReasons.map((reason) => (
                      <span
                        key={reason}
                        className="px-[8px] py-[2px] rounded-full text-[11px] font-semibold bg-[rgba(74,144,217,0.2)] text-[#4A90D9] backdrop-blur-[8px]"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-[20px]">
                <span className={`inline-block px-[10px] py-[3px] rounded-full text-[11px] font-semibold mb-[10px] ${typeColor}`}>
                  {typeLabel}
                </span>
                <h3 className="text-[16px] font-semibold text-[#F1F5F9] mb-[6px] truncate leading-[1.3]">
                  {prop.title}
                </h3>
                <div className="text-[22px] font-bold tracking-[-0.02em]">
                  ${Number(prop.price).toLocaleString()}
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
    </div>
  );
}
