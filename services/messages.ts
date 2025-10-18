import { Message, Thread } from '@/types';
import { supabase } from './supabase';

export const messages = {
  async listThreads(userId: string): Promise<Thread[]> {
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
