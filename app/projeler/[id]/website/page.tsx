"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import { LOGO_LIBRARY, LOGO_CATEGORIES, getLibraryLogo, getLogoUrlForLocale } from "@/lib/website/logo-library";
import { renderTemplate, TEMPLATE_META } from "@/lib/website/templates";
import type {
  Project, Sector, Donor, ProjectWebsite,
  WebsiteFooterLogo, WebsiteHeaderVersion, WebsiteTemplateId,
} from "@/lib/types";

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s")
    .replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60);
}

// ─── İçerik Blokları + Menü Öğeleri — tek kaynak ─────────────
const CONTENT_BLOCKS = [
  { key: "showObjective",  label: "Proje Amacı",          labelEn: "Project Objective",     anchor: "proje-amaci" },
  { key: "showOutputs",    label: "Beklenen Çıktılar",     labelEn: "Expected Outputs",      anchor: "ciktilar" },
  { key: "showLocations",  label: "Uygulama Yerleri",      labelEn: "Locations",             anchor: "uygulama-yerleri" },
  { key: "showBudget",     label: "Bütçe Bilgisi",         labelEn: "Budget",                anchor: "butce" },
  { key: "showConsortium", label: "Konsorsiyum",           labelEn: "Consortium",            anchor: "konsorsiyum" },
  { key: "showTeam",       label: "Ekip",                  labelEn: "Team",                  anchor: "ekip" },
  { key: "showDocuments",  label: "Paylaşılan Belgeler",   labelEn: "Documents",             anchor: "belgeler" },
  { key: "showNews",       label: "Haberler",              labelEn: "News",                  anchor: "haberler" },
  { key: "showEvents",     label: "Etkinlikler",           labelEn: "Events",                anchor: "etkinlikler" },
  { key: "showContact",    label: "İletişim & Sosyal",     labelEn: "Contact & Social",      anchor: "iletisim" },
] as const;

// ─── Toggle bileşeni ─────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} type="button"
      className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-eu" : "bg-gray-200"}`}
      style={{ position: "relative" }}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

// ─── Şablon mini önizleme ─────────────────────────────────────
function TemplateMini({ tm, selected, accent }: { tm: typeof TEMPLATE_META[number]; selected: boolean; accent: string }) {
  return (
    <button onClick={() => {}} type="button"
      className={`border-2 rounded-xl overflow-hidden text-left w-full transition-all ${selected ? "border-eu shadow-md" : "border-line hover:border-eu/30"}`}>
      <div style={{ height: 72, background: tm.preview.style === "dark" ? "#111827" : "#fafafa", position: "relative", overflow: "hidden" }}>
        {/* Şablon bazlı mini görsel */}
        {tm.preview.style === "dark" ? (
          <>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 20, background: accent }} />
            <div style={{ position: "absolute", top: 10, left: 12, right: 12 }}>
              <div style={{ height: 5, background: "rgba(255,255,255,0.35)", borderRadius: 2, width: "70%", marginBottom: 5 }} />
              <div style={{ height: 3, background: "rgba(255,255,255,0.18)", borderRadius: 2, width: "45%" }} />
            </div>
          </>
        ) : tm.preview.style === "sidebar" ? (
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: 40, background: "#f1f5f9", borderRight: "1px solid #e2e8f0", flexShrink: 0 }}>
              {[60, 45, 50, 38].map((w, i) => (
                <div key={i} style={{ height: 3, background: "#cbd5e1", borderRadius: 2, margin: "8px 6px 0", width: `${w}%` }} />
              ))}
            </div>
            <div style={{ flex: 1, padding: "10px 10px 0" }}>
              <div style={{ height: 5, background: "#1e293b", borderRadius: 2, width: "80%", marginBottom: 5 }} />
              <div style={{ height: 3, background: "#94a3b8", borderRadius: 2, width: "60%", marginBottom: 4 }} />
              <div style={{ height: 3, background: "#94a3b8", borderRadius: 2, width: "50%" }} />
            </div>
          </div>
        ) : tm.preview.style === "stats" ? (
          <>
            <div style={{ background: accent, height: 26, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 12px" }}>
              {["€275M", "23 İl", "IPA-II"].map(v => (
                <span key={v} style={{ fontSize: 9, fontWeight: 800, color: "#FFCC00" }}>{v}</span>
              ))}
            </div>
            <div style={{ padding: "8px 12px" }}>
              <div style={{ height: 4, background: "#1e293b", borderRadius: 2, width: "75%", marginBottom: 5 }} />
              <div style={{ height: 3, background: "#94a3b8", borderRadius: 2, width: "50%" }} />
            </div>
          </>
        ) : (
          <div style={{ padding: "10px 12px" }}>
            <div style={{ height: 5, background: "#1e293b", borderRadius: 2, width: "80%", marginBottom: 6 }} />
            <div style={{ height: 3, background: "#94a3b8", borderRadius: 2, width: "55%", marginBottom: 4 }} />
            <div style={{ height: 2, background: "#cbd5e1", borderRadius: 2, width: "40%" }} />
          </div>
        )}
        {selected && (
          <div style={{ position: "absolute", top: 5, right: 5, background: "#003399", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700 }}>✓</div>
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: accent, opacity: selected ? 1 : 0.3 }} />
      </div>
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{tm.label}</div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, lineHeight: 1.3 }}>{tm.desc}</div>
      </div>
    </button>
  );
}

// ─── Bölüm başlığı ───────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-bold text-mist uppercase tracking-widest mb-3">{children}</div>;
}

// ─── Ana sayfa ────────────────────────────────────────────────
export default function WebsiteBuilderPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { locale } = useLocale();
  const { current: firma } = useFirma();
  const db = getDataProvider();

  const [project, setProject] = useState<Project | null>(null);
  const [sector, setSector] = useState<Sector | null>(null);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [website, setWebsite] = useState<ProjectWebsite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [slugOk, setSlugOk] = useState(false);
  const [showLogoLib, setShowLogoLib] = useState(false);
  const [logoCategory, setLogoCategory] = useState("ab");
  const [previewLocale, setPreviewLocale] = useState<"tr" | "en">("tr");
  const [previewMode, setPreviewMode] = useState<"editor" | "live">("editor");
  const [activeSection, setActiveSection] = useState<"template" | "header" | "hero" | "menu" | "footer" | "content" | "settings">("template");

  const load = useCallback(async () => {
    setLoading(true);
    const [proj, existing] = await Promise.all([
      db.getProject(projectId),
      db.getProjectWebsite(projectId),
    ]);
    setProject(proj);
    if (proj) {
      const [sec, don] = await Promise.all([db.getSector(proj.sectorId), db.getDonor(proj.donorId)]);
      setSector(sec); setDonor(don);
    }
    if (existing) {
      setWebsite(existing);
    } else if (proj) {
      const slug = slugify(proj.title);
      setWebsite({
        id: `pw-${Date.now()}`, projectId, ownerSubscriberId: firma?.id ?? "",
        slug, templateId: "minimal", headerVersion: 1,
        headerTr: { title: proj.title, subtitle: proj.summary?.slice(0,100), tagline: "AB Destekli Proje" },
        headerEn: { title: proj.title, subtitle: proj.summary?.slice(0,100), tagline: "EU-Funded Project" },
        footerLogos: [],
        published: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        showObjective: true, showOutputs: true, showLocations: true, showBudget: false,
        showConsortium: false, showTeam: false, showDocuments: false, showNews: false, showEvents: false, showContact: true,
        navMenu: { enabled: false, items: [] },
      });
    }
    setLoading(false);
  }, [projectId, firma, db]);

  useEffect(() => { load(); }, [load]);

  const set = (patch: Partial<ProjectWebsite>) => setWebsite(w => w ? { ...w, ...patch } : w);

  const handleSave = async (publish?: boolean) => {
    if (!website) return;
    setSaving(true);
    const updated = {
      ...website,
      updatedAt: new Date().toISOString(),
      ...(publish !== undefined ? { published: publish } : {}),
    };
    await db.saveProjectWebsite(updated);
    if (publish !== undefined) setWebsite(updated);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Yayına alındıysa canlı önizlemeye geç
    if (publish) setPreviewMode("live");
  };

  const checkSlug = async (slug: string) => {
    if (!slug || slug.length < 3) { setSlugError("En az 3 karakter"); setSlugOk(false); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { setSlugError("Sadece küçük harf, rakam ve tire"); setSlugOk(false); return; }
    const ok = await db.isSlugAvailable(slug, projectId);
    if (ok) { setSlugError(""); setSlugOk(true); } else { setSlugError("Bu kısa ad kullanımda"); setSlugOk(false); }
  };

  const resolvedLogos = (website?.footerLogos ?? []).map(fl => {
    const lib = fl.libraryKey ? getLibraryLogo(fl.libraryKey) : undefined;
    return {
      id: fl.id,
      imageUrl: fl.source === "custom"
        ? fl.imageUrl
        : (lib ? getLogoUrlForLocale(lib, previewLocale) : undefined),
      label: fl.label,
      libraryLogo: lib,
    };
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-slate animate-pulse">Yükleniyor…</div>
    </div>
  );

  if (!project || !website) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <p className="text-slate mb-3">Proje bulunamadı.</p>
        <Link href="/firma?tab=projeler" className="text-eu font-semibold hover:underline">← Panele Dön</Link>
      </div>
    </div>
  );

  const isOwner = firma?.id === project.ownerSubscriberId || firma?.isAdmin2;
  if (!isOwner) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <p className="text-slate">Bu projeye erişim yetkiniz yok.</p>
    </div>
  );

  const accent = website.accentColor ?? "#003399";
  const ACCENT_PRESETS = ["#003399","#1D7A5F","#B45309","#7C3AED","#111827","#C2410C"];

  const NAV_SECTIONS = [
    { id: "template", label: "Şablon" },
    { id: "header",   label: "Başlık" },
    { id: "hero",     label: "Banner" },
    { id: "menu",     label: "Menü" },
    { id: "content",  label: "İçerik" },
    { id: "footer",   label: "Footer" },
    { id: "settings", label: "Ayarlar" },
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f8fafc" }}>

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <Link href={`/projeler/${projectId}`} className="text-sm text-slate hover:text-ink flex items-center gap-1.5 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
          </svg>
          Projeye Dön
        </Link>
        <div className="flex-1 text-sm font-semibold text-ink truncate">{project.title}</div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Yayın durumu göstergesi */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${website.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {website.published ? "✓ Yayında" : "Taslak"}
          </span>
          {/* URL */}
          {website.published && (
            <span className="text-xs text-mist hidden md:block font-mono">euinturkiye.com/p/{website.slug}</span>
          )}
          {/* Taslak kaydet */}
          <button onClick={() => handleSave()} disabled={saving}
            className="px-3 py-1.5 border border-line text-slate rounded-lg text-xs font-semibold hover:bg-surface disabled:opacity-60">
            {saving && !saved ? "…" : saved ? "✓" : "Kaydet"}
          </button>
          {/* Ana akış: Kaydet ve Yayına Al */}
          {!website.published ? (
            <button onClick={() => handleSave(true)} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-eu text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-60">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
              Yayına Al
            </button>
          ) : (
            <a href={`/p/${website.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Canlı Siteyi Aç
            </a>
          )}
        </div>
      </div>

      {/* ── Ana içerik: Sol nav + Editor + Önizleme ──────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sol: Dikey sekme nav */}
        <div style={{ width: 110, background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", padding: "8px 0", flexShrink: 0 }}>
          {NAV_SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{
                padding: "10px 12px", textAlign: "center", fontSize: 11, fontWeight: 600,
                color: activeSection === s.id ? "#003399" : "#64748b",
                background: activeSection === s.id ? "#EEF2FF" : "transparent",
                borderLeft: activeSection === s.id ? "2px solid #003399" : "2px solid transparent",
                cursor: "pointer", border: "none",
              }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Orta: Editor paneli */}
        <div style={{ width: 340, background: "#fff", borderRight: "1px solid #e2e8f0", overflowY: "auto", padding: "20px 16px", flexShrink: 0 }}>

          {/* ── ŞABLON ── */}
          {activeSection === "template" && (
            <div className="space-y-5">
              <SectionTitle>Sayfa Şablonu</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_META.map(tm => (
                  <div key={tm.id} onClick={() => set({ templateId: tm.id as WebsiteTemplateId })}>
                    <TemplateMini tm={tm} selected={website.templateId === tm.id} accent={accent} />
                  </div>
                ))}
              </div>
              <div>
                <SectionTitle>Vurgu Rengi</SectionTitle>
                <div className="flex items-center gap-2 mb-2">
                  <input type="color" value={accent} onChange={e => set({ accentColor: e.target.value })}
                    className="w-9 h-8 rounded cursor-pointer border border-line" />
                  <input value={accent} onChange={e => set({ accentColor: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 border border-line rounded-lg text-xs font-mono focus:outline-none focus:border-eu" />
                </div>
                <div className="flex gap-2">
                  {ACCENT_PRESETS.map(c => (
                    <button key={c} onClick={() => set({ accentColor: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${accent === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BAŞLIK ── */}
          {activeSection === "header" && (
            <div className="space-y-4">
              {/* Header Logosu — ortada, 100px */}
              <SectionTitle>Header Logosu</SectionTitle>
              <p className="text-xs text-mist bg-surface rounded-lg px-3 py-2">
                Sitenin en tepesinde beyaz zeminde, ortada, 100px yükseklikte her zaman görünür. Başlık ve bannerdan bağımsızdır; menü bu logonun altında yer alır. Seçilen logo sitenin diline göre TR/EN varyantıyla görünür.
              </p>
              {/* Kütüphane logoları */}
              <div className="grid grid-cols-2 gap-2">
                {LOGO_LIBRARY.filter(l => l.category === "finansman").map(lib => {
                  const selected = website.headerLogoKey === lib.key && !website.headerLogoCustom;
                  return (
                    <button key={lib.key}
                      onClick={() => set({ headerLogoKey: lib.key, headerLogoCustom: undefined })}
                      className={`border-2 rounded-xl p-2 flex flex-col items-center gap-1.5 transition-all ${selected ? "border-eu bg-eu-pale" : "border-line hover:border-eu/40"}`}>
                      <div className="h-12 flex items-center justify-center w-full">
                        <img src={lib.svgOrUrl} alt={lib.label} className="max-h-full max-w-full object-contain"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                      <span className="text-[9px] text-slate text-center leading-tight">{lib.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Özel logo yükleme */}
              <label className="block border-2 border-dashed border-line rounded-xl p-3 text-center cursor-pointer hover:border-eu transition-colors">
                <span className="text-xs text-eu font-semibold">
                  {website.headerLogoCustom ? "✓ Özel logo yüklendi — değiştir" : "+ Kendi logonu yükle (PNG/SVG)"}
                </span>
                <input type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => set({ headerLogoCustom: ev.target?.result as string, headerLogoKey: undefined });
                  reader.readAsDataURL(file);
                }} />
              </label>
              {(website.headerLogoKey || website.headerLogoCustom) && (
                <button onClick={() => set({ headerLogoKey: undefined, headerLogoCustom: undefined })}
                  className="text-xs text-red-500 hover:underline">Logoyu kaldır</button>
              )}

              <div className="border-t border-line pt-4">
                <SectionTitle>Header Düzeni</SectionTitle>
                <div className="flex gap-2">
                  {([1,2,3] as WebsiteHeaderVersion[]).map(v => (
                    <button key={v} onClick={() => set({ headerVersion: v })}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-all ${website.headerVersion === v ? "border-eu text-eu bg-eu-pale" : "border-line text-slate"}`}>
                      V{v}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-mist mt-2">
                  {website.headerVersion === 1 ? "Logo üstte ortada · alt kenarlık vurgusu" :
                   website.headerVersion === 2 ? "Logo ortada · sol renk şeridi · büyük başlık" :
                   "Üst renk şeridi · logo ortada"}
                </p>
              </div>
              {(["tr","en"] as const).map(lang => {
                const key = lang === "tr" ? "headerTr" : "headerEn";
                const val = website[key];
                return (
                  <div key={lang} className="border border-line rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white bg-eu px-2 py-0.5 rounded-full">{lang.toUpperCase()}</span>
                      <span className="text-[10px] text-mist">{lang === "tr" ? "Türkçe" : "İngilizce"}</span>
                    </div>
                    {[
                      { f: "title", label: "Başlık *", ph: "Proje başlığı" },
                      { f: "subtitle", label: "Alt başlık", ph: "Kısa açıklama" },
                      { f: "tagline", label: "Tagline", ph: "AB Destekli Proje" },
                    ].map(({ f, label, ph }) => (
                      <div key={f}>
                        <label className="block text-[10px] font-semibold text-mist mb-0.5">{label}</label>
                        <input value={(val as Record<string,string>)[f] ?? ""}
                          onChange={e => set({ [key]: { ...val, [f]: e.target.value } })}
                          placeholder={ph}
                          className="w-full px-2 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── BANNER ── */}
          {activeSection === "hero" && (
            <div className="space-y-4">
              <SectionTitle>Hero Banner</SectionTitle>
              <label className="flex items-center gap-2 cursor-pointer">
                <Toggle checked={!!website.heroBanner?.enabled}
                  onChange={() => set({ heroBanner: { ...(website.heroBanner ?? { enabled: false }), enabled: !website.heroBanner?.enabled } })} />
                <span className="text-sm font-semibold text-ink">Banner Aktif</span>
              </label>
              {website.heroBanner?.enabled && (
                <div className="space-y-3">
                  <div>
                    <SectionTitle>Görsel</SectionTitle>
                    <label className="block border-2 border-dashed border-line rounded-xl p-4 text-center cursor-pointer hover:border-eu transition-colors">
                      <span className="text-xs text-eu font-semibold">
                        {website.heroBanner.imageUrl ? "✓ Görsel yüklendi — değiştir" : "JPG veya PNG yükle"}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => set({ heroBanner: { ...website.heroBanner!, enabled: true, imageUrl: ev.target?.result as string } });
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                    {website.heroBanner.imageUrl && (
                      <button onClick={() => set({ heroBanner: { ...website.heroBanner!, imageUrl: undefined } })}
                        className="mt-1 text-xs text-red-500 hover:underline">Görseli kaldır</button>
                    )}
                  </div>
                  <div>
                    <SectionTitle>Yükseklik</SectionTitle>
                    <div className="flex gap-2">
                      {(["sm","md","lg"] as const).map(h => (
                        <button key={h} onClick={() => set({ heroBanner: { ...website.heroBanner!, height: h } })}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border-2 ${(website.heroBanner?.height ?? "md") === h ? "border-eu text-eu bg-eu-pale" : "border-line text-slate"}`}>
                          {h === "sm" ? "Dar" : h === "md" ? "Orta" : "Geniş"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <SectionTitle>Overlay ({Math.round((website.heroBanner.overlayOpacity ?? 0.5)*100)}%)</SectionTitle>
                    <input type="range" min={0} max={90} step={5}
                      value={Math.round((website.heroBanner.overlayOpacity ?? 0.5)*100)}
                      onChange={e => set({ heroBanner: { ...website.heroBanner!, overlayOpacity: Number(e.target.value)/100 } })}
                      className="w-full" />
                  </div>
                  <div>
                    <SectionTitle>CTA Butonu</SectionTitle>
                    <div className="space-y-1.5">
                      <input value={website.heroBanner.ctaLabel ?? ""} onChange={e => set({ heroBanner: { ...website.heroBanner!, ctaLabel: e.target.value } })}
                        placeholder="TR: Daha Fazla Bilgi"
                        className="w-full px-2.5 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                      <input value={website.heroBanner.ctaLabelEn ?? ""} onChange={e => set({ heroBanner: { ...website.heroBanner!, ctaLabelEn: e.target.value } })}
                        placeholder="EN: Learn More"
                        className="w-full px-2.5 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                      <input value={website.heroBanner.ctaUrl ?? ""} onChange={e => set({ heroBanner: { ...website.heroBanner!, ctaUrl: e.target.value } })}
                        placeholder="Link: #proje-amaci veya https://..."
                        className="w-full px-2.5 py-1.5 border border-line rounded-lg text-xs font-mono focus:outline-none focus:border-eu" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MENÜ ── */}
          {activeSection === "menu" && (
            <div className="space-y-4">
              <SectionTitle>Navigasyon Menüsü</SectionTitle>
              <label className="flex items-center gap-2 cursor-pointer">
                <Toggle checked={!!website.navMenu?.enabled}
                  onChange={() => set({ navMenu: { items: website.navMenu?.items ?? [], enabled: !website.navMenu?.enabled } })} />
                <span className="text-sm font-semibold text-ink">Menüyü Göster</span>
              </label>
              {website.navMenu?.enabled && (
                <div className="space-y-3">
                  <p className="text-xs text-mist bg-surface rounded-lg px-3 py-2">
                    Aşağıdaki içerik bloklarından menüye eklemek istediklerinizi seçin:
                  </p>
                  {/* İçerik bloklarından otomatik menü öğeleri */}
                  <div className="space-y-1.5">
                    {CONTENT_BLOCKS.map(block => {
                      const isInMenu = website.navMenu?.items.some(i => i.href === `#${block.anchor}`);
                      const isBlockActive = website[block.key];
                      return (
                        <label key={block.key}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${isInMenu ? "border-eu bg-eu-pale" : "border-line hover:border-eu/40"} ${!isBlockActive ? "opacity-40" : ""}`}>
                          <Toggle checked={!!isInMenu} onChange={() => {
                            if (!isBlockActive) return; // Blok kapalıysa menüye eklenemez
                            const items = website.navMenu?.items ?? [];
                            if (isInMenu) {
                              set({ navMenu: { ...website.navMenu!, items: items.filter(i => i.href !== `#${block.anchor}`) } });
                            } else {
                              set({ navMenu: { ...website.navMenu!, items: [...items, { label: block.label, labelEn: block.labelEn, href: `#${block.anchor}` }] } });
                            }
                          }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-ink">{block.label}</div>
                            <div className="text-[10px] text-mist">{block.labelEn}</div>
                          </div>
                          {!isBlockActive && (
                            <span className="text-[9px] text-mist bg-surface px-1.5 py-0.5 rounded flex-shrink-0">İçerik kapalı</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {/* Özel link ekleme */}
                  <div className="border-t border-line pt-3">
                    <p className="text-[10px] font-semibold text-mist uppercase tracking-wide mb-2">Özel Link Ekle</p>
                    <div className="flex gap-1.5">
                      <input id="custom-menu-label" placeholder="Etiket" className="flex-1 px-2 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                      <input id="custom-menu-href" placeholder="Link" className="flex-1 px-2 py-1.5 border border-line rounded-lg text-xs font-mono focus:outline-none focus:border-eu" />
                      <button onClick={() => {
                        const label = (document.getElementById("custom-menu-label") as HTMLInputElement)?.value;
                        const href = (document.getElementById("custom-menu-href") as HTMLInputElement)?.value;
                        if (!label || !href) return;
                        set({ navMenu: { ...website.navMenu!, items: [...(website.navMenu?.items ?? []), { label, href }] } });
                        (document.getElementById("custom-menu-label") as HTMLInputElement).value = "";
                        (document.getElementById("custom-menu-href") as HTMLInputElement).value = "";
                      }}
                        className="px-2.5 py-1.5 bg-eu text-white rounded-lg text-xs font-bold hover:bg-blue-800">+</button>
                    </div>
                  </div>
                  {/* Mevcut öğeler */}
                  {(website.navMenu?.items ?? []).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-mist uppercase tracking-wide">Menü Sırası</p>
                      {website.navMenu!.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-surface rounded-lg px-2.5 py-1.5">
                          <span className="text-[10px] text-mist w-4 text-center">{idx+1}</span>
                          <span className="flex-1 text-xs font-medium text-ink truncate">{item.label}</span>
                          <span className="text-[10px] font-mono text-mist truncate max-w-20">{item.href}</span>
                          <div className="flex gap-0.5">
                            <button disabled={idx===0} onClick={() => {
                              const items = [...website.navMenu!.items];
                              [items[idx-1], items[idx]] = [items[idx], items[idx-1]];
                              set({ navMenu: { ...website.navMenu!, items } });
                            }} className="w-5 h-5 text-[10px] border border-line rounded disabled:opacity-30">↑</button>
                            <button disabled={idx===website.navMenu!.items.length-1} onClick={() => {
                              const items = [...website.navMenu!.items];
                              [items[idx+1], items[idx]] = [items[idx], items[idx+1]];
                              set({ navMenu: { ...website.navMenu!, items } });
                            }} className="w-5 h-5 text-[10px] border border-line rounded disabled:opacity-30">↓</button>
                            <button onClick={() => set({ navMenu: { ...website.navMenu!, items: website.navMenu!.items.filter((_,i)=>i!==idx) } })}
                              className="w-5 h-5 text-[10px] text-red-400 border border-red-200 rounded hover:bg-red-50">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── İÇERİK BLOKLARI ── */}
          {activeSection === "content" && (
            <div className="space-y-3">
              <SectionTitle>Gösterilecek Bölümler</SectionTitle>
              <p className="text-xs text-mist">Seçilen bölümler sayfada görünür. Menüdeki bir bölümü kapattığınızda menüden de kaldırılır.</p>
              <div className="space-y-1.5">
                {CONTENT_BLOCKS.map(block => {
                  const isOn = !!website[block.key];
                  return (
                    <label key={block.key}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all cursor-pointer ${isOn ? "border-eu/30 bg-eu-pale/50" : "border-line hover:border-eu/30"}`}>
                      <Toggle checked={isOn} onChange={() => {
                        const newVal = !isOn;
                        set({ [block.key]: newVal });
                        // Blok kapanırsa menüden de kaldır
                        if (!newVal && website.navMenu?.items.some(i => i.href === `#${block.anchor}`)) {
                          set({
                            [block.key]: newVal,
                            navMenu: {
                              ...website.navMenu!,
                              items: website.navMenu!.items.filter(i => i.href !== `#${block.anchor}`)
                            }
                          });
                        }
                      }} />
                      <div>
                        <div className="text-sm font-semibold text-ink">{block.label}</div>
                        <div className="text-[10px] text-mist">{block.labelEn}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── FOOTER ── */}
          {activeSection === "footer" && (
            <div className="space-y-4">
              <SectionTitle>Footer Logoları</SectionTitle>
              <div className="flex gap-2">
                <button onClick={() => setShowLogoLib(true)}
                  className="flex-1 py-2 border-2 border-eu/30 text-eu text-xs font-semibold rounded-xl hover:bg-eu-pale">
                  + Kütüphaneden Ekle
                </button>
              </div>
              {website.footerLogos.length === 0 ? (
                <div className="bg-surface rounded-lg p-4 text-center text-xs text-mist">Logo yok</div>
              ) : (
                <div className="space-y-1.5">
                  {[...website.footerLogos].sort((a,b)=>a.order-b.order).map((fl, idx) => {
                    const lib = fl.libraryKey ? getLibraryLogo(fl.libraryKey) : undefined;
                    const src = fl.source === "custom" ? fl.imageUrl : lib?.svgOrUrl;
                    return (
                      <div key={fl.id} className="flex items-center gap-2 bg-surface rounded-lg px-2.5 py-2">
                        <div className="w-12 h-7 flex items-center justify-center bg-white rounded border border-line flex-shrink-0">
                          {src && <img src={src} alt="" className="max-w-full max-h-full object-contain" />}
                        </div>
                        <span className="flex-1 text-xs font-semibold text-ink truncate">{fl.label ?? lib?.label}</span>
                        <div className="flex gap-1">
                          <button disabled={idx===0} onClick={() => {
                            const logs = [...website.footerLogos].sort((a,b)=>a.order-b.order);
                            [logs[idx-1].order, logs[idx].order] = [logs[idx].order, logs[idx-1].order];
                            set({ footerLogos: [...logs] });
                          }} className="w-5 h-5 text-[10px] border border-line rounded disabled:opacity-30">←</button>
                          <button disabled={idx===website.footerLogos.length-1} onClick={() => {
                            const logs = [...website.footerLogos].sort((a,b)=>a.order-b.order);
                            [logs[idx+1].order, logs[idx].order] = [logs[idx].order, logs[idx+1].order];
                            set({ footerLogos: [...logs] });
                          }} className="w-5 h-5 text-[10px] border border-line rounded disabled:opacity-30">→</button>
                          <button onClick={() => set({ footerLogos: website.footerLogos.filter(x=>x.id!==fl.id) })}
                            className="w-5 h-5 text-[10px] text-red-400 border border-red-200 rounded hover:bg-red-50">✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <label className="block border-2 border-dashed border-line rounded-xl p-3 text-center cursor-pointer hover:border-eu transition-colors">
                <span className="text-xs text-eu font-semibold">+ Kendi logonu yükle (PNG/SVG)</span>
                <input type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => {
                    const url = ev.target?.result as string;
                    set({ footerLogos: [...website.footerLogos, { id: `fl-c-${Date.now()}`, source: "custom", imageUrl: url, label: file.name.replace(/\.[^.]+$/,""), order: website.footerLogos.length+1 }] });
                  };
                  reader.readAsDataURL(file);
                }} />
              </label>
            </div>
          )}

          {/* ── AYARLAR ── */}
          {activeSection === "settings" && (
            <div className="space-y-5">
              <div>
                <SectionTitle>Kısa URL (Slug)</SectionTitle>
                <p className="text-[10px] text-mist mb-1.5">euinturkiye.com/p/<strong className="text-ink font-mono">{website.slug}</strong></p>
                <div className="flex gap-2">
                  <input value={website.slug} onChange={e => { set({ slug: e.target.value }); setSlugOk(false); setSlugError(""); }}
                    className={`flex-1 px-2.5 py-1.5 border rounded-lg text-xs font-mono focus:outline-none ${slugError ? "border-red-400" : slugOk ? "border-green-500" : "border-line focus:border-eu"}`} />
                  <button onClick={() => checkSlug(website.slug)} className="px-2.5 py-1.5 text-xs border border-line rounded-lg hover:bg-surface">Kontrol</button>
                </div>
                {slugError && <p className="text-[10px] text-red-500 mt-1">{slugError}</p>}
                {slugOk && <p className="text-[10px] text-green-600 mt-1">✓ Kullanılabilir</p>}
                <button onClick={() => { set({ slug: slugify(project.title) }); setSlugOk(false); }}
                  className="mt-1 text-[10px] text-eu hover:underline">Projeden otomatik üret</button>
              </div>
              <div>
                <SectionTitle>Yayın Durumu</SectionTitle>
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-line rounded-xl hover:border-eu transition-colors">
                  <Toggle checked={website.published} onChange={() => set({ published: !website.published })} />
                  <div>
                    <div className="text-sm font-semibold text-ink">{website.published ? "Yayında" : "Taslak"}</div>
                    <div className="text-[10px] text-mist">{website.published ? "Herkese açık görünüyor" : "Sadece siz görebilirsiniz"}</div>
                  </div>
                </label>
                {website.published && (
                  <a href={`/p/${website.slug}`} target="_blank" rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1.5 text-xs text-eu font-semibold hover:underline">
                    ↗ Yayındaki siteyi aç
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sağ: Önizleme */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Önizleme toolbar */}
          <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            {/* Mod geçişi */}
            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 2, gap: 2 }}>
              <button onClick={() => setPreviewMode("editor")}
                style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: previewMode === "editor" ? "#fff" : "transparent", color: previewMode === "editor" ? "#003399" : "#64748b", boxShadow: previewMode === "editor" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                Önizleme
              </button>
              <button onClick={() => setPreviewMode("live")}
                style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: previewMode === "live" ? "#fff" : "transparent", color: previewMode === "live" ? "#16a34a" : "#64748b", boxShadow: previewMode === "live" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", display: "flex", alignItems: "center", gap: 4 }}>
                {website.published && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />}
                Canlı Site
              </button>
            </div>
            {/* Dil seçimi — sadece editor modunda */}
            {previewMode === "editor" && (
              <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                <button onClick={() => setPreviewLocale("tr")}
                  style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: previewLocale === "tr" ? "#003399" : "transparent", color: previewLocale === "tr" ? "#fff" : "#64748b", border: `1px solid ${previewLocale === "tr" ? "#003399" : "#e2e8f0"}`, cursor: "pointer" }}>TR</button>
                <button onClick={() => setPreviewLocale("en")}
                  style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: previewLocale === "en" ? "#003399" : "transparent", color: previewLocale === "en" ? "#fff" : "#64748b", border: `1px solid ${previewLocale === "en" ? "#003399" : "#e2e8f0"}`, cursor: "pointer" }}>EN</button>
              </div>
            )}
            {/* Canlı modda URL + yenile */}
            {previewMode === "live" && website.published && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
                  euinturkiye.com/p/{website.slug}
                </span>
                <button onClick={() => {
                  // iframe'i yenile
                  const iframe = document.getElementById("live-preview-iframe") as HTMLIFrameElement;
                  if (iframe) { iframe.src = iframe.src; }
                }}
                  style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, border: "1px solid #e2e8f0", cursor: "pointer", background: "transparent", color: "#64748b" }}>
                  ↻ Yenile
                </button>
              </div>
            )}
          </div>

          {/* Editor önizleme */}
          {previewMode === "editor" && (
            <div style={{ flex: 1, overflow: "auto", background: "#e5e7eb", padding: 16 }}>
              <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", minHeight: 500 }}>
                {renderTemplate({ website, project, sector, donor, resolvedLogos, locale: previewLocale, preview: true })}
              </div>
            </div>
          )}

          {/* Canlı site iframe */}
          {previewMode === "live" && (
            website.published ? (
              <iframe
                id="live-preview-iframe"
                src={`/p/${website.slug}`}
                style={{ flex: 1, border: "none", width: "100%", background: "#fff" }}
                title="Canlı Site Önizlemesi"
              />
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", gap: 16, padding: 32 }}>
                <div style={{ fontSize: 48 }}>🚀</div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 16, marginBottom: 8 }}>Site henüz yayınlanmadı</p>
                  <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20, maxWidth: 340 }}>
                    Sitenizi yayına almak için sağ üstteki <strong>Yayına Al</strong> butonunu kullanın. Yayına aldıktan sonra canlı siteniz burada görünecek.
                  </p>
                  <button onClick={() => handleSave(true)} disabled={saving}
                    style={{ padding: "10px 24px", background: "#003399", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                    🚀 Kaydet ve Yayına Al
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Logo kütüphanesi modal */}
      {showLogoLib && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoLib(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <h3 className="font-bold text-ink">Logo Kütüphanesi</h3>
              <button onClick={() => setShowLogoLib(false)} className="text-mist hover:text-ink text-xl">×</button>
            </div>
            <div className="px-4 py-2.5 border-b border-line flex gap-1.5 overflow-x-auto">
              {LOGO_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setLogoCategory(cat.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${logoCategory === cat.id ? "bg-eu text-white" : "bg-surface text-slate"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
              {LOGO_LIBRARY.filter(l => l.category === logoCategory).map(lib => {
                const already = website.footerLogos.some(fl => fl.libraryKey === lib.key);
                return (
                  <button key={lib.key} disabled={already}
                    onClick={() => {
                      set({ footerLogos: [...website.footerLogos, { id: `fl-${lib.key}-${Date.now()}`, source: "library", libraryKey: lib.key, label: lib.label, order: website.footerLogos.length+1 }] });
                      setShowLogoLib(false);
                    }}
                    className={`border-2 rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${already ? "border-line opacity-40 cursor-not-allowed" : "border-line hover:border-eu"}`}>
                    <div className="w-16 h-10 flex items-center justify-center">
                      <img src={lib.svgOrUrl} alt={lib.label} className="max-w-full max-h-full object-contain"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <span className="text-[9px] text-slate text-center leading-tight">{lib.label}</span>
                    {already && <span className="text-[9px] text-green-600">✓ Eklendi</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
