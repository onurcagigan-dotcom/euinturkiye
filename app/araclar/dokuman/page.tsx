"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { ProjectDocument, Project, Subscriber } from "@/lib/types";

const CATS = ["rapor", "sunum", "sozlesme", "diger"] as const;
const CAT_LABEL: Record<typeof CATS[number], string> = { rapor: "Rapor", sunum: "Sunum", sozlesme: "Sözleşme", diger: "Diğer" };
const ACCESS_LABEL: Record<string, string> = { herkes: "Herkese Açık", uye: "Üyelere", ekip: "Ekip" };
const ACCESS_COLOR: Record<string, string> = { herkes: "bg-green-100 text-green-700", uye: "bg-blue-100 text-blue-700", ekip: "bg-orange-100 text-orange-700" };

export default function DokumanAraciPage() {
  const { current: firma } = useFirma();
  const [docs, setDocs] = useState<ProjectDocument[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "rapor" as typeof CATS[number], accessLevel: "ekip" as "herkes" | "uye" | "ekip", projectId: "" });

  useEffect(() => {
    const db = getDataProvider();
    Promise.all([db.getDocuments(), db.getProjects()]).then(([d, p]) => {
      setDocs(d); setProjects(p); setLoading(false);
    });
  }, []);

  const myEditableProjects = useMemo(
    () => projects.filter((p) => firma && (p.ownerSubscriberId === firma.id || p.consortiumMembers?.some((m) => m.subscriberId === firma.id))),
    [projects, firma]
  );

  useEffect(() => {
    if (myEditableProjects.length > 0 && !form.projectId) {
      setForm((f) => ({ ...f, projectId: myEditableProjects[0].id }));
    }
  }, [myEditableProjects, form.projectId]);

  const projectById = useMemo(() => {
    const map: Record<string, Project> = {};
    projects.forEach((p) => { map[p.id] = p; });
    return map;
  }, [projects]);

  const myDocs = useMemo(() => docs.filter((d) => {
    const project = projectById[d.projectId];
    return firma && (project?.ownerSubscriberId === firma.id || project?.consortiumMembers?.some((m) => m.subscriberId === firma.id));
  }), [docs, projectById, firma]);

  const otherPublicDocs = useMemo(() => docs.filter((d) => {
    const project = projectById[d.projectId];
    if (!project) return false;
    const isMine = firma && (project.ownerSubscriberId === firma.id || project.consortiumMembers?.some((m) => m.subscriberId === firma.id));
    return !isMine && d.accessLevel === "herkes";
  }), [docs, projectById, firma]);

  const docsToShow = activeProject === "all" ? myDocs : docs.filter((d) => d.projectId === activeProject);

  const addDoc = async () => {
    if (!form.name || !form.projectId) return;
    const doc: ProjectDocument = { id: `doc-${Date.now()}`, ...form, fileSize: "—", uploadedAt: new Date().toISOString(), downloadCount: 0 };
    await getDataProvider().saveDocument(doc);
    setDocs((prev) => [doc, ...prev]);
    setShowForm(false);
    setForm((f) => ({ ...f, name: "" }));
  };

  const incrementDownload = async (id: string) => {
    await getDataProvider().incrementDownload(id);
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, downloadCount: d.downloadCount + 1 } : d)));
  };

  if (loading) {
    return <PageShell><div className="max-w-5xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div></PageShell>;
  }

  const projectFilterOptions = [{ id: "all", name: "Tüm Projeler" }, ...projects.filter((p) => docs.some((d) => d.projectId === p.id)).map((p) => ({ id: p.id, name: p.title }))];
  const shownMyDocs = activeProject === "all" ? myDocs : docsToShow;

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "E-Doküman Yönetimi" }]} />

        <h1 className="text-2xl font-bold text-ink mb-2">E-Doküman Yönetimi</h1>
        <p className="text-slate text-sm mb-6">Proje bazlı doküman kütüphanesi. Ekleme yalnızca projenin yürütücüsü veya konsorsiyum üyesi firmalara açıktır.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {projectFilterOptions.map((p) => (
            <button key={p.id} onClick={() => setActiveProject(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeProject === p.id ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-mist">{shownMyDocs.length} doküman</span>
          {firma && myEditableProjects.length > 0 ? (
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">+ Doküman Ekle</button>
          ) : firma ? (
            <span className="text-xs text-mist">Doküman eklemek için bir projenin yürütücüsü veya üyesi olmalısınız.</span>
          ) : (
            <Link href="/giris" className="text-xs text-eu font-semibold hover:underline">Doküman eklemek için giriş yapın</Link>
          )}
        </div>

        {showForm && (
          <div className="bg-eu-pale border border-eu/20 rounded-xl p-5 mb-5">
            <h3 className="font-bold text-ink mb-3">Yeni Doküman</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Dosya adı *" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <select value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                {myEditableProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof CATS[number] }))}
                className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                {CATS.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
              <select value={form.accessLevel} onChange={(e) => setForm((f) => ({ ...f, accessLevel: e.target.value as "herkes" | "uye" | "ekip" }))}
                className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                <option value="herkes">Herkese Açık</option>
                <option value="uye">Üyelere</option>
                <option value="ekip">Ekip</option>
              </select>
            </div>
            <p className="text-xs text-mist mb-3">Demo modunda meta-veri kaydedilir; Firebase bağlanınca gerçek yükleme aktif olur.</p>
            <div className="flex gap-2">
              <button onClick={addDoc} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Kaydet</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div>
            <h2 className="text-base font-bold text-ink mb-3">{firma ? "Kendi Proje Dokümanlarım" : "Tüm Dokümanlar"}</h2>
            <DocTable docs={shownMyDocs} showProjectCol={activeProject === "all"} projectById={projectById} onIncrement={incrementDownload} />
          </div>
          {firma && activeProject === "all" && otherPublicDocs.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-ink mb-1">Diğer Projelerin Herkese Açık Dokümanları</h2>
              <p className="text-xs text-mist mb-3">Başka firmaların paylaştığı, herkese açık dokümanlar.</p>
              <DocTable docs={otherPublicDocs} showProjectCol projectById={projectById} onIncrement={incrementDownload} />
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function DocTable({ docs, showProjectCol, projectById, onIncrement }: {
  docs: ProjectDocument[];
  showProjectCol: boolean;
  projectById: Record<string, Project>;
  onIncrement: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-line rounded-xl overflow-auto">
      <table className="w-full text-sm min-w-[540px]">
        <thead className="bg-surface border-b border-line">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-slate">Dosya Adı</th>
            {showProjectCol && <th className="text-left px-4 py-3 font-semibold text-slate">Proje</th>}
            <th className="text-left px-4 py-3 font-semibold text-slate">Kategori</th>
            <th className="text-left px-4 py-3 font-semibold text-slate">Erişim</th>
            <th className="text-right px-4 py-3 font-semibold text-slate">İndirme</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            <tr><td colSpan={showProjectCol ? 6 : 5} className="text-center py-8 text-mist">Doküman bulunamadı.</td></tr>
          ) : docs.map((d) => (
            <tr key={d.id} className="border-t border-line hover:bg-surface/50">
              <td className="px-4 py-3 font-medium text-ink">📄 {d.name}</td>
              {showProjectCol && <td className="px-4 py-3 text-slate text-xs">{projectById[d.projectId]?.title ?? d.projectId}</td>}
              <td className="px-4 py-3 text-slate">{CAT_LABEL[d.category as typeof CATS[number]] ?? d.category}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ACCESS_COLOR[d.accessLevel] ?? ""}`}>
                  {ACCESS_LABEL[d.accessLevel] ?? d.accessLevel}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-slate font-semibold">{d.downloadCount}</td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => onIncrement(d.id)} className="text-eu text-xs font-semibold hover:underline">İndir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
