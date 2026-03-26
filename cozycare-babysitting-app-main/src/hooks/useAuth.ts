import { useEffect, useState } from 'react';
import { blink } from '../blink/client';
import type { BlinkUser } from '@blinkdotnew/sdk';
import { getUserIntent, setUserIntent, type UserIntent } from '../features/app/session';

export function useAuth() {
  const [user, setUser] = useState<BlinkUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [intent, setIntent] = useState<UserIntent | null>(getUserIntent());

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  const login = (redirectTo?: string, nextIntent?: UserIntent) => {
    if (nextIntent) {
      setUserIntent(nextIntent);
      setIntent(nextIntent);
    }
    blink.auth.login(redirectTo || window.location.href);
  };

  const logout = () => blink.auth.signOut();
  const setRoleIntent = (nextIntent: UserIntent) => {
    setUserIntent(nextIntent);
    setIntent(nextIntent);
  }

  return { user, loading, isAuthenticated: !!user, intent, login, logout, setRoleIntent };
}