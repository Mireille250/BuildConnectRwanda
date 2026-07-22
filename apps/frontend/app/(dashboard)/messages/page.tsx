'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { SkeletonConversation } from '@/components/shared/Skeletons';
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

const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
];

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
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!accessToken) return;
    const socket = io(
      `${process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000'}/messaging`,
      { auth: { token: accessToken }, transports: ['websocket', 'polling'] }
    );
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('newMessage', (message: any) => {
      const normalized = { ...message, createdAt: message.createdAt ?? message.created_at ?? new Date().toISOString() };
      setMessages((prev) => prev.find((m) => m.id === normalized.id) ? prev : [...prev, normalized]);
      setConversations((prev) => prev.map((c) => c.conversationId === message.conversationId ? { ...c, lastMessage: message.content, lastMessageAt: normalized.createdAt } : c));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    socket.on('messageSent', (message: any) => {
      const normalized = { ...message, createdAt: message.createdAt ?? message.created_at ?? new Date().toISOString() };
      setMessages((prev) => prev.find((m) => m.id === normalized.id) ? prev : [...prev, normalized]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    socket.on('userTyping', ({ userId }: { userId: string }) => { if (userId !== user?.id) setOtherUserTyping(true); });
    socket.on('userStoppedTyping', ({ userId }: { userId: string }) => { if (userId !== user?.id) setOtherUserTyping(false); });
    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [accessToken]);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    const convId = searchParams.get('conv');
    if (convId && conversations.length > 0) {
      const conv = conversations.find((c) => c.conversationId === convId);
      if (conv) selectConversation(conv);
    }
  }, [searchParams, conversations]);

  async function fetchConversations() {
    setLoading(true);
    try {
      const { data } = await api.get('/messaging/conversations');
      setConversations(data.value ?? data);
    } catch { toast.error('Failed to load conversations'); }
    finally { setLoading(false); }
  }

  async function selectConversation(conv: Conversation) {
    setSelectedConv(conv.conversationId);
    setSelectedUser(conv.otherUser);
    setMessagesLoading(true);
    try {
      const { data } = await api.get(`/messaging/conversations/${conv.conversationId}/messages`);
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { toast.error('Failed to load messages'); }
    finally { setMessagesLoading(false); }
  }

  function sendMessage() {
    if (!messageInput.trim() || !selectedConv || !selectedUser) return;
    if (!socketRef.current?.connected) { toast.error('Not connected. Please refresh.'); return; }
    socketRef.current.emit('sendMessage', { receiverId: selectedUser.id, conversationId: selectedConv, content: messageInput.trim() });
    setMessageInput('');
    stopTyping();
  }

  function handleTyping() {
    if (!socketRef.current?.connected || !selectedUser) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit('typing', { receiverId: selectedUser.id, conversationId: selectedConv });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  }

  function stopTyping() {
    if (!socketRef.current?.connected || !selectedUser) return;
    isTypingRef.current = false;
    socketRef.current.emit('stopTyping', { receiverId: selectedUser.id, conversationId: selectedConv });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });
  }

  function formatConvTime(date: string | null) {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return formatTime(date);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-RW', { day: 'numeric', month: 'short' });
  }

  function getAvatar(index: number) {
    return AVATARS[index % AVATARS.length];
  }

  const filteredConversations = conversations.filter((c) =>
    `${c.otherUser.firstName} ${c.otherUser.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    msgs.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      const existing = groups.find((g) => g.date === date);
      if (existing) { existing.messages.push(msg); }
      else { groups.push({ date, messages: [msg] }); }
    });
    return groups;
  };

  function formatGroupDate(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-RW', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
            <span className="font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
          </a>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${connected ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
              {connected ? 'Online' : 'Connecting...'}
            </div>
            <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => router.push('/dashboard')}>
              ← Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r bg-white flex flex-col shrink-0">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-gray-900">Messages</h1>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{conversations.length}</span>
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
  <div className="space-y-1 p-2">
    {[1, 2, 3].map((i) => (
      <SkeletonConversation key={i} />
    ))}
  </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-3xl mb-3">💬</p>
                <p className="font-semibold text-gray-900 text-sm mb-1">No conversations yet</p>
                <p className="text-gray-400 text-xs mb-4">Find a professional and click Message to start chatting</p>
                <Button size="sm" className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs" onClick={() => router.push('/search')}>
                  Find Professionals
                </Button>
              </div>
            ) : (
              filteredConversations.map((conv, index) => (
                <button
                  key={conv.conversationId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${selectedConv === conv.conversationId ? 'bg-blue-50 border-l-4 border-l-blue-900' : ''}`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.otherUser.profilePhoto ?? getAvatar(index)}
                      alt={conv.otherUser.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = getAvatar(index); }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm font-semibold truncate ${selectedConv === conv.conversationId ? 'text-blue-900' : 'text-gray-900'}`}>
                        {conv.otherUser.firstName} {conv.otherUser.lastName}
                      </p>
                      <p className="text-xs text-gray-400 shrink-0 ml-2">{formatConvTime(conv.lastMessageAt)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 truncate flex-1">{conv.lastMessage ?? 'Start a conversation'}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 bg-blue-900 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-300 mt-0.5">{conv.otherUser.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-xs">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">💬</div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Your Messages</h2>
                <p className="text-gray-400 text-sm leading-relaxed">Select a conversation to start chatting, or find a professional to connect with.</p>
                <Button className="mt-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm" onClick={() => router.push('/search')}>
                  Find Professionals
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b px-6 py-4 flex items-center gap-4 shrink-0">
                <div className="relative">
                  <img
                    src={selectedUser?.profilePhoto ?? getAvatar(0)}
                    alt={selectedUser?.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = getAvatar(0); }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{selectedUser?.firstName} {selectedUser?.lastName}</p>
                  <p className="text-xs text-green-500 font-medium">● Online</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-lg text-xs border-gray-200" onClick={() => router.push(`/users/${selectedUser?.id}`)}>
                  View Profile
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-3xl mb-3">👋</p>
                      <p className="font-semibold text-gray-900 mb-1">Start the conversation</p>
                      <p className="text-gray-400 text-sm">Say hello to {selectedUser?.firstName}!</p>
                    </div>
                  </div>
                ) : (
                  messageGroups.map((group) => (
                    <div key={group.date}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
                          {formatGroupDate(group.date)}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      {/* Messages in group */}
                      <div className="space-y-3">
                        {group.messages.map((msg) => {
                          const isMe = msg.senderId === user?.id;
                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                              {!isMe && (
                                <img
                                  src={selectedUser?.profilePhoto ?? getAvatar(0)}
                                  alt=""
                                  className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                                  onError={(e) => { (e.target as HTMLImageElement).src = getAvatar(0); }}
                                />
                              )}
                              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  isMe
                                    ? 'bg-blue-900 text-white rounded-br-sm'
                                    : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                                }`}>
                                  {msg.content}
                                </div>
                                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                  <p className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</p>
                                  {isMe && (
                                    <span className="text-[10px] text-blue-400">
                                      {msg.status === 'READ' ? '✓✓' : '✓'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}

                {/* Typing indicator */}
                {otherUserTyping && (
                  <div className="flex items-end gap-2">
                    <img src={selectedUser?.profilePhoto ?? getAvatar(0)} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = getAvatar(0); }} />
                    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1 items-center">
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
              <div className="bg-white border-t px-6 py-4 shrink-0">
                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 flex items-end gap-2 border border-gray-200 focus-within:border-blue-300 transition-colors">
                    <textarea
                      placeholder={`Message ${selectedUser?.firstName}...`}
                      value={messageInput}
                      onChange={(e) => { setMessageInput(e.target.value); handleTyping(); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      rows={1}
                      className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent resize-none"
                      style={{ maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || !connected}
                    className="w-11 h-11 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-200 text-white rounded-2xl flex items-center justify-center transition-colors shrink-0"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">Press Enter to send · Shift+Enter for new line</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}