"use client";
import type { ProjectWebsite, Project, Sector, Donor } from "@/lib/types";
import type { LibraryLogo } from "./logo-library";

// ─── Yardımcı tipler ─────────────────────────────────────────
interface ResolvedLogo {
  id: string;
  imageUrl?: string;
  label?: string;
  libraryLogo?: LibraryLogo;
}

export interface TemplateProps {
  website: ProjectWebsite;
  project: Project;
  sector?: Sector | null;
  donor?: Donor | null;
  resolvedLogos: ResolvedLogo[];
  locale: "tr" | "en";
  preview?: boolean;
}

// ─── Navigasyon Menüsü ────────────────────────────────────────
function WebsiteNav({ website, accent, locale }: {
  website: ProjectWebsite; accent: string; locale: "tr" | "en";
}) {
  const nav = website.navMenu;
  if (!nav?.enabled || !nav.items.length) return null;
  const header = locale === "tr" ? website.headerTr : website.headerEn;
  return (
    <nav style={{ background: accent, padding: "0 32px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", gap: 0 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, padding: "12px 0", marginRight: 24, opacity: 0.9 }}>
          {header.title.slice(0, 30)}{header.title.length > 30 ? "…" : ""}
        </div>
        <div style={{ display: "flex", gap: 0, flex: 1 }}>
          {nav.items.map((item, i) => (
            <a key={i} href={item.href}
              style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500, padding: "12px 16px", textDecoration: "none", borderBottom: "2px solid transparent" }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; (e.target as HTMLElement).style.borderBottomColor = "rgba(255,255,255,0.6)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.85)"; (e.target as HTMLElement).style.borderBottomColor = "transparent"; }}>
              {locale === "en" ? (item.labelEn ?? item.label) : item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── Hero Banner ─────────────────────────────────────────────
function HeroBanner({ website, accent, locale }: {
  website: ProjectWebsite; accent: string; locale: "tr" | "en";
}) {
  const hero = website.heroBanner;
  if (!hero?.enabled) return null;
  const h = locale === "tr" ? website.headerTr : website.headerEn;
  const heightPx = hero.height === "lg" ? 580 : hero.height === "sm" ? 300 : 420;
  const overlay = hero.overlayOpacity ?? 0.5;
  const ctaLabel = locale === "en" ? (hero.ctaLabelEn ?? hero.ctaLabel) : hero.ctaLabel;

  return (
    <div style={{ position: "relative", height: heightPx, overflow: "hidden", background: accent }}>
      {hero.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hero.imageUrl} alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        }} />
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(to bottom, ${accent}${Math.round(overlay * 255).toString(16).padStart(2,"0")}, ${accent}cc)`,
      }} />
      <div style={{
        position: "relative", zIndex: 1, height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 32px",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#FFCC00", marginBottom: 16 }}>
          {h.tagline ?? "EU-Funded Project"}
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 16, maxWidth: 700 }}>
          {h.title}
        </h1>
        {h.subtitle && (
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.82)", maxWidth: 560, lineHeight: 1.6, marginBottom: 28 }}>
            {h.subtitle}
          </p>
        )}
        {ctaLabel && hero.ctaUrl && (
          <a href={hero.ctaUrl} style={{
            background: "#FFCC00", color: "#003", fontWeight: 700, fontSize: 14,
            padding: "12px 28px", borderRadius: 8, textDecoration: "none", display: "inline-block",
          }}>
            {ctaLabel}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Header Bileşenleri ──────────────────────────────────────
interface HeaderProps {
  title: string; subtitle?: string; tagline?: string; logoUrl?: string;
  version: 1 | 2 | 3; accentColor?: string;
}

export function WebsiteHeader({ title, subtitle, tagline, logoUrl, version, accentColor }: HeaderProps) {
  const accent = accentColor ?? "#003399";

  if (version === 1) {
    return (
      <header style={{ height: 250, background: "#fff", borderBottom: `3px solid ${accent}` }}
        className="flex items-center px-10 gap-8">
        {logoUrl && (
          <div className="flex-shrink-0 w-40 h-28 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
          </div>
        )}
        <div className={`${logoUrl ? "flex-1" : "w-full text-center"}`}>
          <div className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: accent }}>
            {tagline ?? "AB Destekli Proje"}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{title}</h1>
          {subtitle && <p className="text-gray-500 text-base">{subtitle}</p>}
        </div>
        <div className="flex-shrink-0">
          <svg viewBox="0 0 60 60" width={60} height={60}>
            {Array.from({length:12},(_,i)=>{const a=(i*30-90)*Math.PI/180;const cx=30+18*Math.cos(a),cy=30+18*Math.sin(a);return <polygon key={i} transform={`translate(${cx},${cy})`} points="0,-3.5 0.9,-1.1 3.3,-1.1 1.3,0.7 2,3.1 0,1.5 -2,3.1 -1.3,0.7 -3.3,-1.1 -0.9,-1.1" fill="#FFCC00"/>;}) }
          </svg>
        </div>
      </header>
    );
  }

  if (version === 2) {
    return (
      <header style={{ height: 250, background: "#fff", borderLeft: `6px solid ${accent}` }}
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
              {Array.from({length:12},(_,i)=>{const a=(i*30-90)*Math.PI/180;const cx=40+24*Math.cos(a),cy=40+24*Math.sin(a);return <polygon key={i} transform={`translate(${cx},${cy})`} points="0,-4.5 1.1,-1.4 4.3,-1.4 1.7,0.9 2.6,4 0,2 -2.6,4 -1.7,0.9 -4.3,-1.4 -1.1,-1.4" fill="#FFCC00"/>;}) }
            </svg>
          )}
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold">IPA Project</div>
        </div>
      </header>
    );
  }

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
        {tagline && <div className="text-right"><div className="text-xs uppercase tracking-widest font-bold" style={{ color: accent }}>{tagline}</div></div>}
      </div>
      <div style={{ background: accent, height: 4, opacity: 0.15 }} />
    </header>
  );
}

// ─── Footer Bileşeni ─────────────────────────────────────────
export function WebsiteFooter({ logos, accentColor, project }: {
  logos: ResolvedLogo[]; accentColor?: string; project?: Project;
}) {
  const accent = accentColor ?? "#003399";
  const hasSocial = project && (project.socialTwitter || project.socialLinkedin || project.socialFacebook || project.socialInstagram || project.socialYoutube || project.contactEmail);
  if (!logos.length && !hasSocial) return null;
  return (
    <footer style={{ background: "#fff", borderTop: "2px solid #f0f0f0" }}>
      {logos.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", padding: "28px 32px", gap: 32, minHeight: 120 }}>
          {[...logos].sort((a,b)=>0).map((logo) => {
            const src = logo.imageUrl ?? logo.libraryLogo?.svgOrUrl;
            return (
              <div key={logo.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={logo.label ?? ""} style={{ maxHeight: 80, maxWidth: 120, objectFit: "contain" }} />
                ) : (
                  <div style={{ width: 96, height: 64, background: "#f1f5f9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#94a3b8" }}>Logo</div>
                )}
                {logo.label && <span style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", maxWidth: 120 }}>{logo.label}</span>}
              </div>
            );
          })}
        </div>
      )}
      {hasSocial && project && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
          {project.contactEmail && (
            <a href={`mailto:${project.contactEmail}`} style={{ fontSize: 12, color: "#64748b", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              ✉️ {project.contactEmail}
            </a>
          )}
          {[
            { val: project.socialTwitter, label: "𝕏", color: "#000" },
            { val: project.socialLinkedin, label: "LinkedIn", color: "#0A66C2" },
            { val: project.socialFacebook, label: "Facebook", color: "#1877F2" },
            { val: project.socialInstagram, label: "Instagram", color: "#E1306C" },
            { val: project.socialYoutube, label: "YouTube", color: "#FF0000" },
          ].filter(s => s.val).map((s) => {
            const href = s.val!.startsWith("http") ? s.val! : `https://${s.val}`;
            return (
              <a key={s.label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, fontWeight: 600, color: s.color, textDecoration: "none", padding: "4px 10px", border: `1px solid ${s.color}30`, borderRadius: 6 }}>
                {s.label}
              </a>
            );
          })}
        </div>
      )}
    </footer>
  );
}

// ─── İçerik Blokları ────────────────────────────────────────
function InfoGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
      {items.map((it) => (
        <div key={it.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{it.label}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function ContentSection({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: accent, marginBottom: 10 }}>{title}</h2>
      <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}

// ─── Şablon Ortak İçerik ─────────────────────────────────────
function CommonContent({ website, project, sector, donor, locale, accent }: {
  website: ProjectWebsite; project: Project; sector?: Sector | null; donor?: Donor | null;
  locale: "tr" | "en"; accent: string;
}) {
  const isEn = locale === "en";
  const infoItems = [
    donor && { label: isEn ? "Donor" : "Donör", value: isEn ? (donor.nameEn ?? donor.name) : donor.name },
    project.beneficiary && { label: isEn ? "Beneficiary" : "Faydalanıcı", value: project.beneficiary },
    project.priorityArea && { label: isEn ? "Priority" : "Öncelik", value: project.priorityArea },
    project.euBudget && { label: isEn ? "EU Contribution" : "AB Katkısı", value: `€${(project.euBudget/1e6).toFixed(1)}M` },
    project.totalBudget && project.totalBudget !== project.euBudget && { label: isEn ? "Total Budget" : "Toplam Bütçe", value: `€${(project.totalBudget/1e6).toFixed(1)}M` },
    project.ipaPeriod && { label: "IPA", value: project.ipaPeriod },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      {infoItems.length > 0 && <InfoGrid items={infoItems} />}
      {website.showObjective && project.objective && (
        <ContentSection title={isEn ? "Project Objective" : "Proje Amacı"} accent={accent}>
          {project.objective}
        </ContentSection>
      )}
      {website.showOutputs && project.expectedOutputs && (
        <ContentSection title={isEn ? "Expected Outputs" : "Beklenen Çıktılar"} accent={accent}>
          {project.expectedOutputs}
        </ContentSection>
      )}
      {website.showLocations && project.locations?.length > 0 && (
        <ContentSection title={isEn ? "Implementation Locations" : "Uygulama Yerleri"} accent={accent}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {project.locations.map((l) => (
              <span key={l} style={{ background: `${accent}12`, color: accent, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                {l}
              </span>
            ))}
          </div>
        </ContentSection>
      )}
      {website.showConsortium && project.ownerSubscriberName && (
        <ContentSection title={isEn ? "Project Consortium" : "Proje Konsorsiyumu"} accent={accent}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span style={{ background: accent, color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
              🏆 {project.ownerSubscriberName}
            </span>
            {project.consortiumMembers?.map((m) => (
              <span key={m.subscriberId} style={{ background: `${accent}18`, color: accent, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
                {m.subscriberName}
              </span>
            ))}
          </div>
        </ContentSection>
      )}
    </>
  );
}

// ─── 4 Template ──────────────────────────────────────────────

/** Template 1: Minimal */
export function TemplateMinimal({ website, project, sector, donor, resolvedLogos, locale }: TemplateProps) {
  const accent = website.accentColor ?? "#003399";
  const h = locale === "tr" ? website.headerTr : website.headerEn;
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fafafa", minHeight: "100vh" }}>
      <WebsiteNav website={website} accent={accent} locale={locale} />
      {website.heroBanner?.enabled ? (
        <HeroBanner website={website} accent={accent} locale={locale} />
      ) : (
        <WebsiteHeader {...h} version={website.headerVersion} accentColor={accent} />
      )}
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
        <CommonContent website={website} project={project} sector={sector} donor={donor} locale={locale} accent={accent} />
      </main>
      <WebsiteFooter logos={resolvedLogos} accentColor={accent} project={project} />
    </div>
  );
}

/** Template 2: Bold */
export function TemplateBold({ website, project, sector, donor, resolvedLogos, locale }: TemplateProps) {
  const accent = website.accentColor ?? "#003399";
  const h = locale === "tr" ? website.headerTr : website.headerEn;
  const isEn = locale === "en";
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#111827", minHeight: "100vh", color: "#f9fafb" }}>
      <WebsiteNav website={website} accent={accent} locale={locale} />
      {website.heroBanner?.enabled ? (
        <HeroBanner website={website} accent={accent} locale={locale} />
      ) : (
        <div style={{ background: "#fff" }}>
          <WebsiteHeader {...h} version={website.headerVersion} accentColor={accent} />
        </div>
      )}
      <div style={{ background: accent, padding: "24px 0" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ color: "#FFCC00", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            {h.tagline ?? "EU-Funded Project"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 }}>
            {isEn ? (donor?.nameEn ?? donor?.name) : donor?.name} · {project.ipaPeriod}
            {project.euBudget && ` · €${(project.euBudget/1e6).toFixed(0)}M`}
          </div>
        </div>
      </div>
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px" }}>
        {website.showObjective && project.objective && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: "#FFCC00", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 10 }}>
              {isEn ? "Project Objective" : "Proje Amacı"}
            </h2>
            <p style={{ color: "#d1d5db", fontSize: 15, lineHeight: 1.75 }}>{project.objective}</p>
          </div>
        )}
        {website.showOutputs && project.expectedOutputs && (
          <div style={{ marginBottom: 32, padding: 20, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}>
            <h2 style={{ color: "#FFCC00", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 10 }}>
              {isEn ? "Key Outputs" : "Temel Çıktılar"}
            </h2>
            <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7 }}>{project.expectedOutputs}</p>
          </div>
        )}
        {website.showLocations && project.locations?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {project.locations.map((l) => (
              <span key={l} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#e5e7eb" }}>
                📍 {l}
              </span>
            ))}
          </div>
        )}
      </main>
      <div style={{ background: "#fff" }}>
        <WebsiteFooter logos={resolvedLogos} accentColor={accent} project={project} />
      </div>
    </div>
  );
}

/** Template 3: Academic */
export function TemplateAcademic({ website, project, sector, donor, resolvedLogos, locale }: TemplateProps) {
  const accent = website.accentColor ?? "#003399";
  const h = locale === "tr" ? website.headerTr : website.headerEn;
  const isEn = locale === "en";
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", minHeight: "100vh" }}>
      <WebsiteNav website={website} accent={accent} locale={locale} />
      {website.heroBanner?.enabled ? (
        <HeroBanner website={website} accent={accent} locale={locale} />
      ) : (
        <WebsiteHeader {...h} version={website.headerVersion} accentColor={accent} />
      )}
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "40px 24px", display: "flex", gap: 40, alignItems: "flex-start" }}>
        <aside style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#6b7280", marginBottom: 16 }}>
              {isEn ? "Project Details" : "Proje Bilgileri"}
            </div>
            {[
              donor && [isEn ? "Donor" : "Donör", isEn ? (donor.nameEn ?? donor.name) : donor.name],
              project.beneficiary && [isEn ? "Beneficiary" : "Faydalanıcı", project.beneficiary],
              project.euBudget && [isEn ? "EU Budget" : "AB Katkısı", `€${(project.euBudget/1e6).toFixed(1)}M`],
              project.priorityArea && [isEn ? "Priority" : "Öncelik", project.priorityArea],
              project.ipaPeriod && ["IPA", project.ipaPeriod],
            ].filter(Boolean).map((item) => {
              const [label, value] = item as [string, string];
              return (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#374151", fontWeight: 500, lineHeight: 1.4 }}>{value}</div>
                </div>
              );
            })}
          </div>
        </aside>
        <main style={{ flex: 1 }}>
          {website.showObjective && project.objective && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: 10 }}>
                {isEn ? "Overall Objective" : "Genel Hedef"}
              </h2>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.8 }}>{project.objective}</p>
            </section>
          )}
          {website.showOutputs && project.expectedOutputs && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: 10 }}>
                {isEn ? "Expected Results" : "Beklenen Sonuçlar"}
              </h2>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.8 }}>{project.expectedOutputs}</p>
            </section>
          )}
          {website.showLocations && project.locations?.length > 0 && (
            <section>
              <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: 10 }}>
                {isEn ? "Implementation Locations" : "Uygulama Yerleri"}
              </h2>
              <p style={{ fontSize: 14, color: "#374151" }}>{project.locations.join(" · ")}</p>
            </section>
          )}
        </main>
      </div>
      <WebsiteFooter logos={resolvedLogos} accentColor={accent} project={project} />
    </div>
  );
}

/** Template 4: Impact */
export function TemplateImpact({ website, project, sector, donor, resolvedLogos, locale }: TemplateProps) {
  const accent = website.accentColor ?? "#003399";
  const h = locale === "tr" ? website.headerTr : website.headerEn;
  const isEn = locale === "en";
  const stats = [
    project.euBudget && { value: `€${(project.euBudget/1e6).toFixed(0)}M`, label: isEn ? "EU Contribution" : "AB Katkısı" },
    project.totalBudget && project.totalBudget !== project.euBudget && { value: `€${(project.totalBudget/1e6).toFixed(0)}M`, label: isEn ? "Total Budget" : "Toplam Bütçe" },
    project.locations?.length && { value: String(project.locations.length), label: isEn ? (project.locations.length > 1 ? "Provinces" : "Province") : "İl" },
  ].filter(Boolean) as { value: string; label: string }[];
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", minHeight: "100vh" }}>
      <WebsiteNav website={website} accent={accent} locale={locale} />
      {website.heroBanner?.enabled ? (
        <HeroBanner website={website} accent={accent} locale={locale} />
      ) : (
        <WebsiteHeader {...h} version={website.headerVersion} accentColor={accent} />
      )}
      {stats.length > 0 && (
        <div style={{ background: accent, padding: "28px 24px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#FFCC00", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px" }}>
        <CommonContent website={website} project={project} sector={sector} donor={donor} locale={locale} accent={accent} />
      </main>
      <WebsiteFooter logos={resolvedLogos} accentColor={accent} project={project} />
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
  { id: "minimal" as const, label: "Minimal", labelEn: "Minimal", desc: "Sade beyaz, geniş boşluk, tipografi odaklı", descEn: "Clean white, generous spacing, typography-focused", icon: "⬜", preview: { bg: "#fafafa", accent: "#003399", style: "light" } },
  { id: "bold" as const, label: "Bold", labelEn: "Bold", desc: "Koyu arka plan, yüksek kontrast, güçlü izlenim", descEn: "Dark background, high contrast, strong impact", icon: "◼", preview: { bg: "#111827", accent: "#003399", style: "dark" } },
  { id: "academic" as const, label: "Academic", labelEn: "Academic", desc: "İki kolon, meta sidebar, rapor formatı", descEn: "Two-column layout, sidebar meta, report style", icon: "📄", preview: { bg: "#fff", accent: "#003399", style: "sidebar" } },
  { id: "impact" as const, label: "Impact", labelEn: "Impact", desc: "Büyük rakamlar, bütçe highlight, görsel ağırlıklı", descEn: "Large stats, budget highlight, visually driven", icon: "🎯", preview: { bg: "#fff", accent: "#003399", style: "stats" } },
];
