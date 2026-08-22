"use client";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDataProvider } from "@/lib/data";
import { getLibraryLogo } from "@/lib/website/logo-library";
import { renderTemplate } from "@/lib/website/templates";
import type { Project, Sector, Donor, ProjectWebsite } from "@/lib/types";

export default function ProjectSitePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const db = getDataProvider();

  const [data, setData] = useState<{
    website: ProjectWebsite;
    project: Project;
    sector: Sector | null;
    donor: Donor | null;
  } | null>(null);
  const [notFound_, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const website = await db.getProjectWebsiteBySlug(slug);
      if (!website || !website.published) { setNotFound(true); return; }
      const project = await db.getProject(website.projectId);
      if (!project) { setNotFound(true); return; }
      const [sector, donor] = await Promise.all([
        db.getSector(project.sectorId),
        db.getDonor(project.donorId),
      ]);
      setData({ website, project, sector, donor });
    })();
  }, [slug, db]);

  if (notFound_) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f9fafb" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: "#111" }}>404</h1>
          <p style={{ color: "#6b7280" }}>Bu proje sitesi bulunamadı veya henüz yayınlanmamış.</p>
          <a href="/" style={{ color: "#003399", marginTop: 16, display: "inline-block" }}>Ana Sayfaya Dön</a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fff" }}>
        <div style={{ color: "#9ca3af", fontSize: 14 }}>Yükleniyor…</div>
      </div>
    );
  }

  const resolvedLogos = data.website.footerLogos.map((fl) => ({
    id: fl.id,
    imageUrl: fl.source === "custom" ? fl.imageUrl : getLibraryLogo(fl.libraryKey ?? "")?.svgOrUrl,
    label: fl.label,
    libraryLogo: fl.libraryKey ? getLibraryLogo(fl.libraryKey) : undefined,
  }));

  // Dil: tarayıcı dilinden veya varsayılan TR
  const browserLang = typeof navigator !== "undefined" && navigator.language.startsWith("en") ? "en" : "tr";

  return renderTemplate({
    website: data.website,
    project: data.project,
    sector: data.sector,
    donor: data.donor,
    resolvedLogos,
    locale: browserLang,
  });
}
