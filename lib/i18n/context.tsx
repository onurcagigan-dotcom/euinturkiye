"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, type Locale, type TranslationKey } from "./translations";

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const Ctx = createContext<LocaleCtx | null>(null);

const COOKIE_NAME = "eu_locale";

function readCookie(): Locale {
  if (typeof document === "undefined") return "tr";
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=(tr|en)`));
  return (match?.[1] as Locale) ?? "tr";
}

function writeCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=31536000`;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(readCookie());
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    writeCookie(l);
  }, []);

  const t = useCallback((key: TranslationKey) => {
    return translations[locale][key] ?? translations.tr[key] ?? key;
  }, [locale]);

  // İlk render'da (mounted=false) hidrasyon uyuşmazlığını önlemek için
  // varsayılan tr ile render ediyoruz, cookie okunduktan sonra güncelleniyor.
  return (
    <Ctx.Provider value={{ locale, setLocale, t }}>
      <span suppressHydrationWarning>{children}</span>
    </Ctx.Provider>
  );
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
