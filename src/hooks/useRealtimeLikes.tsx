
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LikeState {
  [thoughtId: string]: {
    count: number;
    isLiked: boolean;
  };
}

export const useRealtimeLikes = (thoughtIds: string[]) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<LikeState>({});
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!thoughtIds.length) {
      // Clean up channel if no thoughts to track
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const fetchLikes = async () => {
      try {
        const { data: likeCounts } = await supabase
          .from('thoughts')
          .select('id, likes_count')
          .in('id', thoughtIds);

        const { data: userLikes } = await supabase
          .from('thought_likes')
          .select('thought_id')
          .in('thought_id', thoughtIds)
          .eq('user_id', user?.id || '');

        const likeState: LikeState = {};
        likeCounts?.forEach(thought => {
          likeState[thought.id] = {
            count: thought.likes_count || 0,
            isLiked: userLikes?.some(like => like.thought_id === thought.id) || false
          };
        });

        setLikes(likeState);
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    fetchLikes();

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel with unique name
    const channelName = `likes_${thoughtIds.join('_')}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thought_likes',
          filter: `thought_id=in.(${thoughtIds.join(',')})`
        },
        () => {
          fetchLikes();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'thoughts',
          filter: `id=in.(${thoughtIds.join(',')})`
        },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [thoughtIds.join(','), user?.id]);

  const toggleLike = async (thoughtId: string) => {
    if (!user) return;

    try {
      const isCurrentlyLiked = likes[thoughtId]?.isLiked || false;

      // Optimistically update the UI
      setLikes(prev => ({
        ...prev,
        [thoughtId]: {
          count: (prev[thoughtId]?.count || 0) + (isCurrentlyLiked ? -1 : 1),
          isLiked: !isCurrentlyLiked
        }
      }));

      if (isCurrentlyLiked) {
        await supabase
          .from('thought_likes')
          .delete()
          .eq('thought_id', thoughtId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('thought_likes')
          .insert({
            thought_id: thoughtId,
            user_id: user.id
          });
      }

      // Update the thought's likes_count
      const newCount = (likes[thoughtId]?.count || 0) + (isCurrentlyLiked ? -1 : 1);
      await supabase
        .from('thoughts')
        .update({ likes_count: newCount })
        .eq('id', thoughtId);

    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      const isCurrentlyLiked = likes[thoughtId]?.isLiked || false;
      setLikes(prev => ({
        ...prev,
        [thoughtId]: {
          count: (prev[thoughtId]?.count || 0) + (isCurrentlyLiked ? 1 : -1),
          isLiked: isCurrentlyLiked
        }
      }));
    }
  };

  return { likes, toggleLike };
};
