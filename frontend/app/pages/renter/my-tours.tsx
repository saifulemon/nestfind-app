// @ts-nocheck
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

export default function MyToursPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/tours/my-bookings`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => setBookings(json?.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await fetch(`${API}/tours/my-bookings/${id}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px] text-[#64748B]">Loading bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Calendar className="w-[48px] h-[48px] text-[#64748B] mb-[16px]" />
        <p className="text-[18px] font-semibold text-[#F1F5F9]">No scheduled tours</p>
        <p className="text-[14px] text-[#64748B] mt-[4px]">Book a tour from any property page</p>
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
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">My Scheduled Tours</h1>
          <p className="text-[14px] text-[#64748B]">Upcoming property viewings</p>
        </div>
      </div>

      <div className="space-y-[12px]">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] p-[20px] flex flex-col sm:flex-row sm:items-center gap-[16px]"
          >
            <div className="flex-1">
              <div className="flex items-center gap-[8px] mb-[6px]">
                <Link to={`/property/${booking.property?.id}`} className="text-[16px] font-semibold text-[#F1F5F9] hover:text-[#4A90D9] transition-colors no-underline">
                  {booking.property?.title || 'Property'}
                </Link>
                <span className={`px-[8px] py-[2px] rounded-full text-[11px] font-semibold capitalize ${
                  booking.status === 'confirmed'
                    ? 'bg-[rgba(74,222,128,0.1)] text-[#4ADE80]'
                    : 'bg-[rgba(248,113,113,0.1)] text-[#F87171]'
                }`}>
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center gap-[16px] text-[13px] text-[#64748B]">
                <span className="inline-flex items-center gap-[4px]">
                  <Clock className="w-[13px] h-[13px]" />
                  {new Date(booking.createdAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-[4px]">
                  <MapPin className="w-[13px] h-[13px]" />
                  {booking.property?.addressCity || 'City'}
                </span>
              </div>
            </div>
            {booking.status === 'confirmed' && (
              <button
                type="button"
                onClick={() => handleCancel(booking.id)}
                className="h-[36px] px-[16px] rounded-[10px] text-[13px] font-medium border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] text-[#F87171] hover:bg-[rgba(248,113,113,0.15)] transition-colors cursor-pointer inline-flex items-center gap-[6px]"
              >
                <XCircle className="w-[14px] h-[14px]" />
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
