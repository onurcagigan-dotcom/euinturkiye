"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import type { BlogPost, Project } from "@/lib/types";

export default function GundemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t, locale } = useLocale();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [project, setProject] = useState<Project | null>(null);
  const [otherPosts, setOtherPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const db = getDataProvider();
    db.getBlogPost(slug).then(async (p) => {
      setPost(p);
      if (p) {
        const [proj, allPosts] = await Promise.all([
          p.projectId ? db.getProject(p.projectId) : Promise.resolve(null),
          db.getBlogPosts(),
        ]);
        setProject(proj);
        setOtherPosts(
          allPosts.filter((o) => o.id !== p.id && (p.projectId ? o.projectId === p.projectId : o.category === p.category)).slice(0, 3)
        );
      }
    });
  }, [slug]);

  if (post === undefined) {
    return <PageShell><div className="max-w-3xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }

  if (post === null) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-ink mb-2">{t("notfound_title")}</h1>
          <Link href="/gundem" className="text-eu hover:underline">{t("news_all")}</Link>
        </div>
      </PageShell>
    );
  }

  const dateLocale = locale === "tr" ? "tr" : "en";

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: t("breadcrumb_home"), href: "/" },
          { label: t("news_title"), href: "/gundem" },
          { label: post.title },
        ]} />

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-eu bg-eu-pale px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-mist">{post.readMinutes} {t("news_read_min")}</span>
        </div>

        <h1 className="text-3xl font-extrabold text-ink leading-tight mb-4">{post.title}</h1>
        <p className="text-slate text-lg leading-relaxed mb-6">{post.excerpt}</p>

        <div className="flex items-center gap-4 text-xs text-mist mb-8 pb-6 border-b border-line">
          <span>{new Date(post.publishedAt).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}</span>
          {project && (
            <>
              <span>|</span>
              <Link href={`/projeler/${project.id}`} className="text-eu hover:underline font-semibold">
                {project.title}
              </Link>
            </>
          )}
        </div>

        {post.coverImage ? (
          <div className="h-56 md:h-80 rounded-2xl mb-8 overflow-hidden bg-surface">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-56 bg-gradient-to-br from-eu to-blue-800 rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-white/40 text-6xl">✦</span>
          </div>
        )}

        <div className="prose prose-slate max-w-none">
          {post.content.split("\n\n").map((para, i) => (
            <p key={i} className="text-ink leading-relaxed mb-5">
              {para}
            </p>
          ))}
        </div>

        {otherPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-line">
            <h2 className="text-xl font-bold text-ink mb-5">
              {post.projectId ? t("news_other_project") : t("news_related")}
            </h2>
            <div className="space-y-3">
              {otherPosts.map((p) => (
                <Link key={p.id} href={`/gundem/${p.slug}`}
                  className="flex items-start gap-4 p-4 border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-eu mt-2" />
                  <div>
                    <h3 className="font-semibold text-ink text-sm">{p.title}</h3>
                    <p className="text-xs text-mist mt-1">
                      {new Date(p.publishedAt).toLocaleDateString(dateLocale)} · {p.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/gundem" className="inline-block mt-4 text-eu text-sm font-semibold hover:underline">
              {t("news_all")} →
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
