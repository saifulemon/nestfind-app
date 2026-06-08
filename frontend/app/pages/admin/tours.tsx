// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Loader2 } from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

export default function AdminToursPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all bookings (admin view)
    fetch(`${API}/tours/my-bookings`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => {
        setBookings(json?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px] text-[#64748B]">Loading tours...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-[24px] sm:px-[48px] py-[40px]">
      <div className="flex items-center gap-[10px] mb-[32px]">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[rgba(74,222,128,0.1)] flex items-center justify-center">
          <Calendar className="w-[20px] h-[20px] text-[#4ADE80]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">Tour Bookings</h1>
          <p className="text-[14px] text-[#64748B]">Manage scheduled property tours</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-[60px]">
          <Calendar className="w-[32px] h-[32px] text-[#64748B] mx-auto mb-[8px]" />
          <p className="text-[14px] text-[#94A3B8]">No tour bookings yet</p>
        </div>
      ) : (
        <div className="space-y-[12px]">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] p-[20px]"
            >
              <div className="flex items-center justify-between mb-[8px]">
                <Link to={`/property/${booking.property?.id}`} className="text-[16px] font-semibold text-[#F1F5F9] hover:text-[#4A90D9] transition-colors no-underline">
                  {booking.property?.title || 'Property'}
                </Link>
                <span className={`px-[10px] py-[2px] rounded-full text-[11px] font-semibold capitalize ${
                  booking.status === 'confirmed'
                    ? 'bg-[rgba(74,222,128,0.1)] text-[#4ADE80]'
                    : 'bg-[rgba(248,113,113,0.1)] text-[#F87171]'
                }`}>
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center gap-[16px] text-[13px] text-[#64748B]">
                <span className="inline-flex items-center gap-[4px]">
                  <User className="w-[13px] h-[13px]" />
                  {booking.user?.name || 'User'}
                </span>
                <span className="inline-flex items-center gap-[4px]">
                  <Clock className="w-[13px] h-[13px]" />
                  {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
