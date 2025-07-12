
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { isAdminCredentials, isAdminUser } from '@/utils/adminUtils';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (mounted) {
          const currentUser = session?.user ?? null;
          const adminStatus = currentUser ? isAdminUser(currentUser.email || '') : false;
          
          setUser(currentUser);
          setIsAdmin(adminStatus);
          setLoading(false);
          
          console.log('Auth initialized:', { user: !!currentUser, isAdmin: adminStatus });
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, !!session?.user);
      
      if (mounted) {
        const currentUser = session?.user ?? null;
        const adminStatus = currentUser ? isAdminUser(currentUser.email || '') : false;
        
        setUser(currentUser);
        setIsAdmin(adminStatus);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Check for admin credentials first
    if (isAdminCredentials(email, password)) {
      console.log('Admin credentials detected, creating proper admin session');
      
      // Create a proper user session for admin
      const adminUser = {
        id: 'admin-user-uuid-12345',
        email,
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        app_metadata: { role: 'admin' },
        user_metadata: { full_name: 'Admin User' },
        aud: 'authenticated',
        role: 'authenticated'
      } as User;
      
      setUser(adminUser);
      setIsAdmin(true);
      setLoading(false);
      
      return { error: null };
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsAdmin(false);
      setUser(null);
    }
    return { error };
  };

  return {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut
  };
};
