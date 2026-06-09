// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, Loader2, ArrowLeft, Inbox } from 'lucide-react';
import {
  connectChatSocket,
  joinConversation,
  leaveConversation,
  sendMessage,
  onNewMessage,
  onChatError,
  offNewMessage,
  offChatError,
} from '~/services/chatSocketService';
import { useChatNotifications } from '~/hooks/useChatNotifications';
import { useAuth } from '~/hooks/useAuth';

const API = (import.meta as any).env?.VITE_API_URL || '/api';
const STORAGE_KEY = 'messages_selected_conv';

function getConvFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('conv');
}

function setConvInUrl(convId: string | null): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (convId) {
    url.searchParams.set('conv', convId);
  } else {
    url.searchParams.delete('conv');
  }
  window.history.replaceState(null, '', url.toString());
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [mobileShowList, setMobileShowList] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<string | null>(null);
  const { markChatAsRead } = useChatNotifications();
  const { user } = useAuth();

  // Initialize selected conversation from URL or sessionStorage
  const [selectedConversation, setSelectedConversation] = useState<string | null>(() => {
    const fromUrl = getConvFromUrl();
    if (fromUrl) return fromUrl;
    const fromStorage = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
    return fromStorage;
  });

  // Keep ref in sync with selected conversation for socket handlers
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Clear chat notification badge when on this page
  useEffect(() => {
    markChatAsRead();
  }, [markChatAsRead]);

  // Load conversations
  useEffect(() => {
    fetch(`${API}/chat/conversations`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => {
        setConversations(json?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Connect socket and listen for real-time messages
  useEffect(() => {
    connectChatSocket();

    const handleNewMessage = (payload: any) => {
      const { conversationId, message } = payload || {};
      if (!message || !conversationId) return;
      // If it's for the currently selected conversation, append to messages
      if (conversationId === selectedConversationRef.current) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      } else {
        // Increment unread count for other conversations
        setUnreadCounts((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || 0) + 1,
        }));
      }
    };

    const handleError = (payload: any) => {
      setSocketError(payload?.message || 'Chat error');
      setTimeout(() => setSocketError(null), 4000);
    };

    onNewMessage(handleNewMessage);
    onChatError(handleError);

    return () => {
      offNewMessage(handleNewMessage);
      offChatError(handleError);
    };
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConversation) return;
    joinConversation(selectedConversation);
    fetch(`${API}/chat/conversations/${selectedConversation}/messages`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => setMessages(json?.data || []))
      .catch(() => setMessages([]));
  }, [selectedConversation]);

  const selectConversation = useCallback((convId: string | null) => {
    leaveConversation();
    setSelectedConversation(convId);
    setConvInUrl(convId);
    if (convId) {
      // Mark messages as read on the backend
      fetch(`${API}/chat/conversations/${convId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      }).catch(() => {});
      // Clear local unread count
      setUnreadCounts((prev) => ({ ...prev, [convId]: 0 }));
      sessionStorage.setItem(STORAGE_KEY, convId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setMessages([]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      sendMessage({ conversationId: selectedConversation, content });
    } catch {
      // noop — socket will broadcast or error
    } finally {
      setSending(false);
    }
  }, [newMessage, selectedConversation, sending]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px] text-[#64748B]">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)]">
      {/* Conversations sidebar */}
      <div className={`w-full lg:w-[300px] flex-shrink-0 bg-[#0B0F1A] border-r border-white/[0.08] overflow-y-auto ${mobileShowList ? 'flex' : 'hidden lg:flex'} flex-col`}>
        <div className="p-[16px] border-b border-white/[0.06]">
          <h2 className="text-[16px] font-bold">Messages</h2>
        </div>

        {conversations.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-[24px] text-center">
            <Inbox className="w-[32px] h-[32px] text-[#64748B] mb-[8px]" />
            <p className="text-[14px] text-[#94A3B8]">No conversations yet</p>
            <p className="text-[12px] text-[#64748B] mt-[4px]">
              Start a conversation from a property page
            </p>
          </div>
        )}

        {conversations.map((conv) => {
          const isMeRenter = user?.id === conv.renterId;
          const otherPerson = isMeRenter ? conv.admin : conv.renter;
          const displayName = otherPerson?.name || (isMeRenter ? 'Admin' : 'Renter');
          const initial = (displayName.charAt(0) || 'U').toUpperCase();
          const subtitle = conv.property?.title || conv.subject || 'General inquiry';
          const isActive = selectedConversation === conv.id;

          return (
            <div
              key={conv.id}
              onClick={() => {
                selectConversation(conv.id);
                setMobileShowList(false);
              }}
              className={`p-[14px] cursor-pointer transition-colors border-b border-white/[0.04] ${
                isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-[10px]">
                <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0 ${
                  isActive ? 'bg-gradient-to-br from-[#4A90D9] to-[#7C3AED]' : 'bg-gradient-to-br from-[#4A90D9]/60 to-[#7C3AED]/60'
                }`}>
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#F1F5F9] truncate">
                    {displayName}
                  </p>
                  <p className="text-[12px] text-[#64748B] truncate">
                    {subtitle}
                  </p>
                </div>
                {unreadCounts[conv.id] > 0 && !isActive && (
                  <div className="min-w-[20px] h-[20px] rounded-full bg-[#EF4444] text-white text-[11px] font-bold flex items-center justify-center px-[6px] shrink-0">
                    {unreadCounts[conv.id]}
                  </div>
                )}
                {isActive && !unreadCounts[conv.id] && (
                  <div className="w-[8px] h-[8px] rounded-full bg-[#4A90D9] shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Messages area */}
      <div className={`flex-1 flex flex-col bg-[#080C14] ${mobileShowList ? 'hidden lg:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            <div className="flex items-center gap-[12px] px-[16px] py-[12px] border-b border-white/[0.06] lg:hidden">
              <button
                type="button"
                onClick={() => setMobileShowList(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5 transition-colors"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-[18px] h-[18px]" />
              </button>
              <div>
                {(() => {
                  const conv = conversations.find((c) => c.id === selectedConversation);
                  if (!conv) return null;
                  const isMeRenter = user?.id === conv.renterId;
                  const otherPerson = isMeRenter ? conv.admin : conv.renter;
                  return (
                    <>
                      <p className="text-[14px] font-medium text-[#F1F5F9]">
                        {otherPerson?.name || (isMeRenter ? 'Admin' : 'Renter')}
                      </p>
                      <p className="text-[12px] text-[#64748B]">
                        {conv.property?.title || conv.subject || 'General inquiry'}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            {socketError && (
              <div className="px-[16px] py-[8px] bg-[rgba(248,113,113,0.1)] border-b border-[rgba(248,113,113,0.3)] text-[#F87171] text-[13px]">
                {socketError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-[16px] sm:p-[24px] space-y-[12px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderRole === 'renter' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-[12px] px-[14px] sm:px-[16px] py-[10px] ${
                      msg.senderRole === 'renter'
                        ? 'bg-[rgba(74,144,217,0.15)] text-[#F1F5F9]'
                        : 'bg-white/[0.06] text-[#94A3B8]'
                    }`}
                  >
                    <p className="text-[14px]">{msg.content}</p>
                    <p className="text-[11px] text-[#64748B] mt-[4px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-[12px] sm:p-[16px] border-t border-white/[0.06] bg-[#0B0F1A]">
              <div className="flex gap-[8px]">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="Type a message..."
                  className="flex-1 h-[44px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[14px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)]"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="h-[44px] w-[44px] rounded-[10px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white flex items-center justify-center hover:shadow-[0_0_20px_rgba(74,144,217,0.3)] transition-all cursor-pointer border-none disabled:opacity-50"
                >
                  <Send className="w-[16px] h-[16px]" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#64748B]">
            <div className="text-center">
              <MessageSquare className="w-[32px] h-[32px] mx-auto mb-[8px]" />
              <p className="text-[14px]">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
