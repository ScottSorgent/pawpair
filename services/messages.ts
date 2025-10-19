import { Message, Thread } from '@/types';
import { supabase } from './supabase';

const USE_MOCK_DATA = true;

const mockThreads: Thread[] = [
  {
    id: 'thread-1',
    userId: 'demo-user-1',
    shelterId: 'shelter-1',
    shelterName: 'Happy Paws Shelter',
    lastMessage: 'Thanks for your interest in Max! When would you like to visit?',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 1,
  },
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: 'demo-user-1',
    senderName: 'Demo User',
    senderType: 'user',
    content: 'Hi, I am interested in meeting Max!',
    timestamp: new Date(Date.now() - 7200000),
    read: true,
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    senderId: 'shelter-1',
    senderName: 'Happy Paws Shelter',
    senderType: 'shelter',
    content: 'Thanks for your interest in Max! When would you like to visit?',
    timestamp: new Date(Date.now() - 3600000),
    read: false,
  },
];

export const messages = {
  async listThreads(userId: string): Promise<Thread[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockThreads
        .filter(t => t.userId === userId)
        .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    }

    const { data, error } = await supabase
      .from('messages')
      .select(`
        thread_id,
        content,
        created_at,
        sender_type
      `)
      .eq('thread_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const threadMap = new Map<string, Thread>();

    for (const msg of data || []) {
      const threadId = msg.thread_id;

      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, {
          id: threadId,
          userId,
          shelterId: '',
          shelterName: '',
          lastMessage: msg.content,
          lastMessageTime: new Date(msg.created_at),
          unreadCount: msg.sender_type === 'shelter' ? 1 : 0,
        });
      }
    }

    return Array.from(threadMap.values()).sort(
      (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
    );
  },

  async getThread(threadId: string): Promise<Thread> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const thread = mockThreads.find(t => t.id === threadId);
      if (!thread) {
        throw new Error('Thread not found');
      }
      return thread;
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    if (!messages || messages.length === 0) {
      throw new Error('Thread not found');
    }

    const lastMessage = messages[0];

    return {
      id: threadId,
      userId: lastMessage.sender_type === 'user' ? lastMessage.sender_id : '',
      shelterId: lastMessage.sender_type === 'shelter' ? lastMessage.sender_id : '',
      shelterName: '',
      lastMessage: lastMessage.content,
      lastMessageTime: new Date(lastMessage.created_at),
      unreadCount: 0,
    };
  },

  async getMessages(threadId: string): Promise<Message[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 150));
      return mockMessages
        .filter(m => m.threadId === threadId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((msg) => ({
      id: msg.id,
      threadId: msg.thread_id,
      senderId: msg.sender_id,
      senderName: msg.sender_type === 'user' ? 'User' : 'Shelter',
      senderType: msg.sender_type,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      read: true,
    }));
  },

  async sendMessage(threadId: string, senderId: string, content: string): Promise<Message> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        threadId,
        senderId,
        senderName: 'Demo User',
        senderType: 'user',
        content,
        timestamp: new Date(),
        read: true,
      };
      mockMessages.push(newMessage);
      return newMessage;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: senderId,
        sender_type: 'user',
        content,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      threadId: data.thread_id,
      senderId: data.sender_id,
      senderName: 'User',
      senderType: 'user',
      content: data.content,
      timestamp: new Date(data.created_at),
      read: true,
    };
  },

  async markAsRead(threadId: string): Promise<void> {
    return;
  },
};
