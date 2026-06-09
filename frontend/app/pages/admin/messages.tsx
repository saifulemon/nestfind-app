// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Loader2,
  ArrowLeft,
  CheckCheck,
  Search,
  X,
  Inbox,
} from 'lucide-react';
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

const API = (import.meta as any).env?.VITE_API_URL || '/api';
const STORAGE_KEY = 'admin_messages_selected_conv';

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

interface Conversation {
  id: string;
  status: string;
  subject: string | null;
  propertyId: string | null;
  renterId: string;
  adminId: string;
  renter?: { name: string };
  admin?: { name: string };
  property?: { title: string };
  updatedAt: string;
}

interface ChatMessageItem {
  id: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [mobileShowList, setMobileShowList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { markChatAsRead } = useChatNotifications();

  // Track unread counts and last message preview per conversation
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastPreviews, setLastPreviews] = useState<
    Record<string, { content: string; createdAt: string }>
  >({});

  // Initialize selected conversation from URL or sessionStorage
  const [selectedConversation, setSelectedConversation] = useState<string | null>(() => {
    const fromUrl = getConvFromUrl();
    if (fromUrl) return fromUrl;
    const fromStorage = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
    return fromStorage;
  });

  // Keep ref in sync with state for socket handlers
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
        const list: Conversation[] = json?.data || [];
        setConversations(list);
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

      // Update last preview for this conversation
      setLastPreviews((prev) => ({
        ...prev,
        [conversationId]: { content: message.content, createdAt: message.createdAt },
      }));

      // If it's for the currently selected conversation, append to messages
      if (conversationId === selectedConversationRef.current) {
        setMessages((prev) => {
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

      // Move this conversation to the top of the list
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conversationId);
        if (idx === -1) return prev;
        const updated = [...prev];
        const conv = { ...updated[idx], updatedAt: new Date().toISOString() };
        updated.splice(idx, 1);
        updated.unshift(conv);
        return updated;
      });
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
    fetch(`${API}/chat/conversations/${selectedConversation}/messages`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((json) => {
        const msgs: ChatMessageItem[] = json?.data || [];
        setMessages(msgs);
        // Initialize last preview from loaded messages
        if (msgs.length > 0) {
          const last = msgs[msgs.length - 1];
          setLastPreviews((prev) => ({
            ...prev,
            [selectedConversation]: {
              content: last.content,
              createdAt: last.createdAt,
            },
          }));
        }
      });
  }, [selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = useCallback((convId: string | null) => {
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
    setMobileShowList(false);
  }, []);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Update last preview immediately
    const now = new Date().toISOString();
    setLastPreviews((prev) => ({
      ...prev,
      [selectedConversation]: { content, createdAt: now },
    }));

    // Move conversation to top
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === selectedConversation);
      if (idx === -1) return prev;
      const updated = [...prev];
      const conv = { ...updated[idx], updatedAt: now };
      updated.splice(idx, 1);
      updated.unshift(conv);
      return updated;
    });

    try {
      sendMessage({ conversationId: selectedConversation, content });
    } catch {
      // noop — socket will broadcast or error
    } finally {
      setSending(false);
    }
  }, [newMessage, selectedConversation, sending]);

  // Helper: format last message preview (truncate + timestamp)
  const formatPreview = (content: string) => {
    if (!content) return '';
    return content.length > 40 ? `${content.slice(0, 40)}…` : content;
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatMessageDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (conv.renter?.name || '').toLowerCase().includes(q) ||
      (conv.property?.title || '').toLowerCase().includes(q)
    );
  });

  // Group messages by date for rendering separators
  const messageGroups = (() => {
    const groups: { date: string; messages: ChatMessageItem[] }[] = [];
    messages.forEach((msg) => {
      const dateKey = formatMessageDate(msg.createdAt);
      if (groups.length === 0 || groups[groups.length - 1].date !== dateKey) {
        groups.push({ date: dateKey, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    return groups;
  })();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px] text-[#64748B]">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)] bg-[#F8FAFC]">
      {/* Conversations sidebar */}
      <div
        className={`w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden ${
          mobileShowList ? 'flex' : 'hidden lg:flex'
        } flex-col`}
      >
        {/* Sidebar header */}
        <div className="p-[16px] pb-[12px] border-b border-gray-100">
          <div className="flex items-center justify-between mb-[12px]">
            <h2 className="text-[18px] font-bold text-[#1E293B]">Messages</h2>
            <Link
              to="/admin/dashboard"
              className="text-[13px] text-[#4A90D9] hover:text-[#5BA0E9] no-underline font-medium"
            >
              Dashboard
            </Link>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full h-[36px] bg-[#F8FAFC] border border-gray-200 rounded-[8px] pl-[32px] pr-[28px] text-[13px] text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#4A90D9] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="w-[14px] h-[14px]" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-[32px] text-center h-full">
              <Inbox className="w-[40px] h-[40px] text-[#CBD5E1] mb-[12px]" />
              <p className="text-[14px] text-[#64748B] font-medium">No conversations yet</p>
              <p className="text-[12px] text-[#94A3B8] mt-[4px]">Renter messages will appear here</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-[32px] text-center h-full">
              <Search className="w-[32px] h-[32px] text-[#CBD5E1] mb-[8px]" />
              <p className="text-[14px] text-[#94A3B8]">No matches found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const preview = lastPreviews[conv.id];
              const unread = unreadCounts[conv.id] || 0;
              const isSelected = selectedConversation === conv.id;
              const initial = (conv.renter?.name?.charAt(0) || 'R').toUpperCase();

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`relative cursor-pointer transition-all border-b border-gray-50 ${
                    isSelected
                      ? 'bg-[rgba(74,144,217,0.06)]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Active indicator strip */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#4A90D9] to-[#7C3AED] rounded-r-full" />
                  )}
                  <div className="p-[14px] pl-[16px]">
                    <div className="flex items-start gap-[12px]">
                      {/* Avatar */}
                      <div
                        className={`w-[44px] h-[44px] rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0 ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] shadow-[0_0_12px_rgba(74,144,217,0.25)]'
                            : 'bg-gradient-to-br from-[#64748B] to-[#94A3B8]'
                        }`}
                      >
                        {initial}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-[8px] mb-[4px]">
                          <p
                            className={`text-[14px] truncate ${
                              unread > 0
                                ? 'font-semibold text-[#1E293B]'
                                : 'font-medium text-[#475569]'
                            }`}
                          >
                            {conv.renter?.name || 'Renter'}
                          </p>
                          {preview?.createdAt && (
                            <span className="text-[11px] text-[#94A3B8] shrink-0">
                              {formatDate(preview.createdAt)}
                            </span>
                          )}
                        </div>
                        {/* Preview line */}
                        <div className="flex items-center gap-[8px]">
                          <p
                            className={`text-[13px] truncate flex-1 leading-[1.4] ${
                              unread > 0
                                ? 'text-[#334155] font-medium'
                                : 'text-[#94A3B8]'
                            }`}
                          >
                            {preview?.content
                              ? formatPreview(preview.content)
                              : conv.property?.title || 'General inquiry'}
                          </p>
                          {unread > 0 && (
                            <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-[20px] px-[6px] rounded-full bg-[#EF4444] text-white text-[11px] font-bold shadow-[0_2px_6px_rgba(239,68,68,0.3)]">
                              {unread > 99 ? '99+' : unread}
                            </span>
                          )}
                        </div>
                        {/* Property tag */}
                        {conv.property?.title && (
                          <div className="mt-[6px]">
                            <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] bg-[rgba(74,144,217,0.08)] text-[#4A90D9] text-[11px] font-medium border border-[rgba(74,144,217,0.12)]">
                              {conv.property.title.length > 30
                                ? `${conv.property.title.slice(0, 30)}…`
                                : conv.property.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages area */}
      <div
        className={`flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden ${
          mobileShowList ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Chat header — mobile */}
            <div className="flex items-center gap-[12px] px-[16px] py-[12px] border-b border-gray-100 lg:hidden shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setMobileShowList(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#1E293B] hover:bg-gray-100 transition-colors"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-[18px] h-[18px]" />
              </button>
              <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
                {(
                  conversations.find((c) => c.id === selectedConversation)
                    ?.renter?.name?.charAt(0) || 'R'
                ).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#1E293B] truncate">
                  {conversations.find((c) => c.id === selectedConversation)
                    ?.renter?.name || 'Renter'}
                </p>
                <p className="text-[12px] text-[#94A3B8] truncate">
                  {conversations.find((c) => c.id === selectedConversation)
                    ?.property?.title || 'General inquiry'}
                </p>
              </div>
            </div>

            {/* Chat header — desktop */}
            <div className="hidden lg:flex items-center gap-[14px] px-[24px] py-[14px] border-b border-gray-100 shrink-0 bg-white">
              <div className="relative">
                <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center text-[13px] font-bold text-white shadow-[0_0_12px_rgba(74,144,217,0.2)]">
                  {(
                    conversations.find((c) => c.id === selectedConversation)
                      ?.renter?.name?.charAt(0) || 'R'
                  ).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full bg-[#22C55E] border-[2px] border-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#1E293B]">
                  {conversations.find((c) => c.id === selectedConversation)
                    ?.renter?.name || 'Renter'}
                </p>
                <div className="flex items-center gap-[8px] mt-[2px]">
                  <span className="text-[12px] text-[#22C55E]">Online</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-[12px] text-[#94A3B8] truncate">
                    {conversations.find((c) => c.id === selectedConversation)
                      ?.property?.title || 'General inquiry'}
                  </span>
                </div>
              </div>
            </div>

            {socketError && (
              <div className="px-[16px] lg:px-[24px] py-[8px] bg-[rgba(239,68,68,0.05)] border-b border-[rgba(239,68,68,0.15)] text-[#EF4444] text-[13px] flex items-center gap-[8px] shrink-0">
                <div className="w-[6px] h-[6px] rounded-full bg-[#EF4444]" />
                {socketError}
              </div>
            )}

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto px-[16px] lg:px-[24px] py-[16px] lg:py-[20px]">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-[64px] h-[64px] rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-[16px]">
                      <MessageSquare className="w-[28px] h-[28px] text-[#CBD5E1]" />
                    </div>
                    <p className="text-[15px] text-[#64748B] font-medium">No messages yet</p>
                    <p className="text-[13px] text-[#94A3B8] mt-[6px]">
                      Send a message to start the conversation
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-[16px]">
                  {messageGroups.map((group) => (
                    <div key={group.date}>
                      {/* Date separator */}
                      <div className="flex items-center justify-center my-[16px]">
                        <div className="px-[12px] py-[4px] rounded-full bg-[#F1F5F9] border border-gray-200">
                          <span className="text-[11px] text-[#64748B] font-medium">
                            {group.date}
                          </span>
                        </div>
                      </div>
                      {/* Messages in this date group */}
                      <div className="space-y-[2px]">
                        {group.messages.map((msg, idx) => {
                          const isAdmin = msg.senderRole === 'admin';
                          const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                          const isFirstInGroup = !prevMsg || prevMsg.senderRole !== msg.senderRole;

                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} ${
                                isFirstInGroup ? 'mt-[12px]' : ''
                              }`}
                            >
                              {!isAdmin && isFirstInGroup && (
                                <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[#64748B] to-[#94A3B8] flex items-center justify-center text-[10px] font-bold text-white shrink-0 mr-[8px] mt-auto">
                                  {(
                                    conversations.find((c) => c.id === selectedConversation)
                                      ?.renter?.name?.charAt(0) || 'R'
                                  ).toUpperCase()}
                                </div>
                              )}
                              {!isAdmin && !isFirstInGroup && (
                                <div className="w-[28px] shrink-0 mr-[8px]" />
                              )}
                              <div
                                className={`relative max-w-[75%] sm:max-w-[65%] px-[14px] py-[10px] ${
                                  isAdmin
                                    ? 'bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] text-white rounded-[16px] rounded-br-[4px]'
                                    : 'bg-white text-[#1E293B] rounded-[16px] rounded-bl-[4px] border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                                }`}
                              >
                                <p className="text-[14px] leading-[1.5]">{msg.content}</p>
                                <div
                                  className={`flex items-center gap-[6px] mt-[6px] ${
                                    isAdmin ? 'justify-end' : 'justify-start'
                                  }`}
                                >
                                  <span
                                    className={`text-[11px] ${
                                      isAdmin ? 'text-[rgba(255,255,255,0.7)]' : 'text-[#94A3B8]'
                                    }`}
                                  >
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {isAdmin && (
                                    <CheckCheck
                                      className={`w-[13px] h-[13px] ${
                                        msg.isRead
                                          ? 'text-[#86EFAC]'
                                          : 'text-[rgba(255,255,255,0.5)]'
                                      }`}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} className="h-[1px]" />
            </div>

            {/* Input area */}
            <div className="px-[16px] lg:px-[24px] py-[12px] lg:py-[16px] border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-end gap-[10px]">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      const el = textareaRef.current;
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a reply..."
                    rows={1}
                    className="w-full min-h-[44px] max-h-[120px] bg-[#F8FAFC] border border-gray-200 rounded-[12px] px-[14px] py-[10px] text-[14px] text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#4A90D9] focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] resize-none transition-all leading-[1.5]"
                    style={{ overflow: 'hidden' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="h-[44px] w-[44px] rounded-[12px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white flex items-center justify-center hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:scale-[1.04] transition-all cursor-pointer border-none disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  ) : (
                    <Send className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#94A3B8]">
            <div className="text-center">
              <div className="w-[80px] h-[80px] rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-[20px]">
                <MessageSquare className="w-[36px] h-[36px] text-[#CBD5E1]" />
              </div>
              <p className="text-[16px] text-[#64748B] font-medium">Select a conversation</p>
              <p className="text-[13px] text-[#94A3B8] mt-[6px] max-w-[240px] mx-auto">
                Choose a conversation from the sidebar to view and reply to messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
