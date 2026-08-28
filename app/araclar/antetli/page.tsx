"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import { LOGO_LIBRARY, getLibraryLogo, getLogoUrlForLocale } from "@/lib/website/logo-library";
import { SYSTEM_LOGOS, SYSTEM_LOGO_CATEGORIES, resolveLogoSrc } from "@/lib/website/system-logos";
import type { Letterhead, CoverFooterLogo, UserLibraryImage, Subscriber, Project } from "@/lib/types";

const TPL_PORTRAIT = "/cover-templates/antetli-dik.jpg";
const TPL_LANDSCAPE = "/cover-templates/antetli-yatay.jpg";

function newLetterhead(): Letterhead {
  return {
    id: `lh-${Date.now()}`,
    name: "Yeni Antetli",
    updatedAt: new Date().toISOString(),
    orientation: "portrait",
    bandLogoKey: "es-finanse",
    titleTr: "",
    titleEn: "",
    footerLogos: [],
  };
}

function resolveFooterLogoSrc(fl: CoverFooterLogo, userLib: UserLibraryImage[]): string | undefined {
  return resolveLogoSrc(fl, userLib);
}

export default function AntetliPage() {
  const { locale } = useLocale();
  const { current } = useFirma();
  const isEn = locale === "en";
  const db = getDataProvider();

  const [items, setItems] = useState<Letterhead[]>([]);
  const [userLib, setUserLib] = useState<UserLibraryImage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<Letterhead | null>(null);
  const [previewLang, setPreviewLang] = useState<"tr" | "en">("tr");
  const [logoPicker, setLogoPicker] = useState(false);
  const [logoPickerTab, setLogoPickerTab] = useState<"system" | "user">("system");
  const [systemCat, setSystemCat] = useState<string>("bakanlik");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!current) return;
    setItems(current.letterheads ?? []);
    setUserLib(current.userLogoLibrary ?? []);
    if ((current.letterheads ?? []).length > 0) setActive(current.letterheads![0]);
    // Kullanıcının projeleri (otomatik başlık için)
    db.getProjects().then((all) => {
      setProjects(all.filter((p) => p.ownerSubscriberId === current.id || (p.consortiumMembers ?? []).some((m) => m.subscriberId === current.id)));
    });
  }, [current, db]);

  const persist = useCallback(async (next: Letterhead[], nextLib?: UserLibraryImage[]) => {
    if (!current) return;
    const updated: Subscriber = { ...current, letterheads: next, userLogoLibrary: nextLib ?? userLib };
    await db.saveSubscriber(updated);
  }, [current, db, userLib]);

  const set = (patch: Partial<Letterhead>) => {
    if (!active) return;
    setActive({ ...active, ...patch, updatedAt: new Date().toISOString() });
  };

  const save = async () => {
    if (!active) return;
    const exists = items.some((c) => c.id === active.id);
    const next = exists ? items.map((c) => c.id === active.id ? active : c) : [active, ...items];
    setItems(next);
    await persist(next);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const create = () => setActive(newLetterhead());
  const remove = async (id: string) => {
    const next = items.filter((c) => c.id !== id);
    setItems(next); await persist(next);
    if (active?.id === id) setActive(next[0] ?? null);
  };

  const addToUserLib = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const img: UserLibraryImage = { id: `ulib-${Date.now()}`, label: file.name.replace(/\.[^.]+$/, ""), dataUrl: ev.target?.result as string, addedAt: new Date().toISOString() };
      const nextLib = [...userLib, img];
      setUserLib(nextLib); await persist(items, nextLib);
    };
    reader.readAsDataURL(file);
  };

  const addFooterLogo = (fl: Omit<CoverFooterLogo, "id" | "order">) => {
    if (!active) return;
    set({ footerLogos: [...active.footerLogos, { ...fl, id: `cfl-${Date.now()}`, order: active.footerLogos.length + 1 }] });
    setLogoPicker(false);
  };

  if (!current) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <p className="text-slate mb-4">{isEn ? "Please sign in to use this tool." : "Bu aracı kullanmak için giriş yapın."}</p>
          <Link href="/kayit" className="text-eu font-semibold hover:underline">{isEn ? "Sign up" : "Kayıt Ol"}</Link>
        </div>
      </PageShell>
    );
  }

  const bandLogoUrl = active
    ? (active.bandLogoCustom ?? (active.bandLogoKey ? (() => {
        const lib = getLibraryLogo(active.bandLogoKey!);
        return lib ? getLogoUrlForLocale(lib, previewLang) : undefined;
      })() : undefined))
    : undefined;

  const displayTitle = active
    ? (previewLang === "tr" ? active.titleTr : active.titleEn)
    : "";

  return (
    <PageShell>
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <Breadcrumb items={[
          { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
          { label: isEn ? "Digital Tools" : "Dijital Araçlar", href: "/araclar" },
          { label: isEn ? "Visibility Material Production" : "Görünürlük Materyali Üretimi", href: "/araclar/gorunurluk" },
          { label: isEn ? "Letterheads" : "Antetli Grubu" },
        ]} />

        <div className="mb-5 mt-3">
          <h1 className="text-2xl font-bold text-ink">{isEn ? "Visibility Material Production" : "Görünürlük Materyali Üretimi"}</h1>
          <p className="text-sm text-slate mt-0.5">
            {isEn ? "Produce EU-visibility-compliant materials in TR & EN." : "AB görünürlük kurallarına uygun materyalleri TR & EN üretin."}
          </p>
        </div>

        {/* Materyal tipi seçici */}
        <div className="flex items-center gap-2 mb-6 border-b border-line">
          <Link href="/araclar/gorunurluk"
            className="px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-slate hover:text-eu -mb-px transition-colors">
            {isEn ? "Report Covers" : "Rapor Kapakları"}
          </Link>
          <div className="px-4 py-2.5 text-sm font-semibold border-b-2 border-eu text-eu -mb-px">
            {isEn ? "Letterheads" : "Antetli Grubu"}
          </div>
        </div>

        {/* Liste */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {items.map((c) => (
            <button key={c.id} onClick={() => setActive(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${active?.id === c.id ? "border-eu bg-eu-pale text-eu" : "border-line text-slate hover:border-eu/40"}`}>
              {c.name}
            </button>
          ))}
          <button onClick={create} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-eu text-white hover:bg-blue-800">
            + {isEn ? "New Letterhead" : "Yeni Antetli"}
          </button>
        </div>

        {!active ? (
          <div className="bg-white border border-line rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📃</div>
            <p className="text-slate mb-4">{isEn ? "No letterhead yet." : "Henüz antetli yok."}</p>
            <button onClick={create} className="px-5 py-2.5 bg-eu text-white rounded-xl font-semibold text-sm hover:bg-blue-800">+ {isEn ? "New Letterhead" : "Yeni Antetli"}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SOL: Editör */}
            <div className="space-y-5">
              {/* Ad + kaydet + yön */}
              <div className="bg-white border border-line rounded-2xl p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-mist uppercase tracking-wide mb-1.5">{isEn ? "Name" : "Ad"}</label>
                  <div className="flex gap-2">
                    <input value={active.name} onChange={(e) => set({ name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                    <button onClick={save} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold hover:bg-blue-800">{saved ? "✓" : (isEn ? "Save" : "Kaydet")}</button>
                    {items.some((c) => c.id === active.id) && (
                      <button onClick={() => remove(active.id)} className="px-3 py-2 border border-line text-mist rounded-lg text-sm hover:text-red-500 hover:border-red-200">{isEn ? "Delete" : "Sil"}</button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-mist uppercase tracking-wide mb-1.5">{isEn ? "Orientation" : "Yön"}</label>
                  <div className="flex gap-2">
                    {(["portrait", "landscape"] as const).map((o) => (
                      <button key={o} onClick={() => set({ orientation: o })}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg border-2 ${active.orientation === o ? "border-eu text-eu bg-eu-pale" : "border-line text-slate"}`}>
                        {o === "portrait" ? (isEn ? "Portrait" : "Dikey") : (isEn ? "Landscape" : "Yatay")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sarı şerit logosu */}
              <div className="bg-white border border-line rounded-2xl p-4">
                <h3 className="text-sm font-bold text-ink mb-1">{isEn ? "Yellow Band Logo" : "Sarı Şerit Logosu"}</h3>
                <p className="text-xs text-mist mb-3">{isEn ? "TR-EU flags / funding logo. Language-aware." : "TR-AB bayrakları / finansman logosu. Dile duyarlı."}</p>
                <div className="grid grid-cols-3 gap-2">
                  {LOGO_LIBRARY.filter((l) => l.category === "finansman").map((lib) => {
                    const selected = active.bandLogoKey === lib.key && !active.bandLogoCustom;
                    return (
                      <button key={lib.key} onClick={() => set({ bandLogoKey: lib.key, bandLogoCustom: undefined })}
                        className={`border-2 rounded-lg p-2 flex flex-col items-center gap-1 transition-all ${selected ? "border-eu bg-eu-pale" : "border-line hover:border-eu/40"}`}>
                        <div className="h-10 flex items-center justify-center w-full">
                          <img src={lib.svgOrUrl} alt={lib.label} className="max-h-full max-w-full object-contain" />
                        </div>
                        <span className="text-[9px] text-slate text-center leading-tight">{lib.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kırmızı şerit: başlık + proje logosu */}
              <div className="bg-white border border-line rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-ink">{isEn ? "Red Band — Project Title" : "Kırmızı Şerit — Proje Başlığı"}</h3>
                {/* Projeden otomatik doldur */}
                {projects.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-semibold text-mist mb-1">{isEn ? "Auto-fill from project (optional)" : "Projeden otomatik doldur (opsiyonel)"}</label>
                    <select value={active.projectId ?? ""} onChange={(e) => {
                      const p = projects.find((x) => x.id === e.target.value);
                      if (p) set({ projectId: p.id, titleTr: p.title, titleEn: p.titleEn ?? p.title });
                      else set({ projectId: undefined });
                    }} className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                      <option value="">— {isEn ? "Manual entry" : "Elle gir"} —</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold text-white bg-eu px-2 py-0.5 rounded-full">TR</label>
                  <input value={active.titleTr} onChange={(e) => set({ titleTr: e.target.value })}
                    placeholder={isEn ? "Project name / short name" : "Proje adı / kısa ad"}
                    className="w-full mt-1.5 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white bg-eu px-2 py-0.5 rounded-full">EN</label>
                  <input value={active.titleEn} onChange={(e) => set({ titleEn: e.target.value })}
                    placeholder={isEn ? "Project name / short name" : "Project name / short name"}
                    className="w-full mt-1.5 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                </div>
                {/* Proje logosu */}
                <div>
                  <label className="block text-[10px] font-semibold text-mist mb-1">{isEn ? "Project logo (optional)" : "Proje logosu (opsiyonel)"}</label>
                  <div className="flex items-center gap-2">
                    {active.projectLogo && (
                      <div className="w-12 h-10 flex items-center justify-center bg-surface rounded border border-line">
                        <img src={active.projectLogo} alt="" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <label className="flex-1 py-2 border-2 border-dashed border-line text-slate text-xs font-semibold rounded-lg text-center cursor-pointer hover:border-eu">
                      {active.projectLogo ? (isEn ? "Change" : "Değiştir") : (isEn ? "+ Upload logo" : "+ Logo yükle")}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => set({ projectLogo: ev.target?.result as string });
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                    {active.projectLogo && (
                      <button onClick={() => set({ projectLogo: undefined })} className="text-xs text-red-500 hover:underline">{isEn ? "Remove" : "Kaldır"}</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mavi alt şerit logoları */}
              <div className="bg-white border border-line rounded-2xl p-4">
                <h3 className="text-sm font-bold text-ink mb-1">{isEn ? "Blue Band Logos (footer)" : "Mavi Şerit Logoları (footer)"}</h3>
                <p className="text-xs text-mist mb-3">{isEn ? "Same logic as website footer. Reorder with arrows." : "Website footer ile aynı mantık. Oklarla sırala."}</p>
                {active.footerLogos.length === 0 ? (
                  <div className="bg-surface rounded-lg p-3 text-center text-xs text-mist mb-3">{isEn ? "No logos yet" : "Henüz logo yok"}</div>
                ) : (
                  <div className="space-y-1.5 mb-3">
                    {[...active.footerLogos].sort((a, b) => a.order - b.order).map((fl, idx, arr) => {
                      const src = resolveFooterLogoSrc(fl, userLib);
                      return (
                        <div key={fl.id} className="flex items-center gap-2 bg-surface rounded-lg px-2.5 py-2">
                          <div className="w-12 h-8 flex items-center justify-center bg-white rounded border border-line flex-shrink-0">
                            {src && <img src={src} alt="" className="max-w-full max-h-full object-contain" />}
                          </div>
                          <span className="flex-1 text-xs text-ink truncate">{fl.label ?? "Logo"}</span>
                          <div className="flex gap-1">
                            <button disabled={idx === 0} onClick={() => {
                              const s = [...arr]; [s[idx - 1].order, s[idx].order] = [s[idx].order, s[idx - 1].order]; set({ footerLogos: [...s] });
                            }} className="w-6 h-6 text-xs border border-line rounded disabled:opacity-30">←</button>
                            <button disabled={idx === arr.length - 1} onClick={() => {
                              const s = [...arr]; [s[idx + 1].order, s[idx].order] = [s[idx].order, s[idx + 1].order]; set({ footerLogos: [...s] });
                            }} className="w-6 h-6 text-xs border border-line rounded disabled:opacity-30">→</button>
                            <button onClick={() => set({ footerLogos: active.footerLogos.filter((x) => x.id !== fl.id) })}
                              className="w-6 h-6 text-xs text-red-400 border border-red-200 rounded hover:bg-red-50">✕</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => { setLogoPicker(true); setLogoPickerTab("system"); }}
                    className="flex-1 py-2 border-2 border-eu/30 text-eu text-xs font-semibold rounded-lg hover:bg-eu-pale">
                    + {isEn ? "Add from Library" : "Kütüphaneden Ekle"}
                  </button>
                  <label className="flex-1 py-2 border-2 border-dashed border-line text-slate text-xs font-semibold rounded-lg text-center cursor-pointer hover:border-eu">
                    + {isEn ? "Upload" : "Yükle"}
                    <input type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => addFooterLogo({ source: "custom", dataUrl: ev.target?.result as string, label: file.name.replace(/\.[^.]+$/, "") });
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                </div>
              </div>
            </div>

            {/* SAĞ: Önizleme + çıktılar */}
            <div className="lg:sticky lg:top-4 self-start">
              <div className="bg-white border border-line rounded-2xl p-4">
                <div className="flex items-center justify-end mb-3 gap-1">
                  <button onClick={() => setPreviewLang("tr")}
                    className={`px-3 py-1 rounded text-xs font-semibold border ${previewLang === "tr" ? "bg-eu text-white border-eu" : "border-line text-slate"}`}>TR</button>
                  <button onClick={() => setPreviewLang("en")}
                    className={`px-3 py-1 rounded text-xs font-semibold border ${previewLang === "en" ? "bg-eu text-white border-eu" : "border-line text-slate"}`}>EN</button>
                </div>

                <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-center overflow-auto" style={{ maxHeight: "65vh" }}>
                  <LetterheadPreview lh={active} lang={previewLang} title={displayTitle} bandLogoUrl={bandLogoUrl} userLib={userLib} />
                </div>

                {/* Çıktı butonları */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button onClick={() => exportPdf(active, previewLang, displayTitle, bandLogoUrl, userLib)}
                    className="py-2.5 bg-eu text-white rounded-xl text-sm font-semibold hover:bg-blue-800">PDF</button>
                  <button onClick={() => exportWord(active, previewLang, displayTitle, bandLogoUrl, userLib)}
                    className="py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800">Word</button>
                  <button onClick={() => exportExcel(active, previewLang, displayTitle, bandLogoUrl, userLib)}
                    className="py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800">Excel</button>
                </div>
                <p className="text-[11px] text-mist text-center mt-2">
                  {isEn ? `Downloads the ${previewLang.toUpperCase()} version.` : `${previewLang.toUpperCase()} sürümünü indirir.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {logoPicker && active && (
        <LogoPickerModal isEn={isEn} tab={logoPickerTab} setTab={setLogoPickerTab}
          systemCat={systemCat} setSystemCat={setSystemCat} userLib={userLib}
          onAddSystem={(key, label) => addFooterLogo({ source: "system", refKey: key, label })}
          onAddUser={(img) => addFooterLogo({ source: "user", refKey: img.id, dataUrl: img.dataUrl, label: img.label })}
          onUpload={addToUserLib} onClose={() => setLogoPicker(false)} />
      )}
    </PageShell>
  );
}

// ═══ Önizleme ═══
function LetterheadPreview({ lh, lang, title, bandLogoUrl, userLib }: {
  lh: Letterhead; lang: "tr" | "en"; title: string; bandLogoUrl?: string; userLib: UserLibraryImage[];
}) {
  const portrait = lh.orientation === "portrait";
  // Container'a tam sığacak boyut (A4 oranı korunur)
  const W = portrait ? 340 : 480;
  const H = portrait ? 481 : 340;
  const tpl = portrait ? TPL_PORTRAIT : TPL_LANDSCAPE;
  // Bant oranları (%20 küçültülmüş — dikey: sarı 0-8, kırmızı 8-11, mavi 96-100 / yatay: sarı 0-11, kırmızı 11-15, mavi 94-100)
  const bandTop = "0.5%", bandH = portrait ? "7%" : "10%";
  const redTop = portrait ? "8%" : "11%", redH = portrait ? "3%" : "4%";
  const footTop = portrait ? "96%" : "94%", footH = portrait ? "4%" : "6%";

  return (
    <div style={{ width: W, height: H, position: "relative", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", flexShrink: 0 }}>
      <img src={tpl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Sarı şerit logosu */}
      {bandLogoUrl && (
        <div style={{ position: "absolute", top: bandTop, left: 0, right: 0, height: bandH, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 30%" }}>
          <img src={bandLogoUrl} alt="" style={{ maxHeight: "85%", maxWidth: "100%", objectFit: "contain" }} />
        </div>
      )}
      {/* Kırmızı şerit: logo + başlık, ortalı */}
      <div style={{ position: "absolute", top: redTop, left: 0, right: 0, height: redH, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 8%" }}>
        {lh.projectLogo && <img src={lh.projectLogo} alt="" style={{ maxHeight: "80%", maxWidth: 40, objectFit: "contain" }} />}
        {title && <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{title}</span>}
      </div>
      {/* Mavi alt şerit logoları */}
      <div style={{ position: "absolute", top: footTop, left: 0, right: 0, height: footH, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 6%" }}>
        {[...lh.footerLogos].sort((a, b) => a.order - b.order).map((fl) => {
          const src = resolveFooterLogoSrc(fl, userLib);
          return src ? <img key={fl.id} src={src} alt="" style={{ maxHeight: "75%", maxWidth: 60, objectFit: "contain" }} /> : null;
        })}
      </div>
    </div>
  );
}

// ═══ Logo Seçici Modal (rapor kapaklarıyla ortak yapı) ═══
function LogoPickerModal({ isEn, tab, setTab, systemCat, setSystemCat, userLib, onAddSystem, onAddUser, onUpload, onClose }: {
  isEn: boolean; tab: "system" | "user"; setTab: (t: "system" | "user") => void;
  systemCat: string; setSystemCat: (c: string) => void; userLib: UserLibraryImage[];
  onAddSystem: (key: string, label: string) => void; onAddUser: (img: UserLibraryImage) => void;
  onUpload: (file: File) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[75vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h3 className="font-bold text-ink">{isEn ? "Logo Library" : "Logo Kütüphanesi"}</h3>
          <button onClick={onClose} className="text-mist hover:text-ink text-xl">×</button>
        </div>
        <div className="px-5 pt-3 flex gap-2 border-b border-line">
          <button onClick={() => setTab("system")} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === "system" ? "border-eu text-eu" : "border-transparent text-slate"}`}>{isEn ? "System Library" : "Sistem Kütüphanesi"}</button>
          <button onClick={() => setTab("user")} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === "user" ? "border-eu text-eu" : "border-transparent text-slate"}`}>{isEn ? "My Library" : "Kütüphanem"}</button>
        </div>
        {tab === "system" ? (
          <>
            <div className="px-5 py-2.5 flex gap-1.5 overflow-x-auto border-b border-line">
              {SYSTEM_LOGO_CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setSystemCat(cat.id)} className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${systemCat === cat.id ? "bg-eu text-white" : "bg-surface text-slate"}`}>{cat.label}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
              {SYSTEM_LOGOS.filter((l) => l.category === systemCat).map((logo) => (
                <button key={logo.key} onClick={() => onAddSystem(logo.key, isEn ? logo.labelEn : logo.label)} className="border-2 border-line rounded-xl p-3 flex flex-col items-center gap-2 hover:border-eu transition-all">
                  <div className="w-16 h-12 flex items-center justify-center"><img src={logo.url} alt={logo.label} className="max-w-full max-h-full object-contain" /></div>
                  <span className="text-[9px] text-slate text-center leading-tight">{isEn ? logo.labelEn : logo.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-line">
              <label className="block border-2 border-dashed border-line rounded-xl p-3 text-center cursor-pointer hover:border-eu transition-colors">
                <span className="text-xs text-eu font-semibold">+ {isEn ? "Upload a new logo to your library" : "Kütüphanene yeni logo yükle"}</span>
                <input type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
              </label>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
              {userLib.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-mist text-sm">{isEn ? "Your library is empty." : "Kütüphaneniz boş."}</div>
              ) : userLib.map((img) => (
                <button key={img.id} onClick={() => onAddUser(img)} className="border-2 border-line rounded-xl p-3 flex flex-col items-center gap-2 hover:border-eu transition-all">
                  <div className="w-16 h-12 flex items-center justify-center"><img src={img.dataUrl} alt={img.label} className="max-w-full max-h-full object-contain" /></div>
                  <span className="text-[9px] text-slate text-center leading-tight truncate w-full">{img.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══ Çıktı yardımcıları ═══
function exportPdf(lh: Letterhead, lang: "tr" | "en", title: string, bandLogoUrl: string | undefined, userLib: UserLibraryImage[]) {
  const origin = window.location.origin;
  const tpl = lh.orientation === "portrait" ? TPL_PORTRAIT : TPL_LANDSCAPE;
  const abs = (u?: string) => !u ? "" : (u.startsWith("data:") ? u : origin + u);
  const footerImgs = [...lh.footerLogos].sort((a, b) => a.order - b.order).map((fl) => abs(resolveFooterLogoSrc(fl, userLib))).filter(Boolean) as string[];
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const portrait = lh.orientation === "portrait";

  const bandTop = "0.5%", bandH = portrait ? "7%" : "10%";
  const redTop = portrait ? "8%" : "11%", redH = portrait ? "3%" : "4%";
  const footTop = portrait ? "96%" : "94%", footH = portrait ? "4%" : "6%";

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(lh.name)}</title>
<style>
  @page { size: A4 ${portrait ? "portrait" : "landscape"}; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; }
  .page { width: ${portrait ? "210mm" : "297mm"}; height: ${portrait ? "297mm" : "210mm"}; position: relative; overflow: hidden; background:#fff; }
  .bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .band { position:absolute; top:${bandTop}; left:0; right:0; height:${bandH}; display:flex; align-items:center; justify-content:center; padding:0 30%; }
  .red { position:absolute; top:${redTop}; left:0; right:0; height:${redH}; display:flex; align-items:center; justify-content:center; gap:10px; padding:0 8%; }
  .red span { color:#fff; font-weight:bold; font-size:9pt; text-align:center; }
  .foot { position:absolute; top:${footTop}; left:0; right:0; height:${footH}; display:flex; align-items:center; justify-content:center; gap:20px; padding:0 6%; }
  @media print { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
</style></head>
<body onload="setTimeout(function(){window.print();},600)">
  <div class="page">
    <img class="bg" src="${origin}${tpl}" />
    ${bandLogoUrl ? `<div class="band"><img src="${abs(bandLogoUrl)}" style="max-height:90%;max-width:100%;object-fit:contain;" /></div>` : ""}
    <div class="red">${lh.projectLogo ? `<img src="${abs(lh.projectLogo)}" style="max-height:80%;object-fit:contain;" />` : ""}${title ? `<span>${esc(title)}</span>` : ""}</div>
    <div class="foot">${footerImgs.map((s) => `<img src="${s}" style="max-height:80%;max-width:120px;object-fit:contain;" />`).join("")}</div>
  </div>
</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

// SVG/görsel URL'sini PNG data-url'e çevir (Word/Excel SVG'yi kötü render eder)
async function toPngDataUrl(src: string, maxH = 120): Promise<string> {
  return new Promise((resolve) => {
    if (!src) { resolve(""); return; }
    // Zaten raster data-url ise (png/jpeg) dokunma
    if (src.startsWith("data:image/png") || src.startsWith("data:image/jpeg") || src.startsWith("data:image/jpg")) {
      resolve(src); return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const scale = maxH / (img.naturalHeight || maxH);
        const w = Math.round((img.naturalWidth || maxH) * scale);
        const h = Math.round((img.naturalHeight || maxH) * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(src); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

async function exportWord(lh: Letterhead, lang: "tr" | "en", title: string, bandLogoUrl: string | undefined, userLib: UserLibraryImage[]) {
  const origin = window.location.origin;
  const abs = (u?: string) => !u ? "" : (u.startsWith("data:") ? u : origin + u);
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const portrait = lh.orientation === "portrait";

  // Logoları PNG'ye çevir (Word SVG'yi bozuyor)
  const bandPng = bandLogoUrl ? await toPngDataUrl(abs(bandLogoUrl), 96) : "";
  const projectPng = lh.projectLogo ? await toPngDataUrl(abs(lh.projectLogo), 48) : "";
  const footerSrcs = [...lh.footerLogos].sort((a, b) => a.order - b.order).map((fl) => abs(resolveFooterLogoSrc(fl, userLib))).filter(Boolean) as string[];
  const footerPngs = await Promise.all(footerSrcs.map((s) => toPngDataUrl(s, 72)));

  const pageW = portrait ? "21cm" : "29.7cm";
  const pageH = portrait ? "29.7cm" : "21cm";

  const bandImg = bandPng
    ? `<p style="text-align:center;margin:0;"><img src="${bandPng}" style="height:48px;" alt="" /></p>`
    : "";
  const redBar = (title || projectPng)
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:4px;"><tr><td bgcolor="#C41E3A" align="center" style="padding:5px;">${projectPng ? `<img src="${projectPng}" style="height:20px;vertical-align:middle;" alt="" />&nbsp;` : ""}<span style="color:#ffffff;font-weight:bold;font-size:9pt;">${esc(title)}</span></td></tr></table>`
    : "";

  const footerCells = footerPngs.map((s) => `<td align="center" valign="middle" style="padding:0 8px;"><img src="${s}" style="height:30px;" alt="" /></td>`).join("");
  const footerTable = footerPngs.length
    ? `<table align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>${footerCells}</tr></table>`
    : "";

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  @page Section1 {
    size: ${pageW} ${pageH};
    margin: 3cm 2cm 3cm 2cm;
    mso-header-margin: 1cm;
    mso-footer-margin: 1cm;
    mso-header: h1;
    mso-footer: f1;
  }
  div.Section1 { page: Section1; }
  p, td, span { font-family: Arial, sans-serif; }
  p.MsoHeader, p.MsoFooter { margin: 0; }
  table { mso-table-lspace: 0; mso-table-rspace: 0; }
</style>
</head>
<body>
<div class="Section1">
  <p style="color:#999999;text-align:center;">[ ${lang === "tr" ? "Belge içeriğini buraya yazın" : "Type your document content here"} ]</p>

  <!-- Üstbilgi -->
  <div style="mso-element:header" id="h1">
    ${bandImg ? `<p class="MsoHeader" style="text-align:center;">${bandImg}</p>` : ""}
    ${redBar ? `<p class="MsoHeader">${redBar}</p>` : ""}
  </div>

  <!-- Altbilgi -->
  <div style="mso-element:footer" id="f1">
    <p class="MsoFooter" style="text-align:center;">${footerTable}</p>
  </div>
</div>
</body></html>`;
  downloadBlob(html, `${lh.name}-${lang.toUpperCase()}.doc`, "application/msword");
}

async function exportExcel(lh: Letterhead, lang: "tr" | "en", title: string, bandLogoUrl: string | undefined, userLib: UserLibraryImage[]) {
  const origin = window.location.origin;
  const abs = (u?: string) => !u ? "" : (u.startsWith("data:") ? u : origin + u);
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const portrait = lh.orientation === "portrait";

  // SVG → PNG (Excel de SVG'yi bozar)
  const bandPng = bandLogoUrl ? await toPngDataUrl(abs(bandLogoUrl), 96) : "";
  const projectPng = lh.projectLogo ? await toPngDataUrl(abs(lh.projectLogo), 48) : "";
  const footerSrcs = [...lh.footerLogos].sort((a, b) => a.order - b.order).map((fl) => abs(resolveFooterLogoSrc(fl, userLib))).filter(Boolean) as string[];
  const footerPngs = await Promise.all(footerSrcs.map((s) => toPngDataUrl(s, 72)));

  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8">
<!--[if gte mso 9]><xml>
<x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${esc(lh.name)}</x:Name>
<x:WorksheetOptions>
  <x:Print>
    <x:PaperSizeIndex>9</x:PaperSizeIndex>
    ${portrait ? "" : "<x:Orientation>Landscape</x:Orientation>"}
    <x:LeftMargin>0.79</x:LeftMargin><x:RightMargin>0.79</x:RightMargin>
    <x:TopMargin>0.79</x:TopMargin><x:BottomMargin>0.79</x:BottomMargin>
    <x:HorizontalResolution>600</x:HorizontalResolution>
  </x:Print>
  <x:DisplayGridlines/>
</x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>td,span{font-family:Arial,sans-serif;}</style>
</head><body>
<table border="0" cellpadding="4" cellspacing="0" width="100%">
  <tr><td colspan="6" align="center">${bandPng ? `<img src="${bandPng}" height="48" />` : ""}</td></tr>
  <tr><td colspan="6" align="center" bgcolor="#C41E3A">${projectPng ? `<img src="${projectPng}" height="20" style="vertical-align:middle;" />&nbsp;` : ""}<font color="#FFFFFF" size="2"><b>${esc(title)}</b></font></td></tr>
  <tr><td colspan="6" height="20">&nbsp;</td></tr>
  <tr><td colspan="6" align="center"><font color="#999999">[ ${lang === "tr" ? "Tablo içeriğini buraya girin" : "Enter your table content here"} ]</font></td></tr>
  <tr><td colspan="6" height="20">&nbsp;</td></tr>
  <tr><td colspan="6" align="center">${footerPngs.map((s) => `<img src="${s}" height="30" />`).join("&nbsp;&nbsp;&nbsp;")}</td></tr>
</table>
</body></html>`;
  downloadBlob(html, `${lh.name}-${lang.toUpperCase()}.xls`, "application/vnd.ms-excel");
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob(["\ufeff", content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
