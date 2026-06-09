// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Loader2, List, Map as MapIcon } from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

interface MapProperty {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  thumbnailUrl: string | null;
}

export default function MapSearchPage() {
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);

  // Default viewport: Chattogram, Bangladesh
  const [viewport, setViewport] = useState({
    northLat: 22.40,
    southLat: 22.30,
    eastLng: 91.85,
    westLng: 91.70,
  });

  const fetchPropertiesInViewport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        northLat: String(viewport.northLat),
        southLat: String(viewport.southLat),
        eastLng: String(viewport.eastLng),
        westLng: String(viewport.westLng),
      });
      const res = await fetch(`${API}/map-search?${params}`, {
        credentials: 'include',
      });
      const json = await res.json();
      setProperties(json?.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [viewport]);

  useEffect(() => {
    fetchPropertiesInViewport();
  }, [fetchPropertiesInViewport]);

  const centerLat = (viewport.northLat + viewport.southLat) / 2;
  const centerLng = (viewport.eastLng + viewport.westLng) / 2;

  return (
    <div className="flex-1 w-full flex flex-col h-[calc(100vh-64px)]">
      {/* Toolbar */}
      <div className="bg-white/[0.04] backdrop-blur-[12px] border-b border-white/[0.08] px-[24px] py-[12px] flex items-center justify-between">
        <h1 className="text-[18px] font-bold">Map Search</h1>
        <div className="flex items-center gap-[8px] bg-white/5 rounded-[10px] p-[4px]">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-[6px] px-[14px] py-[6px] rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-none ${
              viewMode === 'map'
                ? 'bg-[rgba(74,144,217,0.2)] text-[#4A90D9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <MapIcon className="w-[14px] h-[14px]" />
            Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-[6px] px-[14px] py-[6px] rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-none ${
              viewMode === 'list'
                ? 'bg-[rgba(74,144,217,0.2)] text-[#4A90D9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <List className="w-[14px] h-[14px]" />
            List
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Property List Sidebar — visible only in map mode */}
        {viewMode === 'map' && (
          <div className="w-[360px] flex-shrink-0 bg-[#0B0F1A] border-r border-white/[0.08] overflow-y-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center py-[60px] text-[#64748B]">
                <Loader2 className="w-[24px] h-[24px] animate-spin mb-[8px] text-[#4A90D9]" />
                <p className="text-[13px]">Loading properties...</p>
              </div>
            )}

            {error && (
              <div className="p-[24px] text-center">
                <p className="text-[14px] text-[#F87171]">{error}</p>
              </div>
            )}

            {!loading && !error && properties.length === 0 && (
              <div className="p-[24px] text-center">
                <MapPin className="w-[32px] h-[32px] text-[#64748B] mx-auto mb-[8px]" />
                <p className="text-[14px] text-[#94A3B8]">No properties in this area</p>
              </div>
            )}

            <div className="divide-y divide-white/[0.06]">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  className={`p-[16px] cursor-pointer transition-all hover:bg-white/[0.04] ${
                    selectedProperty?.id === prop.id ? 'bg-white/[0.06] border-l-[3px] border-[#4A90D9]' : 'border-l-[3px] border-transparent'
                  }`}
                >
                  <div className="flex gap-[12px]">
                    <div
                      className="w-[80px] h-[60px] rounded-[8px] bg-cover bg-center flex-shrink-0"
                      style={
                        prop.thumbnailUrl
                          ? { backgroundImage: `url(${prop.thumbnailUrl.startsWith('http') ? prop.thumbnailUrl : '/' + prop.thumbnailUrl})` }
                          : { background: 'linear-gradient(135deg, #1e3a5f, #2d1b69)' }
                      }
                    />
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-semibold text-[#F1F5F9] truncate">{prop.title}</h3>
                      <p className="text-[16px] font-bold text-[#4A90D9] mt-[2px]">
                        ${prop.price.toLocaleString()}
                        <span className="text-[12px] font-normal text-[#64748B]">/mo</span>
                      </p>
                      <div className="flex items-center gap-[12px] mt-[4px] text-[12px] text-[#64748B]">
                        <span className="inline-flex items-center gap-[4px]">
                          <BedDouble className="w-[12px] h-[12px]" />
                          {prop.bedrooms} bd
                        </span>
                        <span className="inline-flex items-center gap-[4px]">
                          <Bath className="w-[12px] h-[12px]" />
                          {prop.bathrooms} ba
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map / List Area */}
        <div className="flex-1 relative bg-[#080C14]">
          {viewMode === 'map' ? (
            <iframe
              title="Property Map Search"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(30%) invert(92%) contrast(83%)' }}
              src={`https://maps.google.com/maps?q=${centerLat},${centerLng}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 p-[24px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] overflow-y-auto">
              {loading && (
                <div className="col-span-full flex flex-col items-center justify-center text-[#64748B]">
                  <Loader2 className="w-[24px] h-[24px] animate-spin mb-[8px] text-[#4A90D9]" />
                  <p className="text-[13px]">Loading properties...</p>
                </div>
              )}

              {error && (
                <div className="col-span-full flex flex-col items-center justify-center text-[#F87171]">
                  <p className="text-[14px]">{error}</p>
                </div>
              )}

              {!loading && !error && properties.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-[#94A3B8]">
                  <MapPin className="w-[32px] h-[32px] text-[#64748B] mb-[8px]" />
                  <p className="text-[14px]">No properties in this area</p>
                </div>
              )}

              {properties.map((prop) => (
                <Link
                  key={prop.id}
                  to={`/property/${prop.id}`}
                  className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,144,217,0.15)] hover:-translate-y-[2px] no-underline text-inherit self-start"
                >
                  <div
                    className="h-[160px] bg-cover bg-center"
                    style={
                      prop.thumbnailUrl
                        ? { backgroundImage: `url(${prop.thumbnailUrl.startsWith('http') ? prop.thumbnailUrl : '/' + prop.thumbnailUrl})` }
                        : { background: 'linear-gradient(135deg, #1e3a5f, #2d1b69)' }
                    }
                  />
                  <div className="p-[16px]">
                    <h3 className="text-[15px] font-semibold text-[#F1F5F9] truncate">{prop.title}</h3>
                    <p className="text-[20px] font-bold mt-[4px]">
                      ${prop.price.toLocaleString()}
                      <span className="text-[13px] font-normal text-[#64748B]">/mo</span>
                    </p>
                    <p className="text-[13px] text-[#94A3B8] mt-[4px]">
                      {prop.address.city}, {prop.address.state}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Property detail popup */}
          {selectedProperty && viewMode === 'map' && (
            <div className="absolute bottom-[24px] left-[24px] right-[24px] bg-[#0F172A] border border-white/[0.08] rounded-[12px] p-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-[16px]">
                <div
                  className="w-[100px] h-[70px] rounded-[8px] bg-cover bg-center flex-shrink-0"
                  style={
                    selectedProperty.thumbnailUrl
                      ? { backgroundImage: `url(${selectedProperty.thumbnailUrl.startsWith('http') ? selectedProperty.thumbnailUrl : '/' + selectedProperty.thumbnailUrl})` }
                      : { background: 'linear-gradient(135deg, #1e3a5f, #2d1b69)' }
                  }
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-semibold text-[#F1F5F9] truncate">{selectedProperty.title}</h3>
                  <p className="text-[20px] font-bold text-[#4A90D9]">
                    ${selectedProperty.price.toLocaleString()}
                    <span className="text-[13px] font-normal text-[#64748B]">/mo</span>
                  </p>
                  <p className="text-[13px] text-[#94A3B8]">
                    {selectedProperty.address.street}, {selectedProperty.address.city}
                  </p>
                </div>
                <Link
                  to={`/property/${selectedProperty.id}`}
                  className="h-[40px] px-[20px] rounded-[10px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white text-[13px] font-semibold flex items-center justify-center hover:shadow-[0_0_20px_rgba(74,144,217,0.3)] transition-all no-underline flex-shrink-0"
                >
                  View
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
