
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

    // Use a stable channel name based on table, event, and filter
    const channelName = filter ? `${table}-${event}-${filter}` : `${table}-${event}`;

    const changesFilter: RealtimePostgresChangesFilter<`${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`> = {
      event,
      schema: 'public',
      table,
    };
    if (filter) {
      changesFilter.filter = filter;
    }

    // Prevent multiple subscriptions to the same channel instance
    if (channelRef.current && isSubscribedRef.current) {
      console.warn('Tried to subscribe multiple times to the same channel instance. Skipping.');
      return;
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
