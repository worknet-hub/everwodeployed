
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Conversation } from '@/types/messages';

export const useConversations = (userId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    
    const { data, error } = await supabase.rpc('get_conversations', { p_user_id: userId });

    if (error) {
      toast.error('Failed to fetch conversations');
      console.error(error);
    } else if (data) {
      const formattedData = data.map(c => ({
        partner_id: c.partner_id || '',
        full_name: c.full_name || 'Unknown User',
        avatar_url: c.avatar_url || '',
        last_message_content: c.last_message_content || '',
        last_message_created_at: c.last_message_created_at || new Date().toISOString(),
      }));
      setConversations(formattedData);
    }
  }, [userId]);

  return {
    conversations,
    fetchConversations,
    setConversations
  };
};
