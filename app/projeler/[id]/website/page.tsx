"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import { LOGO_LIBRARY, LOGO_CATEGORIES, getLibraryLogo } from "@/lib/website/logo-library";
import { renderTemplate, TEMPLATE_META, WebsiteHeader, WebsiteFooter } from "@/lib/website/templates";
import type { Project, Sector, Donor, ProjectWebsite, WebsiteFooterLogo, WebsiteHeaderVersion, WebsiteTemplateId } from "@/lib/types";

// ─── Slug yardımcısı ─────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ─── Header önizleme kartı ────────────────────────────────────
function HeaderPreviewCard({ version, selected, onClick }: { version: WebsiteHeaderVersion; selected: boolean; onClick: () => void }) {
  const labels = ["V1 — Logo Sol, Metin Orta", "V2 — İki Kolon + Dikey Logo", "V3 — Üst Şerit + Yatay"];
  return (
    <button onClick={onClick}
      className={`border-2 rounded-xl overflow-hidden transition-all text-left ${selected ? "border-eu shadow-md" : "border-line hover:border-eu/40"}`}>
      <div className="p-2 bg-surface text-center">
        <span className="text-xs font-semibold text-mist">{labels[version - 1]}</span>
      </div>
      {/* Mini header önizleme */}
      <div style={{ height: 70, background: "#fff", borderBottom: "2px solid #003399", position: "relative", display: "flex", alignItems: "center", padding: "0 12px", gap: 8 }}>
        {version === 1 && (
          <>
            <div style={{ width: 24, height: 16, background: "#e5e7eb", borderRadius: 3, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 4, background: "#1a1a2e", borderRadius: 2, width: "70%", marginBottom: 4 }} />
              <div style={{ height: 3, background: "#9ca3af", borderRadius: 2, width: "50%" }} />
            </div>
            <svg viewBox="0 0 20 20" width={20} height={20}>
              {Array.from({length:12},(_,i)=>{const a=(i*30-90)*Math.PI/180;const cx=10+7*Math.cos(a),cy=10+7*Math.sin(a);return <circle key={i} cx={cx} cy={cy} r={1.2} fill="#FFCC00"/>;}) }
            </svg>
          </>
        )}
        {version === 2 && (
          <div style={{ display: "flex", width: "100%", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ height: 3, background: "#6366f1", borderRadius: 2, width: "40%", marginBottom: 3 }} />
              <div style={{ height: 5, background: "#1a1a2e", borderRadius: 2, width: "80%", marginBottom: 3 }} />
              <div style={{ height: 2.5, background: "#9ca3af", borderRadius: 2, width: "60%" }} />
            </div>
            <div style={{ width: 28, borderLeft: "1px solid #e5e7eb", paddingLeft: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ width: 20, height: 14, background: "#003399", borderRadius: 2 }} />
              <div style={{ height: 2, background: "#9ca3af", borderRadius: 1, width: "100%" }} />
            </div>
          </div>
        )}
        {version === 3 && (
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <div style={{ height: 4, background: "#003399", borderRadius: "2px 2px 0 0" }} />
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <div style={{ width: 20, height: 14, background: "#e5e7eb", borderRadius: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 4, background: "#1a1a2e", borderRadius: 2, width: "65%", marginBottom: 3 }} />
                <div style={{ height: 2.5, background: "#9ca3af", borderRadius: 2, width: "45%" }} />
              </div>
              <div style={{ width: 24, height: 10, background: "#003399", borderRadius: 2, opacity: 0.3 }} />
            </div>
          </div>
        )}
        {selected && <div style={{ position: "absolute", top: 4, right: 4, background: "#003399", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 8, lineHeight: 1 }}>✓</span>
        </div>}
      </div>
    </button>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────
export default function WebsiteBuilderPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { locale } = useLocale();
  const { current: firma } = useFirma();
  const db = getDataProvider();
  const isEn = locale === "en";

  const [project, setProject] = useState<Project | null>(null);
  const [sector, setSector] = useState<Sector | null>(null);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [website, setWebsite] = useState<ProjectWebsite | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<"template" | "header" | "footer" | "settings" | "preview">("template");
  const [slugError, setSlugError] = useState("");
  const [slugOk, setSlugOk] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<"tr" | "en">("tr");
  const [showLogoLibrary, setShowLogoLibrary] = useState(false);
  const [logoCategory, setLogoCategory] = useState("ab");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [proj, existing] = await Promise.all([
      db.getProject(projectId),
      db.getProjectWebsite(projectId),
    ]);
    setProject(proj);
    if (proj) {
      const [sec, don] = await Promise.all([
        db.getSector(proj.sectorId),
        db.getDonor(proj.donorId),
      ]);
      setSector(sec);
      setDonor(don);
    }
    if (existing) {
      setWebsite(existing);
    } else if (proj) {
      // Yeni site oluştur
      const defaultSlug = slugify(proj.title);
      setWebsite({
        id: `pw-${Date.now()}`,
        projectId,
        ownerSubscriberId: firma?.id ?? "",
        slug: defaultSlug,
        templateId: "minimal",
        headerVersion: 1,
        headerTr: {
          title: proj.title,
          subtitle: proj.summary.slice(0, 100),
          tagline: "AB Destekli Proje",
        },
        headerEn: {
          title: proj.title,
          subtitle: proj.summary.slice(0, 100),
          tagline: "EU-Funded Project",
        },
        footerLogos: [
          { id: "fl-eu", source: "library", libraryKey: "eu", label: "Avrupa Birliği", order: 1 },
        ],
        published: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        showObjective: true,
        showOutputs: true,
        showLocations: true,
        showBudget: true,
        showConsortium: false,
      });
    }
    setLoading(false);
  }, [projectId, firma, db]);

  useEffect(() => { load(); }, [load]);

  const set = (patch: Partial<ProjectWebsite>) => setWebsite((w) => w ? { ...w, ...patch } : w);

  const checkSlug = async (slug: string) => {
    if (!slug || slug.length < 3) { setSlugError("En az 3 karakter"); setSlugOk(false); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { setSlugError("Sadece küçük harf, rakam ve tire"); setSlugOk(false); return; }
    const ok = await db.isSlugAvailable(slug, projectId);
    if (ok) { setSlugError(""); setSlugOk(true); }
    else { setSlugError("Bu kısa ad kullanımda"); setSlugOk(false); }
  };

  const handleSave = async () => {
    if (!website) return;
    setSaving(true);
    await db.saveProjectWebsite({ ...website, updatedAt: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Footer logoları için çözümlenmiş veri
  const resolvedLogos = (website?.footerLogos ?? []).map((fl) => ({
    id: fl.id,
    imageUrl: fl.source === "custom" ? fl.imageUrl : getLibraryLogo(fl.libraryKey ?? "")?.svgOrUrl,
    label: fl.label,
    libraryLogo: fl.libraryKey ? getLibraryLogo(fl.libraryKey) : undefined,
  }));

  if (loading) {
    return <PageShell><div className="flex items-center justify-center min-h-64"><div className="text-slate">Yükleniyor…</div></div></PageShell>;
  }

  if (!project || !website) {
    return <PageShell><div className="max-w-3xl mx-auto px-6 py-16 text-center"><p className="text-slate">Proje bulunamadı.</p></div></PageShell>;
  }

  const isOwner = firma?.id === project.ownerSubscriberId || firma?.isAdmin2;
  if (!isOwner) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="text-slate mb-4">Bu proje web sitesini sadece proje yürütücüsü düzenleyebilir.</p>
          <Link href={`/projeler/${projectId}`} className="text-eu font-semibold hover:underline">← Projeye Dön</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-surface">
        {/* Top bar */}
        <div className="bg-white border-b border-line px-6 py-3 flex items-center gap-4">
          <Link href={`/projeler/${projectId}`} className="text-sm text-slate hover:text-ink flex items-center gap-1">
            <span>←</span> {isEn ? "Back to Project" : "Projeye Dön"}
          </Link>
          <div className="flex-1" />
          <div className="text-sm text-mist">
            {isEn ? "Public URL:" : "Yayın URL'i:"}{" "}
            <span className="font-mono text-ink bg-surface px-2 py-0.5 rounded">
              euinturkiye.com/p/{website.slug}
            </span>
          </div>
          <button
            onClick={() => set({ published: !website.published })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${website.published ? "bg-green-100 text-green-700" : "bg-surface text-slate border border-line"}`}>
            {website.published ? "✓ Yayında" : "Taslak"}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-1.5 bg-eu text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-60">
            {saving ? "Kaydediliyor…" : saved ? "✓ Kaydedildi" : "Kaydet"}
          </button>
        </div>

        <div className="flex h-[calc(100vh-110px)]">
          {/* Sol panel — editor */}
          <div className="w-80 bg-white border-r border-line flex flex-col overflow-hidden">
            {/* Tab nav */}
            <div className="flex border-b border-line">
              {(["template", "header", "footer", "settings"] as const).map((t) => {
                const labels = { template: "Şablon", header: "Başlık", footer: "Footer", settings: "Ayarlar" };
                return (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === t ? "text-eu border-b-2 border-eu" : "text-slate hover:text-ink"}`}>
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">

              {/* ── ŞABLON SEÇİMİ ── */}
              {activeTab === "template" && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-mist uppercase tracking-wide">Site Şablonu</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATE_META.map((tm) => (
                      <button key={tm.id} onClick={() => set({ templateId: tm.id })}
                        className={`border-2 rounded-xl p-3 text-left transition-all ${website.templateId === tm.id ? "border-eu bg-eu-pale" : "border-line hover:border-eu/40"}`}>
                        <div className="text-xl mb-1">{tm.icon}</div>
                        <div className="text-xs font-bold text-ink">{tm.label}</div>
                        <div className="text-xs text-mist leading-tight mt-0.5">{tm.desc}</div>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mist mb-1.5">Vurgu Rengi</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={website.accentColor ?? "#003399"} onChange={(e) => set({ accentColor: e.target.value })}
                        className="w-10 h-8 rounded cursor-pointer border border-line" />
                      <input value={website.accentColor ?? "#003399"} onChange={(e) => set({ accentColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-line rounded-lg text-xs font-mono focus:outline-none focus:border-eu" />
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {["#003399","#1D7A5F","#B45309","#7C3AED","#111827","#C2410C"].map((c) => (
                        <button key={c} onClick={() => set({ accentColor: c })}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${website.accentColor === c ? "border-ink scale-110" : "border-transparent"}`}
                          style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── HEADER ── */}
              {activeTab === "header" && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-mist uppercase tracking-wide">Header Versiyonu</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([1,2,3] as WebsiteHeaderVersion[]).map((v) => (
                      <HeaderPreviewCard key={v} version={v} selected={website.headerVersion === v}
                        onClick={() => set({ headerVersion: v })} />
                    ))}
                  </div>

                  {/* TR/EN çift form */}
                  {(["tr", "en"] as const).map((lang) => {
                    const key = lang === "tr" ? "headerTr" : "headerEn";
                    const val = website[key];
                    return (
                      <div key={lang} className="border border-line rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-white bg-eu px-2 py-0.5 rounded-full uppercase">{lang}</span>
                          <span className="text-xs text-mist">{lang === "tr" ? "Türkçe" : "İngilizce"}</span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-mist mb-1">Başlık *</label>
                          <input value={val.title} onChange={(e) => set({ [key]: { ...val, title: e.target.value } })}
                            className="w-full px-2.5 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-mist mb-1">Alt Başlık</label>
                          <textarea value={val.subtitle ?? ""} onChange={(e) => set({ [key]: { ...val, subtitle: e.target.value } })}
                            rows={2} className="w-full px-2.5 py-1.5 border border-line rounded-lg text-xs resize-none focus:outline-none focus:border-eu" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-mist mb-1">Slogan / Tagline</label>
                          <input value={val.tagline ?? ""} onChange={(e) => set({ [key]: { ...val, tagline: e.target.value } })}
                            className="w-full px-2.5 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── FOOTER ── */}
              {activeTab === "footer" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-mist uppercase tracking-wide">Footer Logoları</p>
                    <button onClick={() => setShowLogoLibrary(true)}
                      className="text-xs text-eu font-semibold hover:underline">+ Kütüphaneden Ekle</button>
                  </div>

                  {/* Mevcut logolar */}
                  {website.footerLogos.length === 0 ? (
                    <div className="bg-surface rounded-lg p-6 text-center text-xs text-mist">
                      Henüz logo eklenmedi. Kütüphaneden seçin veya yükleyin.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[...website.footerLogos].sort((a,b) => a.order-b.order).map((fl, idx) => {
                        const lib = fl.libraryKey ? getLibraryLogo(fl.libraryKey) : undefined;
                        return (
                          <div key={fl.id} className="flex items-center gap-2 bg-surface rounded-lg p-2">
                            <div className="w-12 h-8 flex items-center justify-center bg-white rounded border border-line flex-shrink-0">
                              {(fl.imageUrl ?? lib?.svgOrUrl) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={fl.imageUrl ?? lib?.svgOrUrl} alt="" className="max-w-full max-h-full object-contain" />
                              ) : (
                                <span className="text-xs text-mist">?</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-ink truncate">{fl.label ?? lib?.label ?? "Logo"}</p>
                              <p className="text-xs text-mist">{fl.source === "library" ? "Kütüphane" : "Yüklendi"}</p>
                            </div>
                            <div className="flex gap-1">
                              <button disabled={idx === 0}
                                onClick={() => {
                                  const logs = [...website.footerLogos].sort((a,b)=>a.order-b.order);
                                  const prev = logs[idx-1];
                                  const cur = logs[idx];
                                  [prev.order, cur.order] = [cur.order, prev.order];
                                  set({ footerLogos: [...logs] });
                                }}
                                className="w-6 h-6 text-xs text-slate border border-line rounded disabled:opacity-30">←</button>
                              <button disabled={idx === website.footerLogos.length-1}
                                onClick={() => {
                                  const logs = [...website.footerLogos].sort((a,b)=>a.order-b.order);
                                  const next = logs[idx+1];
                                  const cur = logs[idx];
                                  [next.order, cur.order] = [cur.order, next.order];
                                  set({ footerLogos: [...logs] });
                                }}
                                className="w-6 h-6 text-xs text-slate border border-line rounded disabled:opacity-30">→</button>
                              <button onClick={() => set({ footerLogos: website.footerLogos.filter((x) => x.id !== fl.id) })}
                                className="w-6 h-6 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50">✕</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Kendi logosu yükleme */}
                  <div className="border-2 border-dashed border-line rounded-xl p-4 text-center">
                    <p className="text-xs text-mist mb-2">Kendi logonuzu yükleyin</p>
                    <label className="cursor-pointer">
                      <span className="text-xs text-eu font-semibold hover:underline">Dosya Seç (PNG/SVG)</span>
                      <input type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const url = ev.target?.result as string;
                            const newLogo: WebsiteFooterLogo = {
                              id: `fl-custom-${Date.now()}`,
                              source: "custom",
                              imageUrl: url,
                              label: file.name.replace(/\.[^.]+$/, ""),
                              order: (website.footerLogos.length + 1),
                            };
                            set({ footerLogos: [...website.footerLogos, newLogo] });
                          };
                          reader.readAsDataURL(file);
                        }} />
                    </label>
                  </div>
                </div>
              )}

              {/* ── AYARLAR ── */}
              {activeTab === "settings" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-mist uppercase tracking-wide mb-2">Kısa URL (Slug)</label>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-mist">euinturkiye.com/p/</span>
                    </div>
                    <div className="flex gap-2">
                      <input value={website.slug}
                        onChange={(e) => { set({ slug: e.target.value }); setSlugOk(false); setSlugError(""); }}
                        className={`flex-1 px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none ${slugError ? "border-red-400" : slugOk ? "border-green-500" : "border-line focus:border-eu"}`} />
                      <button onClick={() => checkSlug(website.slug)}
                        className="px-3 py-2 text-xs border border-line rounded-lg hover:bg-surface text-slate">Kontrol</button>
                    </div>
                    {slugError && <p className="text-xs text-red-500 mt-1">{slugError}</p>}
                    {slugOk && <p className="text-xs text-green-600 mt-1">✓ Kullanılabilir</p>}
                    <button onClick={() => { const s = slugify(project.title); set({ slug: s }); setSlugOk(false); }}
                      className="mt-1 text-xs text-eu hover:underline">Projeden otomatik üret</button>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-mist uppercase tracking-wide mb-3">İçerik Blokları</p>
                    {[
                      { key: "showObjective", label: "Proje Amacı" },
                      { key: "showOutputs", label: "Beklenen Çıktılar" },
                      { key: "showLocations", label: "Uygulama Yerleri" },
                      { key: "showBudget", label: "Bütçe Bilgisi" },
                      { key: "showConsortium", label: "Konsorsiyum Bilgisi" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 py-2 cursor-pointer border-b border-line last:border-0">
                        <div
                          onClick={() => set({ [key]: !website[key as keyof ProjectWebsite] })}
                          className={`w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${website[key as keyof ProjectWebsite] ? "bg-eu" : "bg-line"}`}>
                          <div className={`w-3.5 h-3.5 bg-white rounded-full mt-0.5 transition-transform shadow-sm ${website[key as keyof ProjectWebsite] ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                        <span className="text-sm text-slate">{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-line">
                    {website.published && (
                      <Link href={`/p/${website.slug}`} target="_blank"
                        className="flex items-center gap-2 text-sm text-eu font-semibold hover:underline">
                        🔗 Yayındaki siteyi aç
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sağ — Önizleme */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Önizleme toolbar */}
            <div className="bg-white border-b border-line px-4 py-2 flex items-center gap-3">
              <button onClick={() => setActiveTab("preview")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${activeTab === "preview" ? "bg-eu text-white" : "text-slate hover:bg-surface"}`}>
                Önizleme
              </button>
              <div className="flex gap-1 ml-auto">
                <button onClick={() => setPreviewLocale("tr")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${previewLocale === "tr" ? "bg-eu text-white" : "text-slate border border-line"}`}>TR</button>
                <button onClick={() => setPreviewLocale("en")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${previewLocale === "en" ? "bg-eu text-white" : "text-slate border border-line"}`}>EN</button>
              </div>
            </div>
            {/* Önizleme alanı — scroll ile izole */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <div className="bg-white rounded-lg shadow-md overflow-hidden min-h-full"
                style={{ minWidth: 640, maxWidth: 1200, margin: "0 auto" }}>
                {renderTemplate({
                  website,
                  project,
                  sector,
                  donor,
                  resolvedLogos,
                  locale: previewLocale,
                  preview: true,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo kütüphanesi modal */}
      {showLogoLibrary && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoLibrary(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <h3 className="font-bold text-ink">Logo Kütüphanesi</h3>
              <button onClick={() => setShowLogoLibrary(false)} className="text-mist hover:text-ink text-lg leading-none">×</button>
            </div>
            {/* Kategori filtresi */}
            <div className="px-5 py-3 border-b border-line flex gap-2 overflow-x-auto">
              {LOGO_CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setLogoCategory(cat.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${logoCategory === cat.id ? "bg-eu text-white" : "bg-surface text-slate"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
              {LOGO_LIBRARY.filter((l) => l.category === logoCategory).map((lib) => {
                const alreadyAdded = website.footerLogos.some((fl) => fl.libraryKey === lib.key);
                return (
                  <button key={lib.key} disabled={alreadyAdded}
                    onClick={() => {
                      const newLogo: WebsiteFooterLogo = {
                        id: `fl-${lib.key}-${Date.now()}`,
                        source: "library",
                        libraryKey: lib.key,
                        label: lib.label,
                        order: website.footerLogos.length + 1,
                      };
                      set({ footerLogos: [...website.footerLogos, newLogo] });
                      setShowLogoLibrary(false);
                    }}
                    className={`border-2 rounded-xl p-3 flex flex-col items-center gap-2 text-center transition-all ${alreadyAdded ? "border-line opacity-40 cursor-not-allowed" : "border-line hover:border-eu"}`}>
                    <div className="w-16 h-10 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={lib.svgOrUrl} alt={lib.label} className="max-w-full max-h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <span className="text-xs text-slate leading-tight">{lib.label}</span>
                    {alreadyAdded && <span className="text-xs text-green-600 font-semibold">✓ Eklendi</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
