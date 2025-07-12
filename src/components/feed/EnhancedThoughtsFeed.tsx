import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { EnhancedThoughtCard } from './EnhancedThoughtCard';
import { useRealtimeLikes } from '@/hooks/useRealtimeLikes';

interface Thought {
  id: string;
  content: string;
  mentions: any[];
  community_id: string | null;
  community_name?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  user: {
    name: string;
    avatar: string;
    college: string;
    verified: boolean;
  };
  replies?: Thought[];
}

interface EnhancedThoughtsFeedProps {
  communityFilter?: string | null;
}

export const EnhancedThoughtsFeed = ({ communityFilter }: EnhancedThoughtsFeedProps) => {
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThoughts = useCallback(async () => {
    let query = supabase
      .from('thoughts')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          college_name,
          college_verified,
          username
        ),
        communities:community_id (
          name
        )
      `)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(20);

    // Apply community filter if provided
    if (communityFilter) {
      // First get the community ID for the filter
      const { data: communityData } = await supabase
        .from('communities')
        .select('id')
        .eq('name', communityFilter)
        .single();

      if (communityData) {
        query = query.eq('community_id', communityData.id);
      } else {
        // If community doesn't exist, return empty results
        setThoughts([]);
        setLoading(false);
        return;
      }
    }

    const { data: thoughtsData } = await query;

    if (thoughtsData) {
      // Fetch replies for each thought
      const thoughtsWithReplies = await Promise.all(
        thoughtsData.map(async (thought) => {
          const { data: repliesData } = await supabase
            .from('thoughts')
            .select(`
              *,
              profiles:user_id (
                full_name,
                avatar_url,
                college_name,
                college_verified,
                username
              )
            `)
            .eq('parent_id', thought.id)
            .order('created_at', { ascending: true });

          const formattedReplies = repliesData?.map(reply => ({
            id: reply.id,
            content: reply.content,
            mentions: Array.isArray(reply.mentions) ? reply.mentions : [],
            community_id: reply.community_id,
            likes_count: reply.likes_count || 0,
            comments_count: reply.comments_count || 0,
            created_at: new Date(reply.created_at).toLocaleString(),
            user_id: reply.user_id,
            user: {
              name: reply.profiles?.full_name || 'Anonymous',
              avatar: reply.profiles?.avatar_url || '',
              college: reply.profiles?.college_name || '',
              verified: reply.profiles?.college_verified || false
            }
          })) || [];

          return {
            id: thought.id,
            content: thought.content,
            mentions: Array.isArray(thought.mentions) ? thought.mentions : [],
            community_id: thought.community_id,
            community_name: thought.communities?.name,
            likes_count: thought.likes_count || 0,
            comments_count: thought.comments_count || 0,
            created_at: new Date(thought.created_at).toLocaleString(),
            user_id: thought.user_id,
            user: {
              name: thought.profiles?.full_name || 'Anonymous',
              avatar: thought.profiles?.avatar_url || '',
              college: thought.profiles?.college_name || '',
              verified: thought.profiles?.college_verified || false,
              username: thought.profiles?.username || '' // Pass username
            },
            replies: formattedReplies
          };
        })
      );

      setThoughts(thoughtsWithReplies);
    }
    setLoading(false);
  }, [communityFilter]);

  // Get thought IDs for real-time likes
  const thoughtIds = thoughts.map(t => t.id);
  const { likes, toggleLike } = useRealtimeLikes(thoughtIds);

  // Single real-time subscription for all thoughts-related updates
  useRealtime({
    table: 'thoughts',
    onUpdate: fetchThoughts
  });

  useEffect(() => {
    fetchThoughts();
  }, [fetchThoughts]);

  if (loading) {
    return <div className="p-6 text-center text-white">Loading thoughts...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {thoughts.map((thought, idx) => (
        <div key={thought.id}>
          <EnhancedThoughtCard
            id={thought.id}
            content={thought.content}
            author={thought.user}
            timestamp={thought.created_at}
            likes={likes[thought.id]?.count || thought.likes_count}
            comments={thought.comments_count}
            mentions={thought.mentions}
            communityName={thought.community_name}
            replies={thought.replies}
            onReplyPosted={fetchThoughts}
            userId={thought.user_id}
            isLiked={likes[thought.id]?.isLiked || false}
            onToggleLike={() => toggleLike(thought.id)}
          />
          {/* Faint white line between thoughts, except after last */}
          {idx < thoughts.length - 1 && (
            <div className="h-px bg-white w-full my-3" />
          )}
        </div>
      ))}

      {thoughts.length === 0 && (
        <div className="text-center py-8 md:py-12 text-gray-300 px-4">
          {communityFilter 
            ? `No thoughts in ${communityFilter} community yet.`
            : 'No thoughts yet. Be the first to share something!'
          }
        </div>
      )}
    </div>
  );
};
