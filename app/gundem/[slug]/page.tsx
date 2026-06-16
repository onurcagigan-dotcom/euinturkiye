import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { notFoundNever } from "@/lib/not-found-helper";

export const revalidate = 60;

export default async function GundemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDataProvider();
  const post = await db.getBlogPost(slug);

  if (!post) notFoundNever();

  const project = post.projectId ? await db.getProject(post.projectId) : null;
  const allPosts = await db.getBlogPosts();
  const otherPosts = allPosts
    .filter((p) => p.id !== post.id && (post.projectId ? p.projectId === post.projectId : p.category === post.category))
    .slice(0, 3);

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: "Ana Sayfa", href: "/" },
          { label: "AB-Türkiye Gündemi", href: "/gundem" },
          { label: post.title },
        ]} />

        {/* Kategori + meta */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-eu bg-eu-pale px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-mist">{post.readMinutes} dk okuma</span>
        </div>

        <h1 className="text-3xl font-extrabold text-ink leading-tight mb-4">{post.title}</h1>
        <p className="text-slate text-lg leading-relaxed mb-6">{post.excerpt}</p>

        <div className="flex items-center gap-4 text-xs text-mist mb-8 pb-6 border-b border-line">
          <span>{new Date(post.publishedAt).toLocaleDateString("tr", { day: "numeric", month: "long", year: "numeric" })}</span>
          {project && (
            <>
              <span>|</span>
              <Link href={`/projeler/${project.id}`} className="text-eu hover:underline font-semibold">
                {project.title}
              </Link>
            </>
          )}
        </div>

        {/* Kapak görseli placeholder */}
        <div className="h-56 bg-gradient-to-br from-eu to-blue-800 rounded-2xl mb-8 flex items-center justify-center">
          <span className="text-white/40 text-6xl">✦</span>
        </div>

        {/* İçerik */}
        <div className="prose prose-slate max-w-none">
          {post.content.split("\n\n").map((para, i) => (
            <p key={i} className="text-ink leading-relaxed mb-5">
              {para}
            </p>
          ))}
        </div>

        {/* İlgili haberler */}
        {otherPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-line">
            <h2 className="text-xl font-bold text-ink mb-5">
              {post.projectId ? "Projeden Diğer Haberler" : "İlgili Haberler"}
            </h2>
            <div className="space-y-3">
              {otherPosts.map((p) => (
                <Link key={p.id} href={`/gundem/${p.slug}`}
                  className="flex items-start gap-4 p-4 border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-eu mt-2" />
                  <div>
                    <h3 className="font-semibold text-ink text-sm">{p.title}</h3>
                    <p className="text-xs text-mist mt-1">
                      {new Date(p.publishedAt).toLocaleDateString("tr")} · {p.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/gundem" className="inline-block mt-4 text-eu text-sm font-semibold hover:underline">
              Tüm haberler →
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
