"use client";
// ─── Proje Web Sitesi Şablonları ────────────────────────────
// 4 template × 3 header versiyonu (TR+EN çift)

import type { ProjectWebsite, Project, Sector, Donor } from "@/lib/types";
import type { LibraryLogo } from "./logo-library";

// ─── Header Bileşenleri ──────────────────────────────────────

interface HeaderProps {
  title: string;
  subtitle?: string;
  tagline?: string;
  logoUrl?: string;
  version: 1 | 2 | 3;
  accentColor?: string;
}

/** Header V1 — Ortalanmış, sade. Logo solda, metin ortada */
export function WebsiteHeader({ title, subtitle, tagline, logoUrl, version, accentColor }: HeaderProps) {
  const accent = accentColor ?? "#003399";

  if (version === 1) {
    return (
      <header style={{ height: 250, background: "#fff", borderBottom: "3px solid " + accent }}
        className="flex items-center px-10 gap-8">
        {logoUrl && (
          <div className="flex-shrink-0 w-40 h-28 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Proje Logosu" className="max-w-full max-h-full object-contain" />
          </div>
        )}
        <div className={`${logoUrl ? "flex-1" : "w-full text-center"}`}>
          <div className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: accent }}>
            {tagline ?? "AB Destekli Proje"}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{title}</h1>
          {subtitle && <p className="text-gray-500 text-base">{subtitle}</p>}
        </div>
        {/* EU yıldız rozetleri — sağ köşe */}
        <div className="flex-shrink-0">
          <svg viewBox="0 0 60 60" width={60} height={60}>
            {Array.from({length:12},(_,i)=>{
              const a=(i*30-90)*Math.PI/180;
              const cx=30+18*Math.cos(a), cy=30+18*Math.sin(a);
              return <polygon key={i} transform={`translate(${cx},${cy})`}
                points="0,-3.5 0.9,-1.1 3.3,-1.1 1.3,0.7 2,3.1 0,1.5 -2,3.1 -1.3,0.7 -3.3,-1.1 -0.9,-1.1"
                fill="#FFCC00" />;
            })}
          </svg>
        </div>
      </header>
    );
  }

  if (version === 2) {
    // V2 — İki sütun: sol büyük başlık, sağ logo + tagline dikey
    return (
      <header style={{ height: 250, background: "#fff", borderLeft: "6px solid " + accent }}
        className="flex items-stretch px-10">
        <div className="flex-1 flex flex-col justify-center py-8">
          <div className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: accent }}>
            {tagline ?? "EU-Funded Project"}
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-none mb-3">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm max-w-xl leading-relaxed">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-center justify-center gap-4 w-52 border-l border-gray-100 pl-8 py-8">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="max-w-36 max-h-24 object-contain" />
          ) : (
            <svg viewBox="0 0 80 80" width={80} height={80}>
              <rect width="80" height="80" fill={accent} rx="4"/>
              {Array.from({length:12},(_,i)=>{
                const a=(i*30-90)*Math.PI/180;
                const cx=40+24*Math.cos(a), cy=40+24*Math.sin(a);
                return <polygon key={i} transform={`translate(${cx},${cy})`}
                  points="0,-4.5 1.1,-1.4 4.3,-1.4 1.7,0.9 2.6,4 0,2 -2.6,4 -1.7,0.9 -4.3,-1.4 -1.1,-1.4"
                  fill="#FFCC00" />;
              })}
            </svg>
          )}
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold">IPA Project</div>
          </div>
        </div>
      </header>
    );
  }

  // V3 — Üst bant + alt içerik: Güçlü renk şerit üstte, beyaz alt
  return (
    <header style={{ height: 250, background: "#fff" }} className="flex flex-col">
      <div style={{ background: accent, height: 10 }} />
      <div className="flex-1 flex items-center px-10 gap-8 py-6">
        {logoUrl && (
          <div className="w-32 h-20 flex items-center flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
        {tagline && (
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest font-bold" style={{ color: accent }}>{tagline}</div>
          </div>
        )}
      </div>
      <div style={{ background: accent, height: 4, opacity: 0.15 }} />
    </header>
  );
}

// ─── Footer Bileşeni ─────────────────────────────────────────

interface FooterProps {
  logos: Array<{
    id: string;
    imageUrl?: string;
    label?: string;
    libraryLogo?: LibraryLogo;
  }>;
  accentColor?: string;
}

export function WebsiteFooter({ logos, accentColor }: FooterProps) {
  const accent = accentColor ?? "#003399";
  if (logos.length === 0) return null;
  return (
    <footer style={{ background: "#fff", borderTop: "2px solid #f0f0f0", minHeight: 120 }}
      className="flex items-center justify-center px-10 py-6 gap-8">
      {logos
        .sort((a, b) => 0)
        .map((logo) => {
          const src = logo.imageUrl ?? logo.libraryLogo?.svgOrUrl;
          return (
            <div key={logo.id} className="flex flex-col items-center gap-1.5" style={{ height: 120 }}>
              <div className="flex items-center justify-center flex-1 px-2">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={logo.label ?? ""} style={{ maxHeight: 80, maxWidth: 120, objectFit: "contain" }} />
                ) : (
                  <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                    Logo
                  </div>
                )}
              </div>
              {logo.label && (
                <span className="text-xs text-gray-400 text-center leading-tight max-w-[120px]">{logo.label}</span>
              )}
            </div>
          );
        })}
    </footer>
  );
}

// ─── Template Bileşenleri ─────────────────────────────────────

interface TemplateProps {
  website: ProjectWebsite;
  project: Project;
  sector?: Sector | null;
  donor?: Donor | null;
  resolvedLogos: FooterProps["logos"];
  locale: "tr" | "en";
  preview?: boolean;
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>{title}</h2>
      <div className="text-gray-700 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function InfoGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.label} className="bg-gray-50 rounded-lg px-4 py-3">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{it.label}</div>
          <div className="text-sm font-semibold text-gray-800">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

/** Template 1: Minimal — Sade beyaz, geniş boşluk, ince tipografi */
export function TemplateMinimal({ website, project, sector, donor, resolvedLogos, locale }: TemplateProps) {
  const accent = website.accentColor ?? "#003399";
  const h = locale === "tr" ? website.headerTr : website.headerEn;
  const isEn = locale === "en";

  const infoItems = [
    donor && { label: isEn ? "Donor" : "Donör", value: donor.name },
    project.beneficiary && { label: isEn ? "Beneficiary" : "Faydalanıcı", value: project.beneficiary },
    project.priorityArea && { label: isEn ? "Priority Area" : "Öncelik Alanı", value: project.priorityArea },
    project.euBudget && { label: isEn ? "EU Contribution" : "AB Katkısı", value: `€${project.euBudget.toLocaleString()}` },
    project.locations?.length && { label: isEn ? "Locations" : "Uygulama Yerleri", value: project.locations.join(", ") },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fafafa", minHeight: "100vh" }}>
      <WebsiteHeader {...h} version={website.headerVersion} accentColor={accent} />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        {infoItems.length > 0 && <InfoGrid items={infoItems} />}
        {website.showObjective && project.objective && (
          <Section title={isEn ? "Project Objective" : "Proje Amacı"} accent={accent}>
            {project.objective}
          </Section>
        )}
        {website.showOutputs && project.expectedOutputs && (
          <Section title={isEn ? "Expected Outputs" : "Beklenen Çıktılar"} accent={accent}>
            {project.expectedOutputs}
          </Section>
        )}
      </main>
      <WebsiteFooter logos={resolvedLogos} accentColor={accent} />
    </div>
  );
}

/** Template 2: Bold — Koyu arka plan, büyük başlıklar, yüksek kontrast */
export function TemplateBold({ website, project, sector, donor, resolvedLogos, locale }: TemplateProps) {
  const accent = website.accentColor ?? "#003399";
  const h = locale === "tr" ? website.headerTr : website.headerEn;
  const isEn = locale === "en";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#111827", minHeight: "100vh", color: "#f9fafb" }}>
      <div style={{ background: "#fff" }}>
        <WebsiteHeader {...h} version={website.headerVersion} accentColor={accent} />
      </div>
      {/* Hero şerit */}
      <div style={{ background: accent, padding: "32px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          {project.priorityArea && (
            <div style={{ color: "#FFCC00", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>
              {project.priorityArea}
            </div>
          )}
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
            {donor?.name} · {project.ipaPeriod}
            {project.euBudget && ` · €${(project.euBudget / 1e6).toFixed(1)}M`}
          </div>
        </div>
      </div>
      {/* İçerik */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        {website.showObjective && project.objective && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: "#FFCC00", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 12 }}>
              {isEn ? "Project Objective" : "Proje Amacı"}
            </h2>
            <p style={{ color: "#d1d5db", fontSize: 15, lineHeight: 1.7 }}>{project.objective}</p>
          </div>
        )}
        {project.locations?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
            {project.locations.map((loc) => (
              <span key={loc} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#e5e7eb" }}>
                📍 {loc}
              </span>
            ))}
          </div>
        )}
      </main>
      <div style={{ background: "#fff" }}>
        <WebsiteFooter logos={resolvedLogos} accentColor={accent} />
      </div>
    </div>
  );
}

/** Template 3: Academic — İki kolon, akademik rapor tarzı */
export function TemplateAcademic({ website, project, sector, donor, resolvedLogos, locale }: TemplateProps) {
  const accent = website.accentColor ?? "#003399";
  const h = locale === "tr" ? website.headerTr : website.headerEn;
  const isEn = locale === "en";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", minHeight: "100vh" }}>
      <WebsiteHeader {...h} version={website.headerVersion} accentColor={accent} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", display: "flex", gap: 40, alignItems: "flex-start" }}>
        {/* Sol: Sidebar meta */}
        <aside style={{ width: 220, flexShrink: 0, position: "sticky", top: 20 }}>
          <div style={{ background: "#f8f9fa", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#6b7280", marginBottom: 16 }}>
              {isEn ? "Project Details" : "Proje Bilgileri"}
            </div>
            {[
              donor && [isEn ? "Donor" : "Donör", donor.name],
              project.beneficiary && [isEn ? "Beneficiary" : "Faydalanıcı", project.beneficiary],
              project.euBudget && [isEn ? "EU Budget" : "AB Katkısı", `€${(project.euBudget/1e6).toFixed(2)}M`],
              project.priorityArea && [isEn ? "Priority" : "Öncelik", project.priorityArea],
              project.ipaPeriod && ["IPA", project.ipaPeriod],
            ].filter(Boolean).map((item) => {
              const [label, value] = item as [string, string];
              return (
              <div key={String(label)} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#374151", fontWeight: 500, lineHeight: 1.4 }}>{value}</div>
              </div>
              );
            })}
          </div>
        </aside>
        {/* Sağ: Ana içerik */}
        <main style={{ flex: 1 }}>
          {website.showObjective && project.objective && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: 12 }}>
                {isEn ? "Overall Objective" : "Genel Hedef"}
              </h2>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.75 }}>{project.objective}</p>
            </section>
          )}
          {website.showOutputs && project.expectedOutputs && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: 12 }}>
                {isEn ? "Expected Results & Outputs" : "Beklenen Sonuçlar ve Çıktılar"}
              </h2>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.75 }}>{project.expectedOutputs}</p>
            </section>
          )}
          {website.showLocations && project.locations?.length > 0 && (
            <section>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: 12 }}>
                {isEn ? "Implementation Locations" : "Uygulama Yerleri"}
              </h2>
              <p style={{ fontSize: 14, color: "#374151" }}>{project.locations.join(" · ")}</p>
            </section>
          )}
        </main>
      </div>
      <WebsiteFooter logos={resolvedLogos} accentColor={accent} />
    </div>
  );
}

/** Template 4: Impact — Görsel ağırlıklı, büyük rakamlar */
export function TemplateImpact({ website, project, sector, donor, resolvedLogos, locale }: TemplateProps) {
  const accent = website.accentColor ?? "#003399";
  const h = locale === "tr" ? website.headerTr : website.headerEn;
  const isEn = locale === "en";

  const stats = [
    project.euBudget && { value: `€${(project.euBudget/1e6).toFixed(0)}M`, label: isEn ? "EU Contribution" : "AB Katkısı" },
    project.totalBudget && { value: `€${(project.totalBudget/1e6).toFixed(0)}M`, label: isEn ? "Total Budget" : "Toplam Bütçe" },
    project.locations?.length && { value: String(project.locations.length), label: isEn ? (project.locations.length > 1 ? "Provinces" : "Province") : "İl" },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", minHeight: "100vh" }}>
      <WebsiteHeader {...h} version={website.headerVersion} accentColor={accent} />
      {/* Impact rakamları */}
      {stats.length > 0 && (
        <div style={{ background: accent, padding: "28px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#FFCC00", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        {website.showObjective && project.objective && (
          <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 20, marginBottom: 32 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: accent, marginBottom: 10 }}>
              {isEn ? "Project Objective" : "Proje Amacı"}
            </h2>
            <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.75 }}>{project.objective}</p>
          </div>
        )}
        {website.showOutputs && project.expectedOutputs && (
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: accent, marginBottom: 10 }}>
              {isEn ? "Key Outputs" : "Temel Çıktılar"}
            </h2>
            <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.7 }}>{project.expectedOutputs}</p>
          </div>
        )}
        {website.showLocations && project.locations?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {project.locations.map((loc) => (
              <span key={loc} style={{ background: `${accent}12`, color: accent, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600 }}>
                {loc}
              </span>
            ))}
          </div>
        )}
      </main>
      <WebsiteFooter logos={resolvedLogos} accentColor={accent} />
    </div>
  );
}

// ─── Template Seçici ─────────────────────────────────────────
export function renderTemplate(props: TemplateProps) {
  switch (props.website.templateId) {
    case "minimal":  return <TemplateMinimal {...props} />;
    case "bold":     return <TemplateBold {...props} />;
    case "academic": return <TemplateAcademic {...props} />;
    case "impact":   return <TemplateImpact {...props} />;
    default:         return <TemplateMinimal {...props} />;
  }
}

export const TEMPLATE_META = [
  { id: "minimal" as const, label: "Minimal", desc: "Sade beyaz, geniş boşluk, tipografi odaklı", icon: "⬜" },
  { id: "bold" as const, label: "Bold", desc: "Koyu arka plan, yüksek kontrast, güçlü izlenim", icon: "◼" },
  { id: "academic" as const, label: "Academic", desc: "İki kolon, meta sidebar, rapor formatı", icon: "📄" },
  { id: "impact" as const, label: "Impact", desc: "Büyük rakamlar, bütçe/lokasyon highlight", icon: "🎯" },
];
