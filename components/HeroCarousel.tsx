"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export interface HeroBanner {
  id: string;
  imageUrl: string;
  /** Görselin üzerine bindirilecek başlık (opsiyonel — görsel kendi içinde metin barındırıyorsa boş bırakılabilir) */
  title?: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
}

interface Props {
  banners: HeroBanner[];
  /** Otomatik geçiş aralığı (ms). 0 verilirse otomatik geçiş kapanır. */
  intervalMs?: number;
}

export function HeroCarousel({ banners, intervalMs = 6000 }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1 || intervalMs <= 0) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [banners.length, intervalMs]);

  if (banners.length === 0) return null;

  const banner = banners[index];

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 6" }}>
      {banners.map((b, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={b.id}
          src={b.imageUrl}
          alt={b.title ?? ""}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}

      {/* Karartma katmanı — metin okunabilirliği için */}
      {(banner.title || banner.subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      )}

      {(banner.title || banner.subtitle || banner.linkHref) && (
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center text-white px-6 pb-10">
          {banner.title && <h2 className="text-2xl md:text-3xl font-extrabold mb-2">{banner.title}</h2>}
          {banner.subtitle && <p className="text-sm md:text-base text-white/90 max-w-xl mb-4">{banner.subtitle}</p>}
          {banner.linkHref && banner.linkLabel && (
            <Link href={banner.linkHref} className="px-5 py-2.5 bg-white text-eu font-bold rounded-xl hover:bg-blue-50 transition-colors">
              {banner.linkLabel}
            </Link>
          )}
        </div>
      )}

      {/* Gösterge noktaları */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIndex(i)}
              aria-label={`Banner ${i + 1}`}
              className="w-2 h-2 rounded-full transition-all"
              style={{ backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.4)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
