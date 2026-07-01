"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { Campaign, Subscriber, BlogPost, Project } from "@/lib/types";

type RecipientMode = "tags" | "explicit";

export default function BultenPage() {
  const { current: firma, loading: firmaLoading } = useFirma();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [intro, setIntro] = useState("");
  const [includedPostIds, setIncludedPostIds] = useState<string[]>([]);
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("tags");
  const [targetTagsText, setTargetTagsText] = useState("");
  const [explicitRecipientIds, setExplicitRecipientIds] = useState<string[]>([]);
  const [postFilterProjectId, setPostFilterProjectId] = useState<string>("");

  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    if (!firma) { setLoading(false); return; }
    const db = getDataProvider();
    Promise.all([db.getCampaigns(), db.getSubscribers(), db.getBlogPosts(), db.getProjects()]).then(
      ([camps, subs, blogPosts, projs]) => {
        setCampaigns(camps);
        setSubscribers(subs);
        setPosts(blogPosts);
        setProjects(projs);
        setLoading(false);
      }
    );
  }, [firma]);

  const allTags = Array.from(new Set(subscribers.flatMap((s) => s.tags)));

  const targetedByTags = (tags: string[]) =>
    tags.length === 0 ? subscribers : subscribers.filter((s) => tags.some((t) => s.tags.includes(t)));

  const recipientCount = useMemo(() => {
    if (recipientMode === "explicit") return explicitRecipientIds.length;
    const tags = targetTagsText.split(",").map((t) => t.trim()).filter(Boolean);
    return targetedByTags(tags).length;
  }, [recipientMode, explicitRecipientIds, targetTagsText, subscribers]);

  const filteredPosts = useMemo(
    () => (postFilterProjectId ? posts.filter((p) => p.projectId === postFilterProjectId) : posts),
    [posts, postFilterProjectId]
  );

  const togglePost = (id: string) =>
    setIncludedPostIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleExplicitRecipient = (id: string) =>
    setExplicitRecipientIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const buildBody = () => {
    const selected = posts.filter((p) => includedPostIds.includes(p.id));
    const postsHtml = selected.map((p) => `— ${p.title}: ${p.excerpt}`).join("\n\n");
    return [intro, postsHtml].filter(Boolean).join("\n\n");
  };

  const resetForm = () => {
    setSubject(""); setIntro(""); setIncludedPostIds([]);
    setRecipientMode("tags"); setTargetTagsText(""); setExplicitRecipientIds([]);
  };

  const createCampaign = async () => {
    if (!subject || (!intro && includedPostIds.length === 0)) return;
    const tags = recipientMode === "tags" ? targetTagsText.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const camp: Campaign = {
      id: `camp-${Date.now()}`,
      subject,
      body: buildBody(),
      targetTags: tags,
      includedPostIds,
      explicitRecipientIds: recipientMode === "explicit" ? explicitRecipientIds : undefined,
      status: "taslak",
      createdAt: new Date().toISOString(),
      recipientCount: 0,
      openCount: 0,
    };
    await getDataProvider().saveCampaign(camp);
    setCampaigns((prev) => [camp, ...prev]);
    resetForm();
    setCreating(false);
  };

  const sendCampaign = async (id: string) => {
    const camp = campaigns.find((c) => c.id === id);
    if (!camp || camp.status !== "taslak") return;
    const count = camp.explicitRecipientIds?.length
      ? camp.explicitRecipientIds.length
      : targetedByTags(camp.targetTags).length;
    const updated: Campaign = { ...camp, status: "gonderildi", sentAt: new Date().toISOString(), recipientCount: count, openCount: 0 };
    await getDataProvider().saveCampaign(updated);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const deleteCampaign = async (id: string) => {
    await getDataProvider().removeCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  if (firmaLoading || loading) {
    return <PageShell><div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div></PageShell>;
  }

  if (!firma) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Bülten Gönderimi" }]} />
          <h1 className="text-2xl font-bold text-ink mb-3">Bülten Gönderimi</h1>
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-slate mb-4">Bülten oluşturmak ve göndermek için firma hesabınızla giriş yapmalısınız.</p>
            <Link href="/giris" className="inline-block px-5 py-2.5 bg-eu text-white rounded-lg text-sm font-semibold">Giriş Yap</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Bülten Gönderimi" }]} />

        <h1 className="text-2xl font-bold text-ink mb-2">Bülten Gönderimi</h1>
        <p className="text-slate text-sm mb-6">Proje haberlerinizden seçim yapın, bülten içeriğini oluşturun ve hedefli alıcılara gönderin.</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-surface rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-ink">{subscribers.length}</div>
            <div className="text-xs text-mist">Toplam Abone</div>
          </div>
          <div className="bg-surface rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{campaigns.filter((c) => c.status === "gonderildi").length}</div>
            <div className="text-xs text-mist">Gönderilen Kampanya</div>
          </div>
          <div className="bg-surface rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{campaigns.filter((c) => c.status === "taslak").length}</div>
            <div className="text-xs text-mist">Taslak</div>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button onClick={() => setCreating(true)} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
            + Yeni Bülten
          </button>
        </div>

        {creating && (
          <div className="bg-eu-pale border border-eu/20 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-ink mb-4">Yeni Bülten</h3>

            {/* Konu + giriş */}
            <div className="space-y-3 mb-5">
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="E-posta konusu *"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <textarea value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="Giriş metni (opsiyonel — haberlerden önce gösterilir)" rows={3}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
            </div>

            {/* Haber seçimi */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-mist">Bültene Eklenecek Haberler</label>
                <select value={postFilterProjectId} onChange={(e) => setPostFilterProjectId(e.target.value)}
                  className="text-xs px-2 py-1 border border-line rounded-lg bg-white focus:outline-none focus:border-eu">
                  <option value="">Tüm projeler</option>
                  {projects.filter((p) => posts.some((post) => post.projectId === p.id)).map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="bg-white border border-line rounded-xl max-h-64 overflow-y-auto divide-y divide-line">
                {filteredPosts.length === 0 ? (
                  <p className="text-sm text-mist p-4">Bu filtreye uyan haber bulunamadı.</p>
                ) : (
                  filteredPosts.map((p) => (
                    <label key={p.id} className="flex items-start gap-3 p-3 cursor-pointer hover:bg-surface">
                      <input type="checkbox" checked={includedPostIds.includes(p.id)} onChange={() => togglePost(p.id)} className="mt-1" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{p.title}</p>
                        <p className="text-xs text-mist line-clamp-1">{p.excerpt}</p>
                        <p className="text-xs text-mist mt-0.5">{p.category} · {new Date(p.publishedAt).toLocaleDateString("tr-TR")}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-mist mt-1.5">{includedPostIds.length} haber seçildi.</p>
            </div>

            {/* Alıcı tanımlama */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-mist mb-2 block">Alıcılar</label>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setRecipientMode("tags")}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${recipientMode === "tags" ? "bg-ink text-white" : "bg-surface text-slate"}`}>
                  Etikete Göre
                </button>
                <button onClick={() => setRecipientMode("explicit")}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${recipientMode === "explicit" ? "bg-ink text-white" : "bg-surface text-slate"}`}>
                  Kişi Seçerek
                </button>
              </div>

              {recipientMode === "tags" ? (
                <div>
                  <input value={targetTagsText} onChange={(e) => setTargetTagsText(e.target.value)}
                    placeholder={`Hedef etiketler (virgülle ayır, boş = herkese). Mevcut: ${allTags.join(", ")}`}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                </div>
              ) : (
                <div className="bg-white border border-line rounded-xl max-h-48 overflow-y-auto divide-y divide-line">
                  {subscribers.map((s) => (
                    <label key={s.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-surface">
                      <input type="checkbox" checked={explicitRecipientIds.includes(s.id)} onChange={() => toggleExplicitRecipient(s.id)} />
                      <div>
                        <span className="text-sm font-medium text-ink">{s.organization ?? s.name}</span>
                        <span className="text-xs text-mist ml-2">{s.email}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-mist mt-1.5">Hedef alıcı sayısı: <strong className="text-ink">{recipientCount}</strong></p>
            </div>

            <div className="flex gap-2">
              <button onClick={createCampaign} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Taslak Oluştur</button>
              <button onClick={() => { setCreating(false); resetForm(); }} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        )}

        {/* Önizleme modalı */}
        {previewCampaign && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setPreviewCampaign(null)}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs text-mist mb-1">Konu</p>
              <h3 className="font-bold text-ink mb-4">{previewCampaign.subject}</h3>
              <div className="whitespace-pre-wrap text-sm text-slate border-t border-line pt-4">{previewCampaign.body}</div>
              <button onClick={() => setPreviewCampaign(null)} className="mt-5 px-4 py-2 border border-line text-slate rounded-lg text-sm">Kapat</button>
            </div>
          </div>
        )}

        {/* Kampanya listesi */}
        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <p className="text-sm text-mist text-center py-8">Henüz bülten oluşturulmadı.</p>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="bg-white border border-line rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === "gonderildi" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {c.status === "gonderildi" ? "Gönderildi ✓" : "Taslak"}
                      </span>
                      {c.targetTags.length > 0 && c.targetTags.map((t) => (
                        <span key={t} className="text-xs bg-surface text-mist px-2 py-0.5 rounded">{t}</span>
                      ))}
                      {c.includedPostIds && c.includedPostIds.length > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{c.includedPostIds.length} haber</span>
                      )}
                    </div>
                    <h3 className="font-bold text-ink">{c.subject}</h3>
                    <p className="text-sm text-slate mt-1 line-clamp-2">{c.body}</p>
                    {c.status === "gonderildi" && (
                      <div className="flex gap-4 mt-2 text-xs text-mist">
                        <span>Alıcı: <strong className="text-ink">{c.recipientCount}</strong></span>
                        <span>Açılma: <strong className="text-ink">{c.openCount}</strong> ({c.recipientCount > 0 ? Math.round((c.openCount / c.recipientCount) * 100) : 0}%)</span>
                        {c.sentAt && <span>{new Date(c.sentAt).toLocaleDateString("tr-TR")}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setPreviewCampaign(c)} className="px-3 py-1.5 border border-line text-slate rounded-lg text-xs font-semibold hover:bg-surface">
                      Önizle
                    </button>
                    {c.status === "taslak" && (
                      <button onClick={() => sendCampaign(c.id)} className="px-3 py-1.5 bg-eu text-white rounded-lg text-xs font-semibold">
                        Gönder
                      </button>
                    )}
                    <button onClick={() => deleteCampaign(c.id)} className="px-3 py-1.5 border border-line text-mist rounded-lg text-xs hover:text-tr">
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}
