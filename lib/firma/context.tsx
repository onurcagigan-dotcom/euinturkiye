"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getDataProvider } from "@/lib/data";
import type { Subscriber } from "@/lib/types";

interface FirmaCtx {
  current: Subscriber | null;
  loading: boolean;
  login: (subscriberId: string) => void;
  logout: () => void;
}

const Ctx = createContext<FirmaCtx | null>(null);
const COOKIE_NAME = "eu_firma_session";

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match?.[1] ?? null;
}

function writeCookie(id: string | null) {
  if (typeof document === "undefined") return;
  if (id) document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=604800`;
  else document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function FirmaProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<Subscriber | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = readCookie();
    if (!id) { setLoading(false); return; }
    const db = getDataProvider();
    db.getSubscribers().then((subs) => {
      setCurrent(subs.find((s) => s.id === id) ?? null);
      setLoading(false);
    });
  }, []);

  const login = useCallback((subscriberId: string) => {
    writeCookie(subscriberId);
    const db = getDataProvider();
    db.getSubscribers().then((subs) => {
      setCurrent(subs.find((s) => s.id === subscriberId) ?? null);
    });
  }, []);

  const logout = useCallback(() => {
    writeCookie(null);
    setCurrent(null);
  }, []);

  return <Ctx.Provider value={{ current, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useFirma(): FirmaCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFirma must be used inside FirmaProvider");
  return ctx;
}
