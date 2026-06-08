import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import { useRecentlyViewed } from '~/hooks/api/usePropertyViews';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #1e3a5f, #2d1b69)',
  'linear-gradient(135deg, #3d266b, #1a3a5c)',
  'linear-gradient(135deg, #1a3a5c, #3d266b)',
];

export default function RecentlyViewedStrip() {
  const { data: views, isLoading, isError } = useRecentlyViewed(8);

  if (isLoading || isError || views.length === 0) {
    return null;
  }

  return (
    <section className="px-[48px] py-[48px]">
      <div className="flex items-center gap-[10px] mb-[24px]">
        <div className="w-[36px] h-[36px] rounded-[10px] bg-[rgba(74,144,217,0.1)] flex items-center justify-center">
          <Clock className="w-[18px] h-[18px] text-[#4A90D9]" />
        </div>
        <div>
          <h2 className="text-[24px] font-bold tracking-[-0.02em]">Recently Viewed</h2>
          <p className="text-[13px] text-[#64748B]">Properties you checked out recently</p>
        </div>
      </div>

      <div className="flex gap-[16px] overflow-x-auto pb-[8px] scrollbar-hide">
        {views.map((view, i) => {
          const prop = view.property;
          if (!prop) return null;

          const photoUrl = prop.photos?.find((p) => p.isPrimary)?.url || prop.photos?.[0]?.url;
          const photo = photoUrl ? (photoUrl.startsWith('http') ? photoUrl : '/' + photoUrl) : null;

          return (
            <Link
              key={view.id}
              to={`/property/${prop.id}`}
              className="flex-shrink-0 w-[220px] bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,144,217,0.15)] hover:-translate-y-[2px] hover:border-white/[0.14] no-underline text-inherit"
            >
              <div
                className="h-[140px] bg-cover bg-center"
                style={photo ? { backgroundImage: `url(${photo})` } : { background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
              />
              <div className="p-[14px]">
                <div className="text-[16px] font-bold mb-[4px]">
                  ${prop.price?.toLocaleString()}
                  <span className="text-[12px] font-normal text-[#64748B]">/mo</span>
                </div>
                <h3 className="text-[13px] font-semibold text-[#F1F5F9] truncate mb-[4px]">
                  {prop.title}
                </h3>
                <p className="text-[12px] text-[#94A3B8] truncate mb-[8px]">
                  {prop.addressCity}, {prop.addressState}
                </p>
                <div className="flex items-center gap-[4px] text-[11px] text-[#64748B]">
                  <Eye className="w-[12px] h-[12px]" />
                  <span>{view.viewCount} view{view.viewCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
