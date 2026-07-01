"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import { useDemoAccess } from "@/lib/demo-access-context";

export function PageShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const { current: firma } = useFirma();
  const { verified: demoVerified, reset: resetDemo } = useDemoAccess();

  const NAV_LINKS = [
    { href: "/projeler", label: t("nav_projects") },
    { href: "/ilanlar", label: t("nav_listings") },
    { href: "/etkinlikler", label: t("nav_events") },
    { href: "/gundem", label: t("nav_news") },
    { href: "/araclar", label: t("nav_tools") },
  ];

  const submitSearch = () => {
    const q = searchValue.trim();
    if (!q) return;
    router.push(`/projeler?ara=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const LangToggle = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex items-center rounded-full border border-line overflow-hidden ${mobile ? "" : ""}`}>
      <button
        onClick={() => setLocale("tr")}
        className={`px-2.5 py-1 text-xs font-bold transition-colors ${locale === "tr" ? "bg-eu text-white" : "text-mist hover:text-eu"}`}
      >
        TR
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1 text-xs font-bold transition-colors ${locale === "en" ? "bg-eu text-white" : "text-mist hover:text-eu"}`}
      >
        EN
      </button>
    </div>
  );

  const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Üst bar: Demo erişimi */}
      <div className={`${demoVerified ? "bg-green-700" : "bg-yellow-500"} text-white`}>
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between gap-2 text-xs font-semibold">
          {demoVerified ? (
            <div className="flex items-center gap-3">
              <span>✓ {t("demo_bar_active")}</span>
              <Link href="/giris" className="underline opacity-75 hover:opacity-100">
                {locale === "tr" ? "Rol değiştir" : "Switch role"}
              </Link>
            </div>
          ) : (
            <Link href="/demo" className="hover:underline flex items-center gap-1.5">
              <span>🔒</span> {t("demo_bar_locked")}
            </Link>
          )}
          {demoVerified && (
            <button onClick={() => { resetDemo(); window.location.reload(); }}
              className="opacity-60 hover:opacity-100 hover:underline text-xs">
              {locale === "tr" ? "Demo'yu sıfırla" : "Reset demo"}
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-line sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <span className="text-eu font-bold text-lg tracking-tight">EU in Türkiye</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  path.startsWith(l.href) ? "text-eu bg-eu-pale" : "text-slate hover:text-eu hover:bg-surface"
                }`}>
                {l.href === "/araclar" && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                )}
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA + arama + dil */}
          <div className="hidden md:flex items-center gap-3">
            {searchOpen ? (
              <div className="flex items-center gap-1.5 bg-surface rounded-full pl-3 pr-1 py-1 border border-line animate-in">
                <span className="text-mist"><SearchIcon /></span>
                <input
                  autoFocus
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); if (e.key === "Escape") setSearchOpen(false); }}
                  placeholder={t("projects_search_placeholder")}
                  className="bg-transparent text-sm outline-none w-48 placeholder:text-mist"
                />
                <button onClick={() => { setSearchOpen(false); setSearchValue(""); }} className="text-mist hover:text-ink p-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg text-slate hover:text-eu hover:bg-surface" aria-label="Ara">
                <SearchIcon />
              </button>
            )}
            <LangToggle />
            {firma ? (
              <Link href="/firma" className="flex items-center gap-2 text-sm px-3 py-1.5 bg-eu-pale text-eu rounded-lg font-semibold hover:bg-eu/10 transition-colors">
                <span className="w-6 h-6 rounded-full bg-eu text-white flex items-center justify-center text-xs font-bold">
                  {(firma.organization ?? firma.name).charAt(0)}
                </span>
                {firma.organization ?? firma.name}
              </Link>
            ) : (
              <>
                <div className="relative" onMouseEnter={() => setLoginMenuOpen(true)} onMouseLeave={() => setLoginMenuOpen(false)}>
                  <button onClick={() => setLoginMenuOpen((o) => !o)} className="text-sm text-slate hover:text-eu font-medium flex items-center gap-1">
                    {t("nav_login")}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {loginMenuOpen && (
                    <div className="absolute right-0 top-full pt-1 w-52 z-50">
                      <div className="bg-white border border-line rounded-xl shadow-lg overflow-hidden">
                        <Link href="/giris" onClick={() => setLoginMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-ink hover:bg-surface transition-colors">
                          {t("nav_login")}
                        </Link>
                        <Link href="/demo" onClick={() => setLoginMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-eu font-medium hover:bg-eu-pale transition-colors border-t border-line">
                          🔓 {t("nav_demo_access")}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <Link href="/kayit" className="text-sm px-4 py-2 bg-eu text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                  {t("nav_signup")}
                </Link>
              </>
            )}
          </div>

          {/* Mobil: dil + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <LangToggle mobile />
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-2 rounded-lg text-slate hover:bg-surface"
              aria-label="Menü"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobil menü */}
        {menuOpen && (
          <div className="md:hidden border-t border-line bg-white px-6 py-4 space-y-1">
            {/* Mobil arama */}
            <div className="flex items-center gap-1.5 bg-surface rounded-full pl-3 pr-1 py-1 border border-line mb-3">
              <span className="text-mist"><SearchIcon /></span>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
                placeholder={t("projects_search_placeholder")}
                className="bg-transparent text-sm outline-none flex-1 placeholder:text-mist"
              />
              <button onClick={submitSearch} className="text-eu p-1.5" aria-label="Ara">
                <SearchIcon />
              </button>
            </div>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  path.startsWith(l.href) ? "text-eu bg-eu-pale" : "text-slate hover:bg-surface"
                }`}>
                {l.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-line flex flex-col gap-2">
              {firma ? (
                <Link href="/firma" onClick={() => setMenuOpen(false)}
                  className="text-center px-3 py-2 bg-eu-pale text-eu rounded-lg text-sm font-semibold">
                  {firma.organization ?? firma.name}
                </Link>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Link href="/giris" onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center px-3 py-2 border border-line text-slate rounded-lg text-sm font-medium">
                      {t("nav_login")}
                    </Link>
                    <Link href="/kayit" onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center px-3 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
                      {t("nav_signup")}
                    </Link>
                  </div>
                  <Link href="/demo" onClick={() => setMenuOpen(false)}
                    className="text-center px-3 py-2 text-eu text-sm font-medium">
                    🔓 {t("nav_demo_access")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-ink text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-lg mb-2">EU in Türkiye</div>
            <p className="text-mist text-sm leading-relaxed">
              {t("footer_tagline")}
            </p>
            <p className="text-xs text-gray-600 mt-4">Design for Good LLC © 2026</p>
          </div>
          <div>
            <div className="font-semibold mb-3 text-sm uppercase tracking-wide text-mist">{t("footer_platform")}</div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/projeler" className="hover:text-white transition-colors">{t("nav_projects")}</Link></li>
              <li><Link href="/ilanlar" className="hover:text-white transition-colors">{t("nav_listings")}</Link></li>
              <li><Link href="/etkinlikler" className="hover:text-white transition-colors">{t("nav_events")}</Link></li>
              <li><Link href="/gundem" className="hover:text-white transition-colors">{t("nav_news")}</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3 text-sm uppercase tracking-wide text-mist">{t("footer_tools")}</div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/araclar/etkinlik" className="hover:text-white transition-colors">{locale === "tr" ? "Etkinlik Yönetimi" : "Event Management"}</Link></li>
              <li><Link href="/araclar/dokuman" className="hover:text-white transition-colors">{locale === "tr" ? "E-Doküman" : "E-Documents"}</Link></li>
              <li><Link href="/araclar/bulten" className="hover:text-white transition-colors">{locale === "tr" ? "Bülten" : "Newsletter"}</Link></li>
              <li><Link href="/araclar/harita" className="hover:text-white transition-colors">{locale === "tr" ? "Proje Haritası" : "Project Map"}</Link></li>
              <li><Link href="/araclar/infografik" className="hover:text-white transition-colors">{locale === "tr" ? "İnfografikler" : "Infographics"}</Link></li>
              <li><Link href="/uzmanlar" className="hover:text-white transition-colors">{locale === "tr" ? "Uzman CV Havuzu" : "Expert CV Pool"}</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3 text-sm uppercase tracking-wide text-mist">{t("footer_account")}</div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/kayit" className="hover:text-white transition-colors">{t("nav_signup")}</Link></li>
              <li><Link href="/giris" className="hover:text-white transition-colors">{t("nav_login")}</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">{t("nav_admin")}</Link></li>
              <li><Link href="/araclar" className="hover:text-white transition-colors">{t("footer_all_tools")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 py-5">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs text-gray-500 leading-relaxed max-w-4xl">
              {t("footer_disclaimer_short")}{" "}
              <Link href="/sorumluluk-reddi" className="text-gray-400 hover:text-white underline">
                {t("footer_disclaimer_link")}
              </Link>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 py-4">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <span>{t("footer_bottom")}</span>
            <span>euinturkiye.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
