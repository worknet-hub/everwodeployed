import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { EnhancedThoughtCard } from './EnhancedThoughtCard';
import { useRealtimeLikes } from '@/hooks/useRealtimeLikes';
import { useRealtimeThoughts } from "@/contexts/RealtimeThoughtsContext";

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
  filter?: 'public' | 'friends';
}

export const EnhancedThoughtsFeed = ({ communityFilter, filter = 'public' }: EnhancedThoughtsFeedProps) => {
  const { thoughts } = useRealtimeThoughts();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connectionIds, setConnectionIds] = useState<string[]>([]);
  const userCollege = user?.user_metadata?.college_name || user?.user_metadata?.college || user?.college_name || user?.college || '';

  useEffect(() => {
    const fetchConnections = async () => {
      if (filter === 'friends' && user) {
        const { data, error } = await supabase
          .from('connections')
          .select('requester_id, addressee_id')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq('status', 'accepted');
        if (data) {
          const ids = data.map((c: any) => c.requester_id === user.id ? c.addressee_id : c.requester_id);
          setConnectionIds(ids);
        } else {
          setConnectionIds([]);
        }
      } else {
        setConnectionIds([]);
      }
    };
    fetchConnections();
  }, [filter, user]);

  // Filter thoughts by community if needed
  let filteredThoughts = communityFilter
    ? thoughts.filter((t: any) => t.community_name === communityFilter)
    : thoughts;

  // Further filter by friends if needed
  if (filter === 'friends' && user) {
    filteredThoughts = filteredThoughts.filter((t: any) =>
      connectionIds.includes(t.user_id) || t.user_id === user.id
    );
  }
  // Filter by university if needed
  if (filter === 'uni' && userCollege) {
    filteredThoughts = filteredThoughts.filter((t: any) => t.user.college && t.user.college.toLowerCase() === userCollege.toLowerCase());
  }

  useEffect(() => {
    setLoading(false);
  }, [thoughts, connectionIds]);

  if (loading) {
    return <div className="p-6 text-center text-white">Loading thoughts...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0 pb-28">
      {filteredThoughts.map((thought: any, idx: number) => (
        <div key={thought.id}>
          <EnhancedThoughtCard
            id={thought.id}
            content={thought.content}
            author={thought.user}
            timestamp={thought.created_at}
            likes={thought.likes_count}
            comments={thought.comments_count}
            mentions={thought.mentions}
            communityName={thought.community_name}
            replies={thought.replies}
            onReplyPosted={() => {}}
            userId={thought.user_id}
            isLiked={false}
            onToggleLike={() => {}}
            visibility={thought.visibility}
          />
          {/* Faint white line between thoughts, except after last */}
          {idx < filteredThoughts.length - 1 && (
            <div className="h-px bg-white w-full my-3" />
          )}
        </div>
      ))}

      {filteredThoughts.length === 0 && (
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
