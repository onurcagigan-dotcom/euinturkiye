"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { HomeStats } from "@/lib/types";

export function HeroCarousel({ stats }: { stats: HomeStats }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % 2), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-[540px] overflow-hidden">
      {/* Banner 1 */}
      <div
        className={`absolute inset-0 bg-cover bg-center flex items-center transition-opacity duration-700 ${
          slide === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
        style={{ backgroundImage: "url('/images/homepage/banner/banner-1.png')" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_90%_at_50%_50%,rgba(0,15,45,0.72),rgba(0,20,55,0.4))]" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center text-white">
          <p className="font-semibold tracking-widest text-xs uppercase text-[#FFCC00]">
            AB ve Türkiye Mali İşbirliği Projeleri Portalı
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-3">
            Türkiye&apos;deki <span className="text-[#FFCC00]">AB projeleri</span>,
            <br /> her gün güncellenen akışta.
          </h1>
          <p className="mt-4 text-white/90 max-w-xl mx-auto">
            Tüm projelerin duyuruları, ilanları ve etkinlikleri tek adreste, güncel.
          </p>

          <div className="flex gap-3 justify-center mt-7">
            <Link href="/kayit" className="px-5 py-2.5 rounded-lg bg-eu text-white font-semibold">
              Kayıt Ol
            </Link>
            <Link href="/projeler" className="px-5 py-2.5 rounded-lg border border-white/60 text-white font-semibold">
              Projeleri Keşfet
            </Link>
          </div>

          <div className="flex gap-10 justify-center mt-10">
            <Stat value={stats.projects} label="Proje" />
            <Stat value={stats.openListings} label="Açık İlan" />
            <Stat value={stats.upcomingEvents} label="Yaklaşan Etkinlik" />
          </div>
        </div>
      </div>

      {/* Banner 2 */}
      <div
        className={`absolute inset-0 bg-cover bg-center flex items-center transition-opacity duration-700 ${
          slide === 1 ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
        style={{ backgroundImage: "url('/images/homepage/banner/banner-2.png')" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_90%_at_50%_50%,rgba(245,248,255,0.88),rgba(245,248,255,0.45))]" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="font-semibold tracking-widest text-xs uppercase text-eu">
            Dijital Araçlar
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-3 text-ink">
            Projelerinizin dijital
            <br /> ihtiyaçlarını karşılayın.
          </h1>
          <p className="mt-4 text-slate max-w-xl mx-auto">
            Görünürlük, etkinlik, doküman, bülten, e-learning, raporlama — tüm araçlar hazır.
          </p>
          <div className="mt-7">
            <Link href="/#araclar" className="px-5 py-2.5 rounded-lg bg-eu text-white font-semibold">
              Araçları Keşfet →
            </Link>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`Banner ${i + 1}`}
            className={`w-3.5 h-3.5 rounded-full border border-white/80 shadow transition-colors ${
              slide === i ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/80 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
