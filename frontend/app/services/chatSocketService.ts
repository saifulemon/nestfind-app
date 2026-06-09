import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

let socket: Socket | null = null;
let activeConversationId: string | null = null;

// Track wrapper functions so offNewMessage/offChatError can remove the right listener
const newMessageWrappers = new Map<(payload: any) => void, (payload: any) => void>();
const errorWrappers = new Map<(payload: any) => void, (payload: any) => void>();

function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/chat`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });

    socket.on('connect', () => {
      // Re-join conversation if we were in one before reconnect
      if (activeConversationId) {
        socket?.emit('joinConversation', activeConversationId);
      }
    });
  }
  return socket;
}

export function connectChatSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectChatSocket(): void {
  activeConversationId = null;
  if (socket) {
    socket.off('newMessage');
    socket.off('error');
    socket.off('connect');
    socket.disconnect();
    socket = null;
  }
  newMessageWrappers.clear();
  errorWrappers.clear();
}

export function joinConversation(conversationId: string): void {
  activeConversationId = conversationId;
  const s = getSocket();
  if (s.connected) {
    s.emit('joinConversation', conversationId);
  }
}

export function leaveConversation(): void {
  const s = getSocket();
  if (activeConversationId && s.connected) {
    s.emit('leaveConversation', activeConversationId);
  }
  activeConversationId = null;
}

export function sendMessage(params: {
  conversationId: string;
  content: string;
  messageId?: string;
}): void {
  const s = getSocket();
  s.emit('sendMessage', {
    conversationId: params.conversationId,
    content: params.content,
    messageId: params.messageId || generateMessageId(),
  });
}

export function onNewMessage(callback: (payload: {
  conversationId: string;
  message: {
    id: string;
    senderId: string;
    senderRole: string;
    content: string;
    createdAt: string;
  };
}) => void): void {
  const s = getSocket();
  const wrapper = (payload: any) => callback(payload);
  newMessageWrappers.set(callback, wrapper);
  s.on('newMessage', wrapper);
}

export function onChatError(callback: (payload: { message: string }) => void): void {
  const s = getSocket();
  const wrapper = (payload: any) => callback(payload);
  errorWrappers.set(callback, wrapper);
  s.on('error', wrapper);
}

export function offNewMessage(callback: (payload: any) => void): void {
  const s = getSocket();
  const wrapper = newMessageWrappers.get(callback);
  if (wrapper) {
    s.off('newMessage', wrapper);
    newMessageWrappers.delete(callback);
  }
}

export function offChatError(callback: (payload: any) => void): void {
  const s = getSocket();
  const wrapper = errorWrappers.get(callback);
  if (wrapper) {
    s.off('error', wrapper);
    errorWrappers.delete(callback);
  }
}

function generateMessageId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
