'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Conversation {
  conversationId: string;
  updatedAt: string;
  unreadCount: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
    role: string;
  };
}

interface Message {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: {
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<Conversation['otherUser'] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to Socket.IO
  useEffect(() => {
    if (!accessToken) return;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

const socket = io(
  `${process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000'}/messaging`,
  {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
  }
);

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

 socket.on('newMessage', (message: any) => {
  const normalized = {
    ...message,
    createdAt: message.createdAt ?? message.created_at ?? new Date().toISOString(),
  };
  setMessages((prev) => {
    const exists = prev.find((m) => m.id === normalized.id);
    if (exists) return prev;
    return [...prev, normalized];
  });
  setConversations((prev) =>
    prev.map((c) =>
      c.conversationId === message.conversationId
        ? { ...c, lastMessage: message.content, lastMessageAt: normalized.createdAt }
        : c
    )
  );
  setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
});

socket.on('messageSent', (message: any) => {
  const normalized = {
    ...message,
    createdAt: message.createdAt ?? message.created_at ?? new Date().toISOString(),
  };
  setMessages((prev) => {
    const exists = prev.find((m) => m.id === normalized.id);
    if (exists) return prev;
    return [...prev, normalized];
  });
  setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
});

    socket.on('userStoppedTyping', ({ userId }: { userId: string }) => {
      if (userId !== user?.id) setOtherUserTyping(false);
    });

    socket.on('error', ({ message }: { message: string }) => {
      toast.error(message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle conv param from URL (?conv=uuid)
  useEffect(() => {
    const convId = searchParams.get('conv');
    if (convId && conversations.length > 0) {
      const conv = conversations.find((c) => c.conversationId === convId);
      if (conv) {
        selectConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  async function fetchConversations() {
    setLoading(true);
    try {
      const { data } = await api.get('/messaging/conversations');
      setConversations(data.value ?? data);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }

  async function selectConversation(conv: Conversation) {
    setSelectedConv(conv.conversationId);
    setSelectedUser(conv.otherUser);
    setMessagesLoading(true);
    try {
      const { data } = await api.get(
        `/messaging/conversations/${conv.conversationId}/messages`
      );
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function sendMessage() {
    if (!messageInput.trim() || !selectedConv || !selectedUser) return;
    if (!socketRef.current?.connected) {
      toast.error('Not connected. Please refresh.');
      return;
    }

    socketRef.current.emit('sendMessage', {
      receiverId: selectedUser.id,
      conversationId: selectedConv,
      content: messageInput.trim(),
    });

    setMessageInput('');
    stopTyping();
  }

  function handleTyping() {
    if (!socketRef.current?.connected || !selectedUser) return;
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', {
        receiverId: selectedUser.id,
        conversationId: selectedConv,
      });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  }

  function stopTyping() {
    if (!socketRef.current?.connected || !selectedUser) return;
    setIsTyping(false);
    socketRef.current.emit('stopTyping', {
      receiverId: selectedUser.id,
      conversationId: selectedConv,
    });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('en-RW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDate(date: string) {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-RW', { day: 'numeric', month: 'short' });
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>← Home</Button>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            {connected ? '🟢 Online' : '⚪ Offline'}
          </span>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Conversations Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col shrink-0">
          <div className="p-4 border-b">
            <p className="text-sm font-semibold text-gray-700">Conversations</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-gray-400 text-sm mb-2">No conversations yet</p>
                <p className="text-gray-400 text-xs">
                  Find a professional and click Message to start chatting
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => router.push('/search')}
                >
                  Find Professionals
                </Button>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.conversationId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                    selectedConv === conv.conversationId ? 'bg-orange-50 border-l-2 border-l-orange-500' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 shrink-0">
                    {conv.otherUser.firstName[0]}{conv.otherUser.lastName[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {conv.otherUser.firstName} {conv.otherUser.lastName}
                      </p>
                      {conv.lastMessageAt && (
                        <p className="text-xs text-gray-400 shrink-0 ml-1">
                          {formatDate(conv.lastMessageAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-400 truncate">
                        {conv.lastMessage ?? 'Start a conversation'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-gray-500 font-medium">Select a conversation</p>
                <p className="text-gray-400 text-sm mt-1">
                  Choose from the left or find a professional to message
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b px-6 py-3 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
                  {selectedUser?.firstName[0]}{selectedUser?.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedUser?.firstName} {selectedUser?.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{selectedUser?.role}</p>
                </div>
                <div className="ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/users/${selectedUser?.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`px-4 py-2 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-orange-500 text-white rounded-br-sm'
                              : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                          }`}>
                            {msg.content}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 px-1">
                            {formatTime(msg.createdAt)}
                            {isMe && (
                              <span className="ml-1">
                                {msg.status === 'READ' ? '✓✓' : msg.status === 'DELIVERED' ? '✓✓' : '✓'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing indicator */}
                {otherUserTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-sm px-4 py-2 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1 items-center h-4">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t p-4 shrink-0">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    className="flex-1"
                  />
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || !connected}
                  >
                    Send
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Press Enter to send</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}