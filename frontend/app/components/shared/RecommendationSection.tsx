// @ts-nocheck
import { Link } from 'react-router-dom';
import { Sparkles, BedDouble, Bath, Ruler } from 'lucide-react';
import { useRecommendations } from '~/hooks/api/useRecommendations';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #1e3a5f, #2d1b69)',
  'linear-gradient(135deg, #3d266b, #1a3a5c)',
  'linear-gradient(135deg, #1a3a5c, #3d266b)',
];

export default function RecommendationSection() {
  const { data: recommendations, isLoading, isError } = useRecommendations(6);

  if (isLoading || isError || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="px-[48px] py-[48px]">
      <div className="flex items-center justify-between mb-[24px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] flex items-center justify-center">
            <Sparkles className="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <h2 className="text-[24px] font-bold tracking-[-0.02em]">Recommended For You</h2>
            <p className="text-[13px] text-[#64748B]">Based on your favorites and browsing</p>
          </div>
        </div>
        <Link
          to="/recommendations"
          className="text-[14px] font-medium text-[#4A90D9] hover:text-[#7C3AED] transition-colors no-underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
        {recommendations.slice(0, 6).map((prop, i) => {
          const addr = prop.address || {};
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
                  className="h-[180px] bg-cover bg-center"
                  style={
                    photo
                      ? { backgroundImage: `url(${photo})` }
                      : { background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }
                  }
                />
                {prop.matchReasons && prop.matchReasons.length > 0 && (
                  <div className="absolute top-[12px] left-[12px] flex flex-wrap gap-[4px]">
                    {prop.matchReasons.slice(0, 2).map((reason) => (
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
              <div className="p-[16px]">
                <h3 className="text-[15px] font-semibold text-[#F1F5F9] mb-[4px] truncate leading-[1.3]">
                  {prop.title}
                </h3>
                <div className="text-[20px] font-bold tracking-[-0.02em]">
                  ${Number(prop.price).toLocaleString()}
                  <span className="text-[13px] font-normal text-[#64748B]">/mo</span>
                </div>
                <p className="text-[13px] text-[#94A3B8] mt-[4px] mb-[10px] truncate">
                  {addr.city || prop.addressCity}, {addr.state || prop.addressState}
                </p>
                <div className="flex items-center gap-[14px] text-[12px] text-[#64748B]">
                  <span className="inline-flex items-center gap-[4px]">
                    <BedDouble className="w-[14px] h-[14px]" />
                    {prop.bedrooms} bd
                  </span>
                  <span className="inline-flex items-center gap-[4px]">
                    <Bath className="w-[14px] h-[14px]" />
                    {prop.bathrooms} ba
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
