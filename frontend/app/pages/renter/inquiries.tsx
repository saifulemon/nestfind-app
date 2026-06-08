// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BedDouble, Bath, Ruler, Eye, Send, ChevronDown, ChevronUp, MessageCircle, User, Loader2 } from 'lucide-react';
import { useInquiryList, useReplyToInquiry } from '~/hooks/api/useInquiries';
import type { InquiryStatus } from '~/types/api/inquiry';

const statusConfig: Record<InquiryStatus, { dotClass: string; label: string }> = {
  new: { dotClass: 'bg-[#4ADE80]', label: 'New' },
  responded: { dotClass: 'bg-[#4A90D9]', label: 'Responded' },
  read: { dotClass: 'bg-[#64748B]', label: 'Read' },
};

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

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function parseResponse(response: string): { type: 'landlord' | 'renter'; text: string; date?: string }[] {
  if (!response) return [];
  const messages: { type: 'landlord' | 'renter'; text: string; date?: string }[] = [];
  // Split by both renter and admin reply markers
  const parts = response.split(/\n*\[(Renter|Admin) \| ([^\]]+)\]:\n*/);
  // First part before any marker is the original admin response
  if (parts.length > 0 && parts[0].trim()) {
    messages.push({ type: 'landlord', text: parts[0].trim() });
  }
  for (let i = 1; i < parts.length; i += 3) {
    const sender = parts[i];
    const date = parts[i + 1];
    const text = parts[i + 2] || '';
    if (text.trim()) {
      messages.push({ type: sender === 'Renter' ? 'renter' : 'landlord', text: text.trim(), date });
    }
  }
  return messages;
}

export default function InquiriesPage() {
  const { data, isLoading, isError, error, refetch } = useInquiryList({ sortBy: 'createdAt', sortOrder: 'DESC' }, '/inquiries/my');
  const inquiries = data?.items ?? [];
  const count = data?.meta?.total ?? inquiries.length;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const { mutate: sendReply, isPending: isReplyPending } = useReplyToInquiry();
  const [replyError, setReplyError] = useState<Record<string, string>>({});

  const handleReplySubmit = async (inqId: string) => {
    const text = replyText[inqId]?.trim();
    if (!text) return;
    setReplyError((prev) => ({ ...prev, [inqId]: '' }));
    try {
      await sendReply(inqId, text, {
        onSuccess: () => {
          setReplyText((prev) => ({ ...prev, [inqId]: '' }));
          refetch();
        },
      });
    } catch (e: any) {
      console.error('Reply failed:', e);
      setReplyError((prev) => ({ ...prev, [inqId]: e?.message || 'Failed to send reply' }));
    }
  };

  return (
    <div className="w-full">
      <div className="pt-[24px] sm:pt-[48px] px-[24px] sm:px-[48px] pb-0">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4A90D9] mb-[8px]">Communication</div>
        <h2 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em]">
          My Inquiries <span className="text-[#94A3B8] font-normal text-[18px] sm:text-[20px]">({count})</span>
        </h2>
      </div>

      <section className="p-[24px] sm:p-[48px]" style={{ paddingTop: '24px' }}>
        {isLoading && (
          <div className="flex items-center justify-center py-[80px] text-[#64748B] text-[16px]">
            Loading inquiries...
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-[80px] text-[#F87171] text-[16px]">
            {(error as Error)?.message || 'Failed to load inquiries'}
          </div>
        )}

        {!isLoading && !isError && inquiries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-[80px]">
            <div className="w-[64px] h-[64px] rounded-full bg-white/5 flex items-center justify-center mb-[20px]">
              <Heart className="w-[28px] h-[28px] text-[#64748B]" />
            </div>
            <p className="text-[20px] font-semibold text-[#F1F5F9]">No inquiries yet</p>
            <p className="text-[14px] text-[#94A3B8] mt-[8px] max-w-[320px] text-center leading-relaxed">
              You haven&apos;t sent any inquiries yet. Browse properties and send a message to the landlord to get started.
            </p>
            <Link to="/search" className="mt-[24px] inline-flex items-center justify-center gap-[8px] font-semibold cursor-pointer border-none bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white h-[48px] px-[28px] rounded-[12px] text-[14px] no-underline hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-px transition-all">
              Browse Properties
            </Link>
          </div>
        )}

        {!isLoading && !isError && inquiries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {inquiries.map((inq) => {
              const prop = inq.property;
              const config = statusConfig[inq.status] || statusConfig.new;
              const isExpanded = expandedId === inq.id;
              const responseMessages = parseResponse(inq.response);

              if (!prop || !prop.id) {
                return (
                  <div key={inq.id} className="group bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,144,217,0.15)] hover:-translate-y-[2px] hover:border-white/[0.14]">
                    <div className="p-[20px]">
                      <div className="flex items-center justify-between mb-[10px]">
                        <span className="inline-block px-[10px] py-[3px] rounded-full text-[11px] font-semibold bg-white/10 text-[#94A3B8]">Inquiry</span>
                        <span className="inline-flex items-center gap-[6px] text-[12px] font-medium">
                          <span className={`inline-block w-[8px] h-[8px] rounded-full ${config.dotClass}`} />
                          {config.label}
                        </span>
                      </div>
                      <h3 className="text-[16px] font-semibold text-[#F1F5F9] mb-[6px] truncate leading-[1.3]">Property unavailable</h3>

                      {/* Conversation thread */}
                      <div className="mt-[12px] space-y-[12px] p-[12px] rounded-[10px] bg-white/[0.02]">
                        {/* Your message */}
                        <div className="flex gap-[10px]">
                          <div className="w-[28px] h-[28px] rounded-full bg-[rgba(74,144,217,0.2)] flex items-center justify-center shrink-0">
                            <User className="w-[14px] h-[14px] text-[#4A90D9]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-[6px] mb-[4px]">
                              <span className="text-[12px] font-semibold text-[#F1F5F9]">You</span>
                              <span className="text-[11px] text-[#64748B]">{formatTime(inq.createdAt)}</span>
                            </div>
                            <div className="bg-white/[0.06] rounded-[10px] rounded-tl-[2px] px-[12px] py-[8px]">
                              <p className="text-[13px] text-[#F1F5F9] leading-[1.5]">{inq.message}</p>
                            </div>
                          </div>
                        </div>

                        {/* Landlord response & replies */}
                        {responseMessages.map((msg, idx) => (
                          <div key={idx} className="flex gap-[10px]">
                            <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 ${msg.type === 'landlord' ? 'bg-[rgba(124,58,237,0.2)]' : 'bg-[rgba(74,222,128,0.15)]'}`}>
                              {msg.type === 'landlord' ? (
                                <MessageCircle className="w-[14px] h-[14px] text-[#A78BFA]" />
                              ) : (
                                <User className="w-[14px] h-[14px] text-[#4ADE80]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-[6px] mb-[4px]">
                                <span className={`text-[12px] font-semibold ${msg.type === 'landlord' ? 'text-[#A78BFA]' : 'text-[#4ADE80]'}`}>
                                  {msg.type === 'landlord' ? 'Landlord' : 'You'}
                                </span>
                                <span className="text-[11px] text-[#64748B]">{msg.date || formatTime(inq.respondedAt)}</span>
                              </div>
                              <div className={`rounded-[10px] rounded-tl-[2px] px-[12px] py-[8px] ${msg.type === 'landlord' ? 'bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)]' : 'bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)]'}`}>
                                <p className="text-[13px] text-[#F1F5F9] leading-[1.5]" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply input */}
                      {inq.response && (
                        <div className="mt-[14px] pt-[12px] border-t border-white/[0.06]">
                          <div className="flex gap-[8px]">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              disabled={isReplyPending}
                              className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-[10px] px-[12px] py-[8px] text-[13px] text-[#F1F5F9] placeholder:text-[#64748B] focus:outline-none focus:border-[#4A90D9] transition-colors disabled:opacity-50"
                              value={replyText[inq.id] || ''}
                              onChange={(e) => setReplyText((prev) => ({ ...prev, [inq.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleReplySubmit(inq.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleReplySubmit(inq.id)}
                              disabled={!replyText[inq.id]?.trim() || isReplyPending}
                              className="shrink-0 w-[36px] h-[36px] rounded-[10px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(74,144,217,0.3)] transition-all"
                            >
                              {isReplyPending ? (
                                <Loader2 className="w-[15px] h-[15px] animate-spin" />
                              ) : (
                                <Send className="w-[15px] h-[15px]" />
                              )}
                            </button>
                          </div>
                          {replyError[inq.id] && (
                            <p className="text-[12px] text-[#F87171] mt-[6px]">{replyError[inq.id]}</p>
                          )}
                        </div>
                      )}

                      <p className="text-[12px] text-[#64748B] mt-[10px]">
                        {formatDate(inq.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              }

              const addr = prop.address || {};
              const typeLabel = TYPE_LABELS[prop.propertyType] || prop.propertyType || 'Property';
              const typeColor = TYPE_COLORS[prop.propertyType] || 'bg-white/10 text-[#94A3B8]';
              const photoUrl = prop.primaryPhoto?.url || prop.photos?.[0]?.url;
              const photos = photoUrl ? (photoUrl.startsWith('http') ? photoUrl : '/' + photoUrl) : null;

              return (
                <div key={inq.id} className="group bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[12px] overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,144,217,0.15)] hover:-translate-y-[2px] hover:border-white/[0.14]">
                  {/* Property header */}
                  <Link to={`/property/${prop.id}`} className="block no-underline text-inherit">
                    <div className="relative">
                      <div
                        className="h-[160px] bg-cover bg-center"
                        style={
                          photos
                            ? { backgroundImage: `url(${photos})` }
                            : { background: 'linear-gradient(135deg,rgba(74,144,217,0.35),rgba(124,58,237,0.35))' }
                        }
                      />
                      <div className="absolute top-[12px] left-[12px]">
                        <span className={`inline-block px-[10px] py-[3px] rounded-full text-[11px] font-semibold ${typeColor}`}>
                          {typeLabel}
                        </span>
                      </div>
                      <div className="absolute top-[12px] right-[12px]">
                        <span className="inline-flex items-center gap-[6px] px-[10px] py-[3px] rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-sm text-white">
                          <span className={`inline-block w-[7px] h-[7px] rounded-full ${config.dotClass}`} />
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="p-[20px]">
                    {/* Property title & price */}
                    <Link to={`/property/${prop.id}`} className="block no-underline text-inherit">
                      <h3 className="text-[16px] font-semibold text-[#F1F5F9] mb-[4px] truncate leading-[1.3]">
                        {prop.title || 'Property'}
                      </h3>
                      <div className="flex items-center gap-[12px] mb-[10px]">
                        <div className="text-[18px] font-bold tracking-[-0.02em] text-[#F1F5F9]">
                          ${(prop.price ?? 0).toLocaleString()}
                          <span className="text-[13px] font-normal text-[#64748B]">/mo</span>
                        </div>
                        <span className="text-[12px] text-[#94A3B8]">
                          {addr.street || prop.addressStreet || ''}, {addr.city || prop.addressCity || ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-[14px] text-[12px] text-[#64748B] mb-[14px]">
                        <span className="inline-flex items-center gap-[4px]">
                          <BedDouble className="w-[13px] h-[13px]" />
                          {(prop.bedrooms ?? 0)} bd
                        </span>
                        <span className="inline-flex items-center gap-[4px]">
                          <Bath className="w-[13px] h-[13px]" />
                          {(prop.bathrooms ?? 0)} ba
                        </span>
                        {prop.squareFeet && (
                          <span className="inline-flex items-center gap-[4px]">
                            <Ruler className="w-[13px] h-[13px]" />
                            {prop.squareFeet.toLocaleString()} sqft
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Conversation thread */}
                    <div className="border-t border-white/[0.06] pt-[14px]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748B] mb-[10px]">Conversation</p>
                      <div className="space-y-[10px]">
                        {/* Your message */}
                        <div className="flex gap-[10px]">
                          <div className="w-[28px] h-[28px] rounded-full bg-[rgba(74,144,217,0.2)] flex items-center justify-center shrink-0">
                            <User className="w-[14px] h-[14px] text-[#4A90D9]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-[6px] mb-[4px]">
                              <span className="text-[12px] font-semibold text-[#F1F5F9]">You</span>
                              <span className="text-[11px] text-[#64748B]">{formatTime(inq.createdAt)}</span>
                            </div>
                            <div className="bg-white/[0.06] rounded-[10px] rounded-tl-[2px] px-[12px] py-[8px]">
                              <p className={`text-[13px] text-[#F1F5F9] leading-[1.5] ${!isExpanded && inq.message.length > 120 ? 'line-clamp-2' : ''}`}>
                                {inq.message}
                              </p>
                              {inq.message.length > 120 && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpandedId(isExpanded ? null : inq.id);
                                  }}
                                  className="text-[11px] text-[#4A90D9] mt-[4px] hover:underline cursor-pointer bg-transparent border-none p-0"
                                >
                                  {isExpanded ? (
                                    <span className="inline-flex items-center gap-[4px]"><ChevronUp className="w-[12px] h-[12px]" /> Show less</span>
                                  ) : (
                                    <span className="inline-flex items-center gap-[4px]"><ChevronDown className="w-[12px] h-[12px]" /> Read more</span>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Landlord response & renter replies */}
                        {responseMessages.map((msg, idx) => (
                          <div key={idx} className="flex gap-[10px]">
                            <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 ${msg.type === 'landlord' ? 'bg-[rgba(124,58,237,0.2)]' : 'bg-[rgba(74,222,128,0.15)]'}`}>
                              {msg.type === 'landlord' ? (
                                <MessageCircle className="w-[14px] h-[14px] text-[#A78BFA]" />
                              ) : (
                                <User className="w-[14px] h-[14px] text-[#4ADE80]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-[6px] mb-[4px]">
                                <span className={`text-[12px] font-semibold ${msg.type === 'landlord' ? 'text-[#A78BFA]' : 'text-[#4ADE80]'}`}>
                                  {msg.type === 'landlord' ? 'Landlord' : 'You'}
                                </span>
                                <span className="text-[11px] text-[#64748B]">{msg.date || formatTime(inq.respondedAt)}</span>
                              </div>
                              <div className={`rounded-[10px] rounded-tl-[2px] px-[12px] py-[8px] ${msg.type === 'landlord' ? 'bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)]' : 'bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)]'}`}>
                                <p className="text-[13px] text-[#F1F5F9] leading-[1.5]" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reply input */}
                    {inq.response && (
                      <div className="mt-[14px] pt-[12px] border-t border-white/[0.06]">
                        <div className="flex gap-[8px]">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            disabled={isReplyPending}
                            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-[10px] px-[12px] py-[8px] text-[13px] text-[#F1F5F9] placeholder:text-[#64748B] focus:outline-none focus:border-[#4A90D9] transition-colors disabled:opacity-50"
                            value={replyText[inq.id] || ''}
                            onChange={(e) => setReplyText((prev) => ({ ...prev, [inq.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleReplySubmit(inq.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleReplySubmit(inq.id)}
                            disabled={!replyText[inq.id]?.trim() || isReplyPending}
                            className="shrink-0 w-[36px] h-[36px] rounded-[10px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(74,144,217,0.3)] transition-all"
                          >
                            {isReplyPending ? (
                              <Loader2 className="w-[15px] h-[15px] animate-spin" />
                            ) : (
                              <Send className="w-[15px] h-[15px]" />
                            )}
                          </button>
                        </div>
                        {replyError[inq.id] && (
                          <p className="text-[12px] text-[#F87171] mt-[6px]">{replyError[inq.id]}</p>
                        )}
                      </div>
                    )}

                    {/* View property button */}
                    <div className="mt-[14px]">
                      <Link
                        to={`/property/${prop.id}`}
                        className="inline-flex items-center justify-center gap-[8px] font-semibold cursor-pointer border transition-all duration-200 font-[inherit] no-underline w-full h-[40px] px-[14px] rounded-[10px] text-[14px] bg-white/10 text-[#F1F5F9] border-white/10 hover:bg-white/[0.15]"
                      >
                        <Eye className="w-[16px] h-[16px]" /> View Property
                      </Link>
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
