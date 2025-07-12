import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ThoughtCard from '@/components/feed/ThoughtCard';

interface UserThoughtsListProps {
  userId: string;
}

export default function UserThoughtsList({ userId }: UserThoughtsListProps) {
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserThoughts() {
      const { data, error } = await supabase
        .from('thoughts')
        .select(`*, profiles:user_id (full_name, avatar_url, college_name, college_verified)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setThoughts(data);
      }
      setLoading(false);
    }
    fetchUserThoughts();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (thoughts.length === 0) return <div>No thoughts posted yet.</div>;

  return (
    <div className="space-y-4">
      {thoughts.map((thought) => (
        <ThoughtCard
          key={thought.id}
          id={thought.id}
          author={{
            name: thought.profiles?.full_name || 'Anonymous',
            avatar: thought.profiles?.avatar_url || '',
            college: thought.profiles?.college_name || '',
            verified: thought.profiles?.college_verified || false,
          }}
          content={thought.content}
          timestamp={thought.created_at}
          likes={thought.likes_count}
          comments={thought.comments_count}
          tags={thought.tags}
          image={thought.image_url}
        />
      ))}
    </div>
  );
} 