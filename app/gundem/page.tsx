import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";

export const revalidate = 60;

const CATEGORIES = ["AB Politikası", "Fonlar & Finansman", "Proje Haberleri", "Etkinlikler", "Duyurular"];

export default async function GundemPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const params = await searchParams;
  const db = getDataProvider();
  const allPosts = await db.getBlogPosts();

  const filtered = params.kategori
    ? allPosts.filter((p) => p.category === params.kategori)
    : allPosts;

  const sorted = filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "AB-Türkiye Gündemi" }]} />

        <h1 className="text-3xl font-extrabold text-ink mb-2">AB-Türkiye Gündemi</h1>
        <p className="text-slate mb-8">AB-Türkiye ilişkileri, proje haberleri ve sektör güncellemeleri.</p>

        {/* Kategoriler */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/gundem"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !params.kategori ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"
            }`}>
            Tümü
          </Link>
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/gundem?kategori=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                params.kategori === cat ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"
              }`}>
              {cat}
            </Link>
          ))}
        </div>

        {/* Haber listesi */}
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
                  <span>{new Date(post.publishedAt).toLocaleDateString("tr", { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span>{post.readMinutes} dk okuma</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-16 text-slate">Bu kategoride haber bulunamadı.</div>
        )}
      </div>
    </PageShell>
  );
}
