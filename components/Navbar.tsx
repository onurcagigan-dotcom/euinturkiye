"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/projeler", label: "Projeler" },
  { href: "/#harita", label: "Harita" },
  { href: "/#gundem", label: "Gündem" },
  { href: "/#takvim", label: "Takvim" },
  { href: "/araclar", label: "Araçlar" },
  { href: "/#diger", label: "Diğer Donörler" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-eu-deep sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="font-medium text-[18px] text-white shrink-0" onClick={() => setOpen(false)}>
          eu<span className="font-normal">in</span>
          <span className="text-tr">turkiye</span>
          <span className="font-normal">.com</span>
        </Link>

        {/* Masaüstü menü */}
        <div className="hidden md:flex gap-7 text-sm text-white/90">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">{l.label}</Link>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="hidden sm:inline-flex px-3 py-2 rounded-lg border border-white/40 text-white text-xs">
            TR / EN
          </button>
          <Link href="/giris" className="hidden sm:inline text-white text-sm hover:text-white/80">Giriş</Link>
          <Link
            href="/kayit"
            className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold hover:bg-eu/90"
          >
            Kayıt Ol
          </Link>

          {/* Mobil hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Menü"
          >
            <span className={`block w-6 h-0.5 bg-white transition ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition ${open ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobil açılır menü */}
      {open && (
        <div className="md:hidden bg-eu-deep border-t border-white/10 px-6 py-4">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="py-2.5 text-white/90 hover:text-white border-b border-white/5 last:border-0">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 mt-3">
              <Link href="/giris" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 rounded-lg border border-white/40 text-white text-sm">Giriş</Link>
              <Link href="/kayit" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 rounded-lg bg-eu text-white text-sm font-semibold">Kayıt Ol</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
