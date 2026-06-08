// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, User, Loader2 } from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/chat/conversations`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => {
        setConversations(json?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px] text-[#64748B]">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-[24px] sm:px-[48px] py-[40px]">
      <div className="flex items-center gap-[10px] mb-[32px]">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[rgba(74,144,217,0.1)] flex items-center justify-center">
          <MessageSquare className="w-[20px] h-[20px] text-[#4A90D9]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">Messages</h1>
          <p className="text-[14px] text-[#64748B]">Chat conversations with renters</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-[60px]">
          <MessageSquare className="w-[32px] h-[32px] text-[#64748B] mx-auto mb-[8px]" />
          <p className="text-[14px] text-[#94A3B8]">No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-[12px]">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] p-[20px] flex items-center gap-[14px]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center text-[14px] font-bold text-white">
                {(conv.renter?.name?.charAt(0) || 'U').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#F1F5F9] truncate">{conv.renter?.name || 'Renter'}</p>
                <p className="text-[13px] text-[#94A3B8] truncate">
                  {conv.property?.title || 'General inquiry'} — {conv.subject || 'No subject'}
                </p>
              </div>
              <span className={`px-[10px] py-[2px] rounded-full text-[11px] font-semibold capitalize ${
                conv.status === 'active'
                  ? 'bg-[rgba(74,222,128,0.1)] text-[#4ADE80]'
                  : 'bg-[rgba(248,113,113,0.1)] text-[#F87171]'
              }`}>
                {conv.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
