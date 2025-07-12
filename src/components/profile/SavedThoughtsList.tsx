import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ThoughtCard from '@/components/feed/ThoughtCard';

interface SavedThoughtsListProps {
  userId: string;
}

export default function SavedThoughtsList({ userId }: SavedThoughtsListProps) {
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedThoughts() {
      const { data, error } = await supabase
        .from('saved_thoughts')
        .select('thought_id, thoughts(*)')
        .eq('user_id', userId);
      if (!error && data) {
        setThoughts(data.map((row) => row.thoughts));
      }
      setLoading(false);
    }
    fetchSavedThoughts();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (thoughts.length === 0) return <div>No saved thoughts yet.</div>;

  return (
    <div className="space-y-4">
      {thoughts.map((thought) => (
        <ThoughtCard key={thought.id} {...thought} />
      ))}
    </div>
  );
}
