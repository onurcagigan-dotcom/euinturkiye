"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isDemoVerified, setDemoVerified } from "./demo-access";

interface DemoAccessCtx {
  verified: boolean;
  loading: boolean;
  markVerified: () => void;
  reset: () => void;
}

const Ctx = createContext<DemoAccessCtx | null>(null);

export function DemoAccessProvider({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVerified(isDemoVerified());
    setLoading(false);
  }, []);

  const markVerified = useCallback(() => {
    setDemoVerified(true);
    setVerified(true);
  }, []);

  const reset = useCallback(() => {
    setDemoVerified(false);
    setVerified(false);
  }, []);

  return (
    <Ctx.Provider value={{ verified, loading, markVerified, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDemoAccess(): DemoAccessCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDemoAccess must be used inside DemoAccessProvider");
  return ctx;
}
