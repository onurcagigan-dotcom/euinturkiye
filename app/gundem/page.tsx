import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell, PageBanner } from "@/components/PageShell";

export default async function GundemPage() {
  const db = getDataProvider();
  const posts = await db.getBlogPosts();

  return (
    <PageShell>
      <PageBanner
        kicker="Gündemi"
        title="AB - Türkiye Gündemi"
        desc="Projeler, mevzuat, görünürlük ve mali işbirliğine dair güncel yazılar."
      />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {posts.length === 0 ? (
          <p className="text-slate py-12 text-center">Henüz yazı yok.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((b) => (
              <Link
                key={b.id}
                href={`/gundem/${b.slug}`}
                className="bg-white border border-line rounded-xl overflow-hidden block hover:shadow-lg transition"
              >
                <div className="p-6">
                  <span className="text-xs font-semibold text-eu">{b.category}</span>
                  <h3 className="font-bold text-[15px] mt-2 text-ink leading-snug">{b.title}</h3>
                  <p className="text-sm text-slate mt-2 line-clamp-3">{b.excerpt}</p>
                  <p className="text-xs text-mist mt-3">{b.publishedAt} · {b.readMinutes} dk okuma</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
