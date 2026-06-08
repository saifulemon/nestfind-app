// @ts-nocheck
import { useState } from 'react';
import { X, Bell, Bookmark } from 'lucide-react';
import { savedSearchService } from '~/services/api/savedSearchService';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    searchText?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: string;
    propertyType?: string;
  };
  onSaved?: () => void;
}

export default function SaveSearchModal({ isOpen, onClose, filters, onSaved }: SaveSearchModalProps) {
  const [name, setName] = useState('');
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for this search');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await savedSearchService.create({
        name: name.trim(),
        searchText: filters.searchText,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        bedrooms: filters.bedrooms ? parseInt(filters.bedrooms, 10) : undefined,
        propertyType: filters.propertyType,
        alertEnabled,
      });
      onSaved?.();
      onClose();
      setName('');
    } catch (e: any) {
      setError(e.message || 'Failed to save search');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[4px]">
      <div className="bg-[#0F172A] border border-white/10 rounded-[16px] p-[24px] w-full max-w-[420px] mx-[16px]">
        <div className="flex items-center justify-between mb-[20px]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[10px] bg-[rgba(74,144,217,0.1)] flex items-center justify-center">
              <Bookmark className="w-[18px] h-[18px] text-[#4A90D9]" />
            </div>
            <h3 className="text-[18px] font-bold">Save Search</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9] hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <p className="text-[14px] text-[#94A3B8] mb-[20px]">
          Save this search with your current filters so you can quickly return to it later.
        </p>

        <div className="mb-[16px]">
          <label className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">
            Search Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Downtown Apartments"
            className="h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)]"
          />
        </div>

        {/* Filter summary */}
        <div className="bg-white/[0.03] rounded-[10px] p-[14px] mb-[20px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B] mb-[8px]">Current Filters</p>
          <div className="flex flex-wrap gap-[6px]">
            {filters.searchText && (
              <span className="px-[10px] py-[3px] rounded-full text-[11px] bg-[rgba(74,144,217,0.1)] text-[#4A90D9]">
                {filters.searchText}
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="px-[10px] py-[3px] rounded-full text-[11px] bg-[rgba(74,222,128,0.1)] text-[#4ADE80]">
                ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
              </span>
            )}
            {filters.bedrooms && (
              <span className="px-[10px] py-[3px] rounded-full text-[11px] bg-[rgba(251,191,36,0.1)] text-[#FBBF24]">
                {filters.bedrooms === '0' ? 'Studio' : `${filters.bedrooms} bd`}
              </span>
            )}
            {filters.propertyType && (
              <span className="px-[10px] py-[3px] rounded-full text-[11px] bg-[rgba(248,113,113,0.1)] text-[#F87171]">
                {filters.propertyType}
              </span>
            )}
          </div>
        </div>

        {/* Alert toggle */}
        <div className="flex items-center justify-between mb-[24px]">
          <div className="flex items-center gap-[10px]">
            <Bell className="w-[16px] h-[16px] text-[#4A90D9]" />
            <div>
              <p className="text-[14px] font-medium">Email Alerts</p>
              <p className="text-[12px] text-[#64748B]">Get notified when new properties match</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAlertEnabled(!alertEnabled)}
            className={`relative w-[44px] h-[24px] rounded-full transition-colors cursor-pointer border-none ${alertEnabled ? 'bg-[#4A90D9]' : 'bg-white/20'}`}
          >
            <div
              className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform ${alertEnabled ? 'left-[22px]' : 'left-[2px]'}`}
            />
          </button>
        </div>

        {error && (
          <p className="text-[13px] text-[#F87171] mb-[12px]">{error}</p>
        )}

        <div className="flex gap-[12px]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[48px] rounded-[12px] border border-white/10 bg-white/5 text-[#F1F5F9] text-[14px] font-medium hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-[48px] rounded-[12px] border-none bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white text-[14px] font-semibold hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Search'}
          </button>
        </div>
      </div>
    </div>
  );
}
