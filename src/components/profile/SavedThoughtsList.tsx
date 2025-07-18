import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import EnhancedThoughtCard from '@/components/feed/EnhancedThoughtCard';
import { useRealtime } from '@/hooks/useRealtime';

interface SavedThoughtsListProps {
  userId: string;
}

export default function SavedThoughtsList({ userId }: SavedThoughtsListProps) {
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize fetchSavedThoughts to avoid recreating the function on every render
  const fetchSavedThoughts = useCallback(async () => {
    if (!userId) return; // Prevent undefined userId
    const { data, error } = await supabase
      .from('saved_thoughts')
      .select(`
        thought_id,
        thoughts:thought_id (
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            college_name,
            college_verified,
            username
          )
        )
      `)
      .eq('user_id', userId);
    if (!error && data) {
      setThoughts(
        data
          .map((row) => {
            const thought = row.thoughts;
            if (!thought) return null;
            return {
              id: thought.id,
              author: {
                name: thought.profiles?.full_name || 'Anonymous',
                avatar: thought.profiles?.avatar_url || '',
                college: thought.profiles?.college_name || '',
                verified: thought.profiles?.college_verified || false,
                username: thought.profiles?.username || '',
                id: thought.user_id // Add id for navigation fallback
              },
              content: thought.content,
              timestamp: thought.created_at,
              likes: thought.likes_count || 0,
              comments: thought.comments_count || 0,
              tags: thought.tags || [],
              image: thought.image_url || undefined,
            };
          })
          .filter(Boolean)
      );
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchSavedThoughts();
  }, [fetchSavedThoughts]);

  // Real-time updates for saved thoughts
  // Removed useRealtime subscription for saved_thoughts

  console.log('SavedThoughtsList thoughts:', thoughts);
  if (loading) return <div>Loading...</div>;
  if (!Array.isArray(thoughts)) return <div className="text-red-500">Error: thoughts is not an array.</div>;
  if (thoughts.length === 0) return <div>No saved thoughts yet.</div>;

  return (
    <div className="space-y-4">
      {thoughts.map((thought) => (
        <EnhancedThoughtCard
          key={thought.id}
          id={thought.id}
          content={thought.content}
          author={thought.author}
          timestamp={thought.timestamp}
          likes={thought.likes}
          comments={thought.comments}
          tags={thought.tags}
          image={thought.image}
          onReplyPosted={fetchSavedThoughts}
        />
      ))}
    </div>
  );
}
