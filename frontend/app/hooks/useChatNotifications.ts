import { useState, useEffect, useCallback } from 'react';
import {
  connectChatSocket,
  disconnectChatSocket,
  onNewMessage,
  onChatError,
  offNewMessage,
  offChatError,
} from '~/services/chatSocketService';
import { useAuth } from './useAuth';

interface ChatNotification {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

// Module-level state persists across component unmounts
let globalUnreadCount = 0;
let globalChatNotifications: ChatNotification[] = [];
let listeners: Set<() => void> = new Set();
let socketHandlersRegistered = false;

function notifyListeners() {
  listeners.forEach((cb) => cb());
}

function isMessagesPage(): boolean {
  const path = window.location.pathname;
  return path === '/messages' || path === '/admin/messages';
}

export function resetChatNotifications(): void {
  globalUnreadCount = 0;
  globalChatNotifications = [];
  socketHandlersRegistered = false;
  notifyListeners();
}

export function useChatNotifications() {
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(globalUnreadCount);
  const [chatNotifications, setChatNotifications] = useState<ChatNotification[]>(globalChatNotifications);

  // Sync with global state
  useEffect(() => {
    const sync = () => {
      setUnreadCount(globalUnreadCount);
      setChatNotifications([...globalChatNotifications]);
    };
    listeners.add(sync);
    return () => { listeners.delete(sync); };
  }, []);

  // Reset on user change (logout/login)
  useEffect(() => {
    if (!user) {
      resetChatNotifications();
    }
  }, [user?.id]);

  // Connect socket and listen for messages — singleton pattern
  useEffect(() => {
    if (!isAuthenticated) return;

    connectChatSocket();

    // Prevent duplicate handler registration across multiple hook instances
    if (socketHandlersRegistered) return;
    socketHandlersRegistered = true;

    const handleNewMessage = (payload: any) => {
      if (!payload?.message) return;

      const msg = payload.message;
      const notification: ChatNotification = {
        id: msg.id,
        conversationId: payload.conversationId,
        senderId: msg.senderId,
        senderRole: msg.senderRole,
        content: msg.content,
        createdAt: msg.createdAt,
      };

      globalChatNotifications.unshift(notification);
      if (globalChatNotifications.length > 20) {
        globalChatNotifications = globalChatNotifications.slice(0, 20);
      }

      // Only increment unread badge if user is not currently on messages page.
      // When on the messages page, the page component handles its own unread counts.
      if (!isMessagesPage()) {
        globalUnreadCount += 1;
      }
      notifyListeners();
    };

    const handleError = (payload: any) => {
      // Log socket errors silently — could be rate limit or auth issues
      console.warn('[ChatSocket] Error:', payload?.message || 'Unknown');
    };

    onNewMessage(handleNewMessage);
    onChatError(handleError);

    return () => {
      offNewMessage(handleNewMessage);
      offChatError(handleError);
      socketHandlersRegistered = false;
    };
  }, [isAuthenticated]);

  const markChatAsRead = useCallback(() => {
    globalUnreadCount = 0;
    notifyListeners();
  }, []);

  const markOneChatAsRead = useCallback((id: string) => {
    globalChatNotifications = globalChatNotifications.filter((n) => n.id !== id);
    if (globalUnreadCount > 0) {
      globalUnreadCount -= 1;
    }
    notifyListeners();
  }, []);

  const clearChatNotifications = useCallback(() => {
    globalUnreadCount = 0;
    globalChatNotifications = [];
    notifyListeners();
  }, []);

  return {
    chatUnreadCount: unreadCount,
    chatNotifications,
    markChatAsRead,
    markOneChatAsRead,
    clearChatNotifications,
  };
}
