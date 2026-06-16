"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, type User,
} from "firebase/auth";
import { getFirebaseApp } from "./init";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(getFirebaseApp());
    const unsub = onAuthStateChanged(auth, (u: import("firebase/auth").User | null) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const auth = getAuth(getFirebaseApp());
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const auth = getAuth(getFirebaseApp());
    await signOut(auth);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
