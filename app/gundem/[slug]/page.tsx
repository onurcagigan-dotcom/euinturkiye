import Link from "next/link";
import { notFoundNever } from "@/lib/not-found-helper";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDataProvider();
  const post = await db.getBlogPost(slug);
  if (!post) notFoundNever();

  return (
    <PageShell>
      <article className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/gundem" className="text-eu text-sm hover:underline">← Gündem</Link>

        <span className="inline-block text-xs font-semibold text-eu bg-eu-pale px-3 py-1.5 rounded-full mt-6">
          {post.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-ink mt-4 leading-tight">{post.title}</h1>
        <p className="text-sm text-mist mt-3">{post.publishedAt} · {post.readMinutes} dk okuma</p>

        <p className="text-lg text-slate mt-6 leading-relaxed">{post.excerpt}</p>

        <div className="prose prose-slate mt-6 text-ink leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </article>
    </PageShell>
  );
}
