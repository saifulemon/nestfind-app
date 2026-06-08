// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, Loader2, User } from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/chat/conversations`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => {
        setConversations(json?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;
    fetch(`${API}/chat/conversations/${selectedConversation}/messages`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => setMessages(json?.data || []));
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      await fetch(`${API}/chat/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
        credentials: 'include',
      });
      setNewMessage('');
      // Refresh messages
      const res = await fetch(`${API}/chat/conversations/${selectedConversation}/messages`, { credentials: 'include' });
      const json = await res.json();
      setMessages(json?.data || []);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <Loader2 className="w-[32px] h-[32px] animate-spin mb-[16px] text-[#4A90D9]" />
        <p className="text-[15px] text-[#64748B]">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[120px]">
        <MessageSquare className="w-[48px] h-[48px] text-[#64748B] mb-[16px]" />
        <p className="text-[18px] font-semibold text-[#F1F5F9]">No conversations yet</p>
        <p className="text-[14px] text-[#64748B] mt-[4px]">Start a chat from a property page</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)]">
      {/* Conversations sidebar */}
      <div className="w-[300px] flex-shrink-0 bg-[#0B0F1A] border-r border-white/[0.08] overflow-y-auto">
        <div className="p-[16px] border-b border-white/[0.06]">
          <h2 className="text-[16px] font-bold">Messages</h2>
        </div>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setSelectedConversation(conv.id)}
            className={`p-[14px] cursor-pointer transition-colors border-b border-white/[0.04] ${
              selectedConversation === conv.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] flex items-center justify-center text-[12px] font-bold text-white">
                {(conv.renter?.name?.charAt(0) || conv.admin?.name?.charAt(0) || 'U').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#F1F5F9] truncate">
                  {conv.renter?.name || conv.admin?.name || 'User'}
                </p>
                <p className="text-[12px] text-[#64748B] truncate">
                  {conv.property?.title || 'General inquiry'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col bg-[#080C14]">
        {selectedConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-[24px] space-y-[12px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderRole === 'renter' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-[12px] px-[16px] py-[10px] ${
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

            <div className="p-[16px] border-t border-white/[0.06] bg-[#0B0F1A]">
              <div className="flex gap-[8px]">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                  placeholder="Type a message..."
                  className="flex-1 h-[44px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[14px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)]"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className="h-[44px] w-[44px] rounded-[10px] bg-gradient-to-r from-[#4A90D9] to-[#7C3AED] text-white flex items-center justify-center hover:shadow-[0_0_20px_rgba(74,144,217,0.3)] transition-all cursor-pointer border-none"
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
