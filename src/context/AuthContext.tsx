'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { User } from '@/types';
import { createClient } from '@/lib/supabase/client';

// Lazy singleton — avoids module-scope creation during SSR where browser storage is unavailable
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) _supabase = createClient();
  return _supabase;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string, fallbackEmail?: string, fallbackName?: string): Promise<User> {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
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
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Flag to skip onAuthStateChange when login/signup already handled user state
  const handledByAction = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = getSupabase();
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

    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(
      async (event, session) => {
        // Skip if login/signup already set the user directly
        if (handledByAction.current) {
          handledByAction.current = false;
          return;
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          return;
        }

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
  }, []);

  const login = async (email: string, password: string) => {
    const doLogin = async () => {
      const { data, error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session?.user) {
        handledByAction.current = true;
        const profile = await fetchProfile(
          data.session.user.id,
          data.session.user.email,
          data.session.user.user_metadata?.name
        );
        setUser(profile);
      }
    };

    await withTimeout(doLogin(), 15000, 'Sign-in timed out. Please check your connection and try again.');
  };

  const signup = async (name: string, email: string, password: string) => {
    const doSignup = async () => {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session?.user) {
        handledByAction.current = true;
        const profile = await fetchProfile(
          data.session.user.id,
          data.session.user.email,
          name
        );
        setUser(profile);
      }
    };

    await withTimeout(doSignup(), 15000, 'Sign-up timed out. Please check your connection and try again.');
  };

  const logout = async () => {
    const { error } = await getSupabase().auth.signOut();
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
