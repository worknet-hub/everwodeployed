
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
    if (channelRef.current && isSubscribedRef.current) {
      console.log('Cleaning up existing realtime channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    // Create a unique channel name to avoid conflicts
    const timestamp = Date.now();
    const channelName = filter ? `${table}-${filter}-${timestamp}` : `${table}-${timestamp}`;

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
            console.log(`${table} ${payload.eventType}:`, payload);
            onUpdate();
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${table}:`, status);
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
        console.log('Cleaning up realtime subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [table, event, filter, onUpdate]);
};
