
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message } from '@/types/messages';

export const useMessages = (userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = useCallback(async (partnerId: string) => {
    if (!userId) return;
    
    console.log('Fetching messages between:', userId, 'and', partnerId);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order('created_at');

      if (error) {
        console.error('Fetch messages error:', error);
        // Don't show toast for admin users to avoid confusion
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

      console.log('Fetched messages:', messagesWithReplies);
      setMessages(messagesWithReplies);
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (!userId.includes('admin')) {
        toast.error('Failed to fetch messages');
      }
    }
  }, [userId]);

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

    try {
      const { data, error } = await supabase.from('messages').insert(messageData).select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
      `).single();

      if (error) {
        console.error('Error sending message:', error);
        if (error.message.includes('row-level security')) {
          toast.error('You can only message people you are connected with. Please send a connection request first.');
        } else {
          toast.error('Failed to send message');
        }
        return false;
      }
      
      console.log('Message sent successfully, real-time will update UI');
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      return false;
    }
  };

  return {
    messages,
    setMessages,
    fetchMessages,
    sendMessage
  };
};
