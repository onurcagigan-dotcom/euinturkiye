"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import { LOGO_LIBRARY, getLibraryLogo, getLogoUrlForLocale } from "@/lib/website/logo-library";
import { SYSTEM_LOGOS, SYSTEM_LOGO_CATEGORIES, getSystemLogo, resolveLogoSrc } from "@/lib/website/system-logos";
import type { ReportCover, CoverFooterLogo, UserLibraryImage, Subscriber } from "@/lib/types";

// Şablon görselleri (A4 dikey)
const TPL_FRONT = "/cover-templates/on-kapak.jpg";
const TPL_BACK = "/cover-templates/arka-kapak.jpg";

function newCover(): ReportCover {
  return {
    id: `cover-${Date.now()}`,
    name: "Yeni Rapor Kapağı",
    updatedAt: new Date().toISOString(),
    bandLogoKey: "es-finanse",
    frontTextTr: "Proje Adı\n\nSözleşme No: NEAR/ANK/2023/EA-RP/0000/SER/00\n\nRAPOR ADI\n\nAktivite 0.0 Aktivite Adı\n\nHAZİRAN 2026",
    frontTextEn: "Project Name\n\nContract N° NEAR/ANK/2023/EA-RP/0000/SER/00\n\nREPORT TITLE\n\nActivity 0.0 Activity Name\n\nJUNE 2026",
    footerLogos: [],
    backTextTr: "Bu rapor Avrupa Birliği'nin mali desteğiyle hazırlanmıştır. İçeriğinden yalnızca [Yüklenici] sorumludur ve Türkiye Cumhuriyeti ile Avrupa Birliği'nin görüşlerini yansıtmak zorunda değildir.",
    backTextEn: "This report was produced with the financial support of the European Union. Its contents are the sole responsibility of [Contractor] and do not necessarily reflect the views of the Republic of Türkiye and the European Union.",
  };
}

// Alt şerit logosunun görsel kaynağını çöz (ortak yardımcı)
function resolveFooterLogoSrc(fl: CoverFooterLogo, userLib: UserLibraryImage[]): string | undefined {
  return resolveLogoSrc(fl, userLib);
}

export default function GorunurlukPage() {
  const { locale } = useLocale();
  const { current } = useFirma();
  const isEn = locale === "en";
  const db = getDataProvider();

  const [covers, setCovers] = useState<ReportCover[]>([]);
  const [userLib, setUserLib] = useState<UserLibraryImage[]>([]);
  const [active, setActive] = useState<ReportCover | null>(null);
  const [previewLang, setPreviewLang] = useState<"tr" | "en">("tr");
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");
  const [logoPicker, setLogoPicker] = useState(false);
  const [logoPickerTab, setLogoPickerTab] = useState<"system" | "user">("system");
  const [systemCat, setSystemCat] = useState<string>("bakanlik");
  const [saved, setSaved] = useState(false);

  // Yükle
  useEffect(() => {
    if (!current) return;
    setCovers(current.reportCovers ?? []);
    setUserLib(current.userLogoLibrary ?? []);
    if ((current.reportCovers ?? []).length > 0) {
      setActive(current.reportCovers![0]);
    }
  }, [current]);

  const persist = useCallback(async (nextCovers: ReportCover[], nextLib?: UserLibraryImage[]) => {
    if (!current) return;
    const updated: Subscriber = {
      ...current,
      reportCovers: nextCovers,
      userLogoLibrary: nextLib ?? userLib,
    };
    await db.saveSubscriber(updated);
  }, [current, db, userLib]);

  const set = (patch: Partial<ReportCover>) => {
    if (!active) return;
    setActive({ ...active, ...patch, updatedAt: new Date().toISOString() });
  };

  const saveCover = async () => {
    if (!active) return;
    const exists = covers.some((c) => c.id === active.id);
    const next = exists ? covers.map((c) => c.id === active.id ? active : c) : [active, ...covers];
    setCovers(next);
    await persist(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const createCover = () => {
    const c = newCover();
    setActive(c);
  };

  const deleteCover = async (id: string) => {
    const next = covers.filter((c) => c.id !== id);
    setCovers(next);
    await persist(next);
    if (active?.id === id) setActive(next[0] ?? null);
  };

  // Kullanıcı kütüphanesine logo ekle
  const addToUserLib = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const img: UserLibraryImage = {
        id: `ulib-${Date.now()}`,
        label: file.name.replace(/\.[^.]+$/, ""),
        dataUrl,
        addedAt: new Date().toISOString(),
      };
      const nextLib = [...userLib, img];
      setUserLib(nextLib);
      await persist(covers, nextLib);
    };
    reader.readAsDataURL(file);
  };

  // Alt şeride logo ekle
  const addFooterLogo = (fl: Omit<CoverFooterLogo, "id" | "order">) => {
    if (!active) return;
    const entry: CoverFooterLogo = {
      ...fl,
      id: `cfl-${Date.now()}`,
      order: active.footerLogos.length + 1,
    };
    set({ footerLogos: [...active.footerLogos, entry] });
    setLogoPicker(false);
  };

  if (!current) {
    return (
      <PageShell>
        <div className="max-w-lg mx-auto py-16 text-center">
          <div className="text-4xl mb-4">🎭</div>
          <h2 className="text-lg font-bold text-ink mb-2">
            {isEn ? "Choose a role to explore this tool" : "Bu aracı denemek için bir rol seçin"}
          </h2>
          <p className="text-slate mb-6 text-sm">
            {isEn
              ? "This tool is available to firms, NGOs and programme authorities. Pick a demo role to continue — no login required."
              : "Bu araç firma, STK ve program otoritelerine açıktır. Devam etmek için bir demo rolü seçin — giriş gerekmez."}
          </p>
          <button
            onClick={() => {
              try { window.localStorage.removeItem("eu_demo_role"); } catch {}
              document.cookie = "eu_firma_session=; path=/; max-age=0";
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-eu text-white rounded-xl font-semibold text-sm hover:bg-blue-800">
            {isEn ? "Select a role" : "Rol Seç"}
          </button>
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

  return (
    <PageShell>
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <Breadcrumb items={[
          { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
          { label: isEn ? "Digital Tools" : "Dijital Araçlar", href: "/araclar" },
          { label: isEn ? "Visibility Material Production" : "Görünürlük Materyali Üretimi" },
        ]} />

        <div className="mb-5 mt-3">
          <h1 className="text-2xl font-bold text-ink">{isEn ? "Visibility Material Production" : "Görünürlük Materyali Üretimi"}</h1>
          <p className="text-sm text-slate mt-0.5">
            {isEn
              ? "Produce EU-visibility-compliant materials in TR & EN."
              : "AB görünürlük kurallarına uygun materyalleri TR & EN üretin."}
          </p>
        </div>

        {/* Materyal tipi seçici */}
        <div className="flex items-center gap-2 mb-6 border-b border-line">
          <div className="px-4 py-2.5 text-sm font-semibold border-b-2 border-eu text-eu -mb-px">
            {isEn ? "Report Covers" : "Rapor Kapakları"}
          </div>
          <Link href="/araclar/antetli"
            className="px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-slate hover:text-eu -mb-px transition-colors">
            {isEn ? "Letterheads" : "Antetli Grubu"}
          </Link>
        </div>

        {/* Kapak listesi */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {covers.map((c) => (
            <button key={c.id} onClick={() => setActive(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${active?.id === c.id ? "border-eu bg-eu-pale text-eu" : "border-line text-slate hover:border-eu/40"}`}>
              {c.name}
            </button>
          ))}
          <button onClick={createCover}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-eu text-white hover:bg-blue-800">
            + {isEn ? "New Cover" : "Yeni Kapak"}
          </button>
        </div>

        {!active ? (
          <div className="bg-white border border-line rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-slate mb-4">{isEn ? "No cover yet. Create one to start." : "Henüz kapak yok. Başlamak için bir kapak oluşturun."}</p>
            <button onClick={createCover} className="px-5 py-2.5 bg-eu text-white rounded-xl font-semibold text-sm hover:bg-blue-800">
              + {isEn ? "New Cover" : "Yeni Kapak"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── SOL: Editör ── */}
            <div className="space-y-5">
              {/* Kapak adı + kaydet */}
              <div className="bg-white border border-line rounded-2xl p-4">
                <label className="block text-xs font-bold text-mist uppercase tracking-wide mb-1.5">{isEn ? "Cover Name" : "Kapak Adı"}</label>
                <div className="flex gap-2">
                  <input value={active.name} onChange={(e) => set({ name: e.target.value })}
                    className="flex-1 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  <button onClick={saveCover}
                    className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold hover:bg-blue-800">
                    {saved ? "✓" : (isEn ? "Save" : "Kaydet")}
                  </button>
                  {covers.some((c) => c.id === active.id) && (
                    <button onClick={() => deleteCover(active.id)}
                      className="px-3 py-2 border border-line text-mist rounded-lg text-sm hover:text-red-500 hover:border-red-200">
                      {isEn ? "Delete" : "Sil"}
                    </button>
                  )}
                </div>
              </div>

              {/* Sarı şerit logosu */}
              <div className="bg-white border border-line rounded-2xl p-4">
                <h3 className="text-sm font-bold text-ink mb-1">{isEn ? "Yellow Band Logo" : "Sarı Şerit Logosu"}</h3>
                <p className="text-xs text-mist mb-3">{isEn ? "EU funding logo shown on the yellow band. Language-aware (TR/EN)." : "Sarı şeritte gösterilen AB finansman logosu. Dile duyarlı (TR/EN)."}</p>
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

              {/* Orta metin — TR + EN */}
              <div className="bg-white border border-line rounded-2xl p-4">
                <h3 className="text-sm font-bold text-ink mb-1">{isEn ? "Front Cover Text" : "Ön Kapak Metni"}</h3>
                <p className="text-xs text-mist mb-3">{isEn ? "Project name, contract number, report title, activity, date." : "Proje adı, sözleşme no, rapor adı, aktivite, tarih."}</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-white bg-eu px-2 py-0.5 rounded-full">TR</label>
                    <textarea value={active.frontTextTr} onChange={(e) => set({ frontTextTr: e.target.value })}
                      rows={7} className="w-full mt-1.5 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-y" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white bg-eu px-2 py-0.5 rounded-full">EN</label>
                    <textarea value={active.frontTextEn} onChange={(e) => set({ frontTextEn: e.target.value })}
                      rows={7} className="w-full mt-1.5 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-y" />
                  </div>
                </div>
              </div>

              {/* Alt şerit logoları */}
              <div className="bg-white border border-line rounded-2xl p-4">
                <h3 className="text-sm font-bold text-ink mb-1">{isEn ? "Footer Logos (white band)" : "Alt Şerit Logoları (beyaz bant)"}</h3>
                <p className="text-xs text-mist mb-3">{isEn ? "Logos shown side by side. Reorder with arrows." : "Yan yana dizilen logolar. Oklarla sırala."}</p>
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
                              const sorted = [...arr];
                              [sorted[idx - 1].order, sorted[idx].order] = [sorted[idx].order, sorted[idx - 1].order];
                              set({ footerLogos: [...sorted] });
                            }} className="w-6 h-6 text-xs border border-line rounded disabled:opacity-30">←</button>
                            <button disabled={idx === arr.length - 1} onClick={() => {
                              const sorted = [...arr];
                              [sorted[idx + 1].order, sorted[idx].order] = [sorted[idx].order, sorted[idx + 1].order];
                              set({ footerLogos: [...sorted] });
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

              {/* Arka kapak metni */}
              <div className="bg-white border border-line rounded-2xl p-4">
                <h3 className="text-sm font-bold text-ink mb-1">{isEn ? "Back Cover Disclaimer" : "Arka Kapak Feragatnamesi"}</h3>
                <p className="text-xs text-mist mb-3">{isEn ? "EU disclaimer note shown on the back cover." : "Arka kapakta gösterilen AB feragat notu."}</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-white bg-eu px-2 py-0.5 rounded-full">TR</label>
                    <textarea value={active.backTextTr} onChange={(e) => set({ backTextTr: e.target.value })}
                      rows={4} className="w-full mt-1.5 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-y" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white bg-eu px-2 py-0.5 rounded-full">EN</label>
                    <textarea value={active.backTextEn} onChange={(e) => set({ backTextEn: e.target.value })}
                      rows={4} className="w-full mt-1.5 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-y" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── SAĞ: Önizleme ── */}
            <div className="lg:sticky lg:top-4 self-start">
              <div className="bg-white border border-line rounded-2xl p-4">
                {/* Önizleme kontrolleri */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex gap-1 bg-surface rounded-lg p-1">
                    <button onClick={() => setPreviewSide("front")}
                      className={`px-3 py-1 rounded text-xs font-semibold ${previewSide === "front" ? "bg-white text-eu shadow-sm" : "text-slate"}`}>
                      {isEn ? "Front" : "Ön Kapak"}
                    </button>
                    <button onClick={() => setPreviewSide("back")}
                      className={`px-3 py-1 rounded text-xs font-semibold ${previewSide === "back" ? "bg-white text-eu shadow-sm" : "text-slate"}`}>
                      {isEn ? "Back" : "Arka Kapak"}
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setPreviewLang("tr")}
                      className={`px-3 py-1 rounded text-xs font-semibold border ${previewLang === "tr" ? "bg-eu text-white border-eu" : "border-line text-slate"}`}>TR</button>
                    <button onClick={() => setPreviewLang("en")}
                      className={`px-3 py-1 rounded text-xs font-semibold border ${previewLang === "en" ? "bg-eu text-white border-eu" : "border-line text-slate"}`}>EN</button>
                  </div>
                </div>

                {/* A4 önizleme */}
                <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-center overflow-auto" style={{ maxHeight: "70vh" }}>
                  <CoverPreview
                    cover={active} lang={previewLang} side={previewSide}
                    bandLogoUrl={bandLogoUrl} userLib={userLib}
                  />
                </div>

                {/* İndirme */}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => printCover(active, previewLang, userLib, bandLogoUrl)}
                    className="flex-1 py-2.5 bg-eu text-white rounded-xl text-sm font-semibold hover:bg-blue-800 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
                    {isEn ? `Download PDF (${previewLang.toUpperCase()})` : `PDF İndir (${previewLang.toUpperCase()})`}
                  </button>
                </div>
                <p className="text-[11px] text-mist text-center mt-2">
                  {isEn ? "Opens the print dialog — choose 'Save as PDF'." : "Yazdırma penceresi açılır — 'PDF olarak kaydet' seçin."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logo seçici modal */}
      {logoPicker && active && (
        <LogoPickerModal
          isEn={isEn}
          tab={logoPickerTab} setTab={setLogoPickerTab}
          systemCat={systemCat} setSystemCat={setSystemCat}
          userLib={userLib}
          onAddSystem={(key, label) => addFooterLogo({ source: "system", refKey: key, label })}
          onAddUser={(img) => addFooterLogo({ source: "user", refKey: img.id, dataUrl: img.dataUrl, label: img.label })}
          onUpload={addToUserLib}
          onClose={() => setLogoPicker(false)}
        />
      )}
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
// A4 Kapak Önizleme
// ═══════════════════════════════════════════════════════════
function CoverPreview({ cover, lang, side, bandLogoUrl, userLib }: {
  cover: ReportCover; lang: "tr" | "en"; side: "front" | "back";
  bandLogoUrl?: string; userLib: UserLibraryImage[];
}) {
  // A4 oranı: 210 x 297 mm → ölçek: 1mm = 2px önizlemede
  const W = 420, H = 594;
  const text = side === "front"
    ? (lang === "tr" ? cover.frontTextTr : cover.frontTextEn)
    : (lang === "tr" ? cover.backTextTr : cover.backTextEn);

  return (
    <div style={{ width: W, height: H, position: "relative", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", flexShrink: 0 }}>
      {/* Şablon arka plan */}
      <img src={side === "front" ? TPL_FRONT : TPL_BACK} alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

      {side === "front" ? (
        <>
          {/* Sarı şerit logosu — %18-37 arası, ortada */}
          {bandLogoUrl && (
            <div style={{ position: "absolute", top: "18%", left: 0, right: 0, height: "19%", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20%" }}>
              <img src={bandLogoUrl} alt="" style={{ maxHeight: "80%", maxWidth: "100%", objectFit: "contain" }} />
            </div>
          )}
          {/* Orta metin — %37-80 arası, mavi alan, beyaz metin */}
          <div style={{ position: "absolute", top: "39%", left: 0, right: 0, height: "40%", padding: "0 12%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ color: "#fff", fontSize: 11, lineHeight: 1.7, whiteSpace: "pre-wrap", fontWeight: 500 }}>{text}</div>
          </div>
          {/* Alt beyaz şerit logoları — %80-91 arası */}
          <div style={{ position: "absolute", top: "80.5%", left: 0, right: 0, height: "10%", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 8%" }}>
            {[...cover.footerLogos].sort((a, b) => a.order - b.order).map((fl) => {
              const src = resolveFooterLogoSrc(fl, userLib);
              return src ? <img key={fl.id} src={src} alt="" style={{ maxHeight: "70%", maxWidth: 80, objectFit: "contain" }} /> : null;
            })}
          </div>
        </>
      ) : (
        // Arka kapak — disclaimer altta
        <div style={{ position: "absolute", bottom: "12%", left: 0, right: 0, padding: "0 12%", textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 10, lineHeight: 1.6, fontStyle: "italic", whiteSpace: "pre-wrap" }}>{text}</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Logo Seçici Modal
// ═══════════════════════════════════════════════════════════
function LogoPickerModal({ isEn, tab, setTab, systemCat, setSystemCat, userLib, onAddSystem, onAddUser, onUpload, onClose }: {
  isEn: boolean;
  tab: "system" | "user"; setTab: (t: "system" | "user") => void;
  systemCat: string; setSystemCat: (c: string) => void;
  userLib: UserLibraryImage[];
  onAddSystem: (key: string, label: string) => void;
  onAddUser: (img: UserLibraryImage) => void;
  onUpload: (file: File) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[75vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h3 className="font-bold text-ink">{isEn ? "Logo Library" : "Logo Kütüphanesi"}</h3>
          <button onClick={onClose} className="text-mist hover:text-ink text-xl">×</button>
        </div>

        {/* Sekmeler: Sistem / Kullanıcı */}
        <div className="px-5 pt-3 flex gap-2 border-b border-line">
          <button onClick={() => setTab("system")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === "system" ? "border-eu text-eu" : "border-transparent text-slate"}`}>
            {isEn ? "System Library" : "Sistem Kütüphanesi"}
          </button>
          <button onClick={() => setTab("user")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === "user" ? "border-eu text-eu" : "border-transparent text-slate"}`}>
            {isEn ? "My Library" : "Kütüphanem"}
          </button>
        </div>

        {tab === "system" ? (
          <>
            {/* Kategori filtresi */}
            <div className="px-5 py-2.5 flex gap-1.5 overflow-x-auto border-b border-line">
              {SYSTEM_LOGO_CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setSystemCat(cat.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${systemCat === cat.id ? "bg-eu text-white" : "bg-surface text-slate"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
              {SYSTEM_LOGOS.filter((l) => l.category === systemCat).map((logo) => (
                <button key={logo.key} onClick={() => onAddSystem(logo.key, isEn ? logo.labelEn : logo.label)}
                  className="border-2 border-line rounded-xl p-3 flex flex-col items-center gap-2 hover:border-eu transition-all">
                  <div className="w-16 h-12 flex items-center justify-center">
                    <img src={logo.url} alt={logo.label} className="max-w-full max-h-full object-contain" />
                  </div>
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
                <input type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                }} />
              </label>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
              {userLib.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-mist text-sm">{isEn ? "Your library is empty. Upload logos above." : "Kütüphaneniz boş. Yukarıdan logo yükleyin."}</div>
              ) : userLib.map((img) => (
                <button key={img.id} onClick={() => onAddUser(img)}
                  className="border-2 border-line rounded-xl p-3 flex flex-col items-center gap-2 hover:border-eu transition-all">
                  <div className="w-16 h-12 flex items-center justify-center">
                    <img src={img.dataUrl} alt={img.label} className="max-w-full max-h-full object-contain" />
                  </div>
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

// ═══════════════════════════════════════════════════════════
// PDF çıktısı — yeni pencerede A4 print
// ═══════════════════════════════════════════════════════════
function printCover(cover: ReportCover, lang: "tr" | "en", userLib: UserLibraryImage[], bandLogoUrl?: string) {
  const frontText = lang === "tr" ? cover.frontTextTr : cover.frontTextEn;
  const backText = lang === "tr" ? cover.backTextTr : cover.backTextEn;

  const footerImgs = [...cover.footerLogos].sort((a, b) => a.order - b.order)
    .map((fl) => resolveFooterLogoSrc(fl, userLib))
    .filter(Boolean) as string[];

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const footerHtml = footerImgs.map((src) =>
    `<img src="${src.startsWith("data:") ? src : origin + src}" style="max-height:70%;max-width:120px;object-fit:contain;" />`
  ).join("");

  const bandHtml = bandLogoUrl
    ? `<img src="${bandLogoUrl.startsWith("data:") ? bandLogoUrl : origin + bandLogoUrl}" style="max-height:80%;max-width:60%;object-fit:contain;" />`
    : "";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${esc(cover.name)}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, 'Helvetica Neue', sans-serif; }
  .page { width: 210mm; height: 297mm; position: relative; page-break-after: always; overflow: hidden; }
  .page:last-child { page-break-after: auto; }
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .band { position: absolute; top: 18%; left: 0; right: 0; height: 19%; display: flex; align-items: center; justify-content: center; padding: 0 20%; }
  .front-text { position: absolute; top: 39%; left: 0; right: 0; height: 40%; padding: 0 12%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .front-text div { color: #fff; font-size: 15pt; line-height: 1.7; white-space: pre-wrap; font-weight: 500; }
  .footer { position: absolute; top: 80.5%; left: 0; right: 0; height: 10%; display: flex; align-items: center; justify-content: center; gap: 24px; padding: 0 8%; }
  .back-text { position: absolute; bottom: 12%; left: 0; right: 0; padding: 0 12%; text-align: center; }
  .back-text div { color: #fff; font-size: 12pt; line-height: 1.6; font-style: italic; white-space: pre-wrap; }
  @media print { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style></head>
<body onload="setTimeout(function(){window.print();},600)">
  <div class="page">
    <img class="bg" src="${origin}${TPL_FRONT}" />
    <div class="band">${bandHtml}</div>
    <div class="front-text"><div>${esc(frontText)}</div></div>
    <div class="footer">${footerHtml}</div>
  </div>
  <div class="page">
    <img class="bg" src="${origin}${TPL_BACK}" />
    <div class="back-text"><div>${esc(backText)}</div></div>
  </div>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
