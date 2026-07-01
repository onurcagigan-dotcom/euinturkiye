"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface HeroBanner {
  id: string;
  imageUrl: string;
  /** Görselin üzerine bindirilecek başlık (opsiyonel — görsel kendi içinde metin barındırıyorsa boş bırakılabilir) */
  title?: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
  /** Bu bannerda hızlı proje arama kutusu gösterilsin mi */
  showSearch?: boolean;
}

interface Props {
  banners: HeroBanner[];
  /** Otomatik geçiş aralığı (ms). 0 verilirse otomatik geçiş kapanır. */
  intervalMs?: number;
  searchPlaceholder?: string;
}

export function HeroCarousel({ banners, intervalMs = 6000, searchPlaceholder }: Props) {
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (banners.length <= 1 || intervalMs <= 0) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [banners.length, intervalMs]);

  if (banners.length === 0) return null;

  const banner = banners[index];

  const submitSearch = () => {
    const q = query.trim();
    if (!q) { router.push("/projeler"); return; }
    router.push(`/projeler?ara=${encodeURIComponent(q)}`);
  };

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
      {(banner.title || banner.subtitle || banner.showSearch) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
      )}

      {(banner.title || banner.subtitle || banner.linkHref || banner.showSearch) && (
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center text-white px-6 pb-10">
          {banner.title && <h2 className="text-2xl md:text-3xl font-extrabold mb-2">{banner.title}</h2>}
          {banner.subtitle && <p className="text-sm md:text-base text-white/90 max-w-xl mb-4">{banner.subtitle}</p>}

          {banner.showSearch && (
            <div className="w-full max-w-md mb-4">
              <div className="flex items-center gap-2 bg-white rounded-full shadow-lg pl-5 pr-1.5 py-1.5">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
                  placeholder={searchPlaceholder ?? "Proje ara…"}
                  className="flex-1 text-sm text-ink outline-none placeholder:text-mist bg-transparent"
                />
                <button onClick={submitSearch}
                  className="px-4 py-2 bg-eu text-white rounded-full text-sm font-semibold hover:bg-blue-800 transition-colors flex-shrink-0">
                  Ara
                </button>
              </div>
            </div>
          )}

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
