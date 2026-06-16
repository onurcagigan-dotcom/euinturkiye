"use client";

// ============================================================
// AuthProvider — Firebase Authentication oturum yönetimi.
//
// Kullanıcının giriş durumunu uygulama genelinde tutar.
// Demo modunda (Firebase config yoksa) auth devre dışıdır;
// user her zaman null döner ama uygulama çökmez.
// ============================================================

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/init";

interface AuthState {
  user: User | null;
  loading: boolean;
  enabled: boolean; // Firebase auth aktif mi
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const enabled = isFirebaseConfigured();

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth(), (u: User | null) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [enabled]);

  const login = async (email: string, password: string) => {
    if (!enabled) throw new Error("Giriş sistemi henüz yapılandırılmadı (Firebase gerekli).");
    await signInWithEmailAndPassword(auth(), email, password);
  };

  const logout = async () => {
    if (enabled) await signOut(auth());
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, enabled, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
