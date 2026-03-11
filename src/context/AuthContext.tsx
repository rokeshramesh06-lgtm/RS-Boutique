'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { User } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchProfile = useCallback(async (userId: string, fallbackEmail?: string, fallbackName?: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, created_at')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Fallback: return basic user from session data
        return {
          id: userId,
          name: fallbackName || '',
          email: fallbackEmail || '',
          role: 'user',
          created_at: new Date().toISOString(),
        };
      }

      return data as User;
    } catch {
      return {
        id: userId,
        name: fallbackName || '',
        email: fallbackEmail || '',
        role: 'user',
        created_at: new Date().toISOString(),
      };
    }
  }, [supabase]);

  useEffect(() => {
    // Initial auth check
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name
          );
          setUser(profile);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name
          );
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Immediately set user from session so we don't wait for onAuthStateChange
    if (data.session?.user) {
      const profile = await fetchProfile(
        data.session.user.id,
        data.session.user.email,
        data.session.user.user_metadata?.name
      );
      setUser(profile);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Immediately set user if auto-confirmed
    if (data.session?.user) {
      const profile = await fetchProfile(
        data.session.user.id,
        data.session.user.email,
        name
      );
      setUser(profile);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
