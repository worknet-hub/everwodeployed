
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  RealtimePostgresChangesFilter,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';

interface UseRealtimeOptions {
  table: string;
  event?: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`;
  filter?: string;
  onUpdate: () => void;
}

export const useRealtime = ({ table, event = '*', filter, onUpdate }: UseRealtimeOptions) => {
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    // Clean up any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    // Use a unique channel name based on table, event, filter, and a unique id
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const channelName = filter ? `${table}-${event}-${filter}-${uniqueId}` : `${table}-${event}-${uniqueId}`;

    const changesFilter: RealtimePostgresChangesFilter<`${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`> = {
      event,
      schema: 'public',
      table,
    };
    if (filter) {
      changesFilter.filter = filter;
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          changesFilter as RealtimePostgresChangesFilter<'*'>,
          (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
            onUpdate();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }

    return () => {
      if (channelRef.current && isSubscribedRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [table, event, filter, onUpdate]);
};
