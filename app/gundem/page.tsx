"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import type { BlogPost } from "@/lib/types";

const CATEGORIES = ["AB Politikası", "Fonlar & Finansman", "Proje Haberleri", "Etkinlikler", "Duyurular"];

function GundemPageInner() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const kategori = searchParams.get("kategori");
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    getDataProvider().getBlogPosts().then(setPosts);
  }, []);

  const filtered = kategori ? posts.filter((p) => p.category === kategori) : posts;
  const sorted = [...filtered].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("news_title") }]} />

        <h1 className="text-3xl font-extrabold text-ink mb-2">{t("news_title")}</h1>
        <p className="text-slate mb-8">{t("news_sub")}</p>

        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/gundem"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !kategori ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"
            }`}>
            {t("listings_all")}
          </Link>
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/gundem?kategori=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                kategori === cat ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"
              }`}>
              {cat}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((post) => (
            <Link key={post.id} href={`/gundem/${post.slug}`}
              className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-40 bg-gradient-to-br from-eu to-blue-800 flex items-end p-4">
                <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              <div className="p-5">
                <h2 className="font-bold text-ink leading-tight mb-2 group-hover:text-eu transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-mist">
                  <span>{new Date(post.publishedAt).toLocaleDateString(locale === "tr" ? "tr" : "en", { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span>{post.readMinutes} {t("news_read_min")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-16 text-slate">{t("news_not_found")}</div>
        )}
      </div>
    </PageShell>
  );
}

export default function GundemPage() {
  return (
    <Suspense fallback={null}>
      <GundemPageInner />
    </Suspense>
  );
}
