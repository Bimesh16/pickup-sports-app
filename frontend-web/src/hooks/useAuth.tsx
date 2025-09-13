import React from 'react';
import { login as apiLogin, me } from '@api/auth';

type AuthContext = {
  token: string | null;
  setToken: (t: string | null) => void;
  tryLoad: () => void;
  doLogin: (u: string, p: string) => Promise<void>;
  logout: () => void;
};

const Ctx = React.createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = React.useState<string | null>(null);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem('ps_token', t); else localStorage.removeItem('ps_token');
  };

  const tryLoad = React.useCallback(() => {
    const t = localStorage.getItem('ps_token');
    if (t) setTokenState(t);
  }, []);

  const doLogin = async (username: string, password: string) => {
    const res = await apiLogin({ username, password });
    if ((res as any).mfaRequired) throw new Error('MFA required (not implemented in web sample)');
    const tokens = res as any;
    setToken(tokens.accessToken);
    await me().catch(() => {});
  };

  const logout = () => setToken(null);

  return <Ctx.Provider value={{ token, setToken, tryLoad, doLogin, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}