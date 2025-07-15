import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import { supabase } from "@/integrations/supabase/client";

const RealtimeThoughtsContext = createContext<any>(null);

export const RealtimeThoughtsProvider = ({ children }: { children: ReactNode }) => {
  const [thoughts, setThoughts] = useState([]);

  const fetchThoughts = async () => {
    // Join profiles to get user info for each thought
    const { data } = await supabase
      .from("thoughts")
      .select(`*, profiles:user_id (full_name, avatar_url, college_name, college_verified, username)`)
      .order('created_at', { ascending: false });
    if (data) {
      // Shape each thought to always have a user object with username
      const shaped = data.map((thought: any) => ({
        ...thought,
        user: {
          name: thought.profiles?.full_name || 'Anonymous',
          avatar: thought.profiles?.avatar_url || '',
          college: thought.profiles?.college_name || '',
          verified: thought.profiles?.college_verified || false,
          username: thought.profiles?.username || '',
        },
      }));

      // Organize into threaded structure
      const topLevel = shaped.filter((t: any) => !t.parent_id);
      const replies = shaped.filter((t: any) => t.parent_id);
      // Map of id -> replies
      const repliesMap: Record<string, any[]> = {};
      replies.forEach((reply: any) => {
        if (!repliesMap[reply.parent_id]) repliesMap[reply.parent_id] = [];
        repliesMap[reply.parent_id].push(reply);
      });
      // Attach replies to top-level thoughts
      const threaded = topLevel.map((thought: any) => ({
        ...thought,
        replies: repliesMap[thought.id] || [],
      }));
      setThoughts(threaded);
    } else {
      setThoughts([]);
    }
  };

  // Restore real-time updates for comments_count by re-enabling useRealtime
  useEffect(() => {
    fetchThoughts();
  }, []);

  useRealtime({
    table: "thoughts",
    onUpdate: fetchThoughts,
  });

  return (
    <RealtimeThoughtsContext.Provider value={{ thoughts }}>
      {children}
    </RealtimeThoughtsContext.Provider>
  );
};

export const useRealtimeThoughts = () => useContext(RealtimeThoughtsContext); 