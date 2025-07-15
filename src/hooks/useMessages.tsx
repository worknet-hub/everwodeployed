
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message } from '@/types/messages';

export const useMessages = (userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [oldestMessageId, setOldestMessageId] = useState<string | null>(null);

  const fetchMessages = useCallback(async (partnerId: string, loadOlder = false) => {
    if (!userId) return;
    
    console.log('Fetching messages between:', userId, 'and', partnerId, loadOlder ? '(older)' : '');
    
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: false })
        .limit(50);

      // If loading older messages, add filter for messages older than the oldest one
      if (loadOlder && oldestMessageId) {
        query = query.lt('id', oldestMessageId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch messages error:', error);
        if (!userId.includes('admin')) {
          toast.error('Failed to fetch messages');
        }
        return;
      }

      const messagesWithSender = data.map((msg: any) => ({
        ...msg,
        reactions: []
      })) as Message[];

      const messagesWithReplies = await Promise.all(
        messagesWithSender.map(async (msg) => {
          if (msg.reply_to_id) {
            const { data: replyData } = await supabase
              .from('messages')
              .select(`
                *,
                sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
              `)
              .eq('id', msg.reply_to_id)
              .single();
            
            return {
              ...msg,
              reply_to_message: replyData ? {
                ...replyData,
                reactions: []
              } as Message : undefined
            };
          }
          return msg;
        })
      );

      // Sort messages by created_at (oldest first for display)
      const sortedMessages = messagesWithReplies.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      if (loadOlder) {
        // Prepend older messages to existing ones
        setMessages(prev => [...sortedMessages, ...prev]);
        setHasMoreMessages(sortedMessages.length === 50);
      } else {
        // Replace all messages (initial load)
        setMessages(sortedMessages);
        setHasMoreMessages(sortedMessages.length === 50);
      }

      // Update oldest message ID for pagination
      if (sortedMessages.length > 0) {
        const oldestId = sortedMessages[0].id;
        if (!oldestMessageId || oldestId < oldestMessageId) {
          setOldestMessageId(oldestId);
        }
      }

      console.log('Fetched messages:', sortedMessages.length, 'messages');
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (!userId.includes('admin')) {
        toast.error('Failed to fetch messages');
      }
    }
  }, [userId, oldestMessageId]);

  const loadOlderMessages = useCallback(async (partnerId: string) => {
    if (!hasMoreMessages || isLoadingOlder) return;
    
    setIsLoadingOlder(true);
    await fetchMessages(partnerId, true);
    setIsLoadingOlder(false);
  }, [hasMoreMessages, isLoadingOlder, fetchMessages]);

  const sendMessage = async (content: string, receiverId: string, replyToId?: string) => {
    if (!content.trim() || !userId) return;

    console.log('Sending message:', { content, receiverId, replyToId, senderId: userId });

    const messageData: any = {
      content,
      sender_id: userId,
      receiver_id: receiverId,
    };

    if (replyToId) {
      messageData.reply_to_id = replyToId;
    }

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content,
      sender_id: userId,
      receiver_id: receiverId,
      created_at: new Date().toISOString(),
      is_read: false,
      reactions: [],
      sender: { full_name: 'You', avatar_url: '' },
      ...(replyToId ? { reply_to_id: replyToId } : {}),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase.from('messages').insert(messageData).select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
      `).single();

      if (error) {
        console.error('Error sending message:', error);
        setMessages(prev => prev.filter(msg => msg.id !== tempId)); // Remove optimistic message
        if (error.message.includes('row-level security')) {
          toast.error('You can only message people you are connected with. Please send a connection request first.');
        } else {
          toast.error('Failed to send message');
        }
        return false;
      }
      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...data, reactions: [] } : msg));
      console.log('Message sent successfully, real-time will update UI');
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(msg => msg.id !== tempId)); // Remove optimistic message
      toast.error('Failed to send message');
      return false;
    }
  };

  return {
    messages,
    setMessages,
    fetchMessages,
    sendMessage,
    loadOlderMessages,
    hasMoreMessages,
    isLoadingOlder
  };
};
