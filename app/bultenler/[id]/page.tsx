"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import type { Campaign, BlogPost, Subscriber } from "@/lib/types";

export default function BultenDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { current: firma } = useFirma();
  const [camp, setCamp] = useState<Campaign | null | undefined>(undefined);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [publisher, setPublisher] = useState<Subscriber | null>(null);

  useEffect(() => {
    const db = getDataProvider();
    Promise.all([db.getCampaigns(), db.getBlogPosts(), db.getSubscribers()]).then(
      ([camps, allPosts, subs]) => {
        const found = camps.find((c) => c.id === id) ?? null;
        setCamp(found);
        if (found?.includedPostIds?.length) {
          setPosts(allPosts.filter((p) => found.includedPostIds!.includes(p.id)));
        }
        if (found?.publisherSubscriberId) {
          setPublisher(subs.find((s) => s.id === found.publisherSubscriberId) ?? null);
        }
      }
    );
  }, [id]);

  if (camp === undefined) {
    return <PageShell><div className="max-w-2xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div></PageShell>;
  }

  if (!camp || camp.status !== "gonderildi") {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h1 className="text-xl font-bold text-ink mb-3">{camp ? "Bu bülten henüz yayınlanmadı" : "Bülten bulunamadı"}</h1>
          <p className="text-slate text-sm mb-4">{camp ? "Taslak durumundaki bültenler kamuya açık değildir." : ""}</p>
          <Link href="/araclar/bulten" className="text-eu text-sm hover:underline">← Bültenler</Link>
        </div>
      </PageShell>
    );
  }

  const publishedDate = camp.sentAt
    ? new Date(camp.sentAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : "";

  // Giriş metni — ilk paragraf
  const introText = camp.body?.split("\n\n")[0] ?? "";
  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://euinturkiye.com/bultenler/${id}`;

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Bültenler", href: "/araclar/bulten" },
          { label: camp.subject },
        ]} />

        {/* ── Bülten başlığı ── */}
        <div className="bg-eu rounded-2xl px-8 py-8 mb-8">
          <p className="text-white/60 text-xs mb-1 uppercase tracking-widest font-semibold">EUinTürkiye · Bülten</p>
          <h1 className="text-2xl font-bold text-white leading-tight mb-4">{camp.subject}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {publishedDate && <span className="text-white/70 text-sm">{publishedDate}</span>}
            {publisher && (
              <>
                <span className="text-white/40">·</span>
                <Link href={`/firma/${publisher.id}`} className="text-white/80 text-sm hover:text-white hover:underline">
                  {publisher.organization ?? publisher.name}
                </Link>
              </>
            )}
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-white/20 text-xs text-white/60">
            <span>📨 {camp.recipientCount} kişiye gönderildi</span>
            <span>👁 {camp.openCount} açılma</span>
          </div>
        </div>

        {/* ── Giriş metni ── */}
        {introText && (
          <div className="bg-white border border-line rounded-2xl p-6 mb-6">
            <p className="text-slate leading-relaxed whitespace-pre-wrap">{introText}</p>
          </div>
        )}

        {/* ── Bu sayıdaki haberler ── */}
        {posts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-4">Bu Sayıda</h2>
            <div className="space-y-4">
              {posts.map((p) => (
                <Link key={p.id} href={`/gundem/${p.slug}`}
                  className="bg-white border border-line rounded-xl p-5 flex gap-4 hover:border-eu hover:shadow-sm transition-all">
                  {p.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt={p.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-surface text-mist px-2 py-0.5 rounded font-medium">{p.category}</span>
                      <span className="text-xs text-mist">{new Date(p.publishedAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <h3 className="font-bold text-ink text-sm leading-tight mb-1">{p.title}</h3>
                    <p className="text-slate text-xs leading-relaxed line-clamp-2">{p.excerpt}</p>
                    <span className="text-xs text-eu font-semibold mt-1 inline-block">Devamını oku →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Sayfa linki ── */}
        <div className="bg-surface rounded-xl p-4 mb-6">
          <p className="text-xs text-mist mb-1 font-semibold">Bu bültenin kalıcı sayfası:</p>
          <div className="flex items-center gap-2">
            <span className="text-eu text-sm font-medium break-all flex-1">{pageUrl}</span>
            <button onClick={() => navigator.clipboard?.writeText(pageUrl)}
              className="text-xs text-mist hover:text-eu flex-shrink-0 border border-line rounded px-2 py-1">
              Kopyala
            </button>
          </div>
        </div>

        {/* ── Abonelik CTA ── */}
        <div className="bg-eu-pale border border-eu/20 rounded-2xl p-6 text-center mb-6">
          <h3 className="font-bold text-ink mb-2">Bültenlere Abone Olun</h3>
          <p className="text-sm text-slate mb-4 max-w-sm mx-auto">
            Platforma kayıt olarak ilgilendiğiniz projelerin bültenlerini otomatik alabilirsiniz.
          </p>
          {firma ? (
            <span className="inline-flex items-center gap-2 text-green-700 text-sm font-semibold">
              ✓ Zaten giriş yaptınız — bültenler profilinize bağlı
            </span>
          ) : (
            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/giris" className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Giriş Yap</Link>
              <Link href="/kayit" className="px-4 py-2 border border-eu text-eu rounded-lg text-sm font-semibold">Kayıt Ol</Link>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link href="/araclar/bulten" className="text-eu hover:underline">← Diğer bültenler</Link>
          {publisher && (
            <Link href={`/firma/${publisher.id}`} className="text-mist hover:text-eu">
              {publisher.organization ?? publisher.name} →
            </Link>
          )}
        </div>
      </div>
    </PageShell>
  );
}
