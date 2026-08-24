"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProjectProgressBar } from "@/components/ProjectProgressBar";
import { ProjectLocationMap } from "@/components/ProjectLocationMap";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import type { Project, Sector, Donor, BlogPost, ExpertProfile, OwnershipRequest, Stakeholder, ProjectDocument, EventItem, Listing, TrainingVideo } from "@/lib/types";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useLocale();
  const isEn = locale === "en";
  const { current: firma } = useFirma();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [sector, setSector] = useState<Sector | null>(null);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [experts, setExperts] = useState<{ profile: ExpertProfile; expertise: string; role: string }[]>([]);
  const [myRequest, setMyRequest] = useState<OwnershipRequest | null>(null);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [relatedEvents, setRelatedEvents] = useState<EventItem[]>([]);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [trainingMaterials, setTrainingMaterials] = useState<TrainingVideo[]>([]);
  const [editLogs, setEditLogs] = useState<import("@/lib/types").EditLog[]>([]);

  // Talep formu state'i
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestRole, setRequestRole] = useState<"yurutucu" | "uye">("uye");
  const [requestNote, setRequestNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const db = getDataProvider();
    db.getProject(id).then(async (p) => {
      setProject(p);
      if (p) {
        const [sec, don, posts, exp, stk, docs, allEvents, allListings, allVideos, logs] = await Promise.all([
          db.getSector(p.sectorId), db.getDonor(p.donorId), db.getBlogPosts(), db.getProjectExperts(p.id),
          db.getStakeholders(p.id), db.getDocuments(p.id), db.getEvents(), db.getListings(), db.getTrainingVideos(),
          db.getEditLogs(p.id),
        ]);
        setSector(sec);
        setDonor(don);
        setRelatedPosts(posts.filter((bp) => bp.projectId === p.id).slice(0, 3));
        setExperts(exp);
        setStakeholders(stk);
        setDocuments(docs);
        setRelatedEvents(allEvents.filter((e) => e.projectId === p.id));
        setRelatedListings(allListings.filter((l) => l.projectId === p.id && l.isActive !== false));
        setTrainingMaterials(allVideos.filter((v) => v.projectId === p.id));
        setEditLogs(logs);

        if (firma) {
          const myReqs = await db.getOwnershipRequestsFor({ subscriberId: firma.id, projectId: p.id });
          setMyRequest(myReqs[0] ?? null);
        }
      }
    });
  }, [id, firma]);

  if (project === undefined) {
    return <PageShell><div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }

  if (project === null) {
    return (
      <PageShell>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-ink mb-2">{t("notfound_title")}</h1>
          <Link href="/projeler" className="text-eu hover:underline">{t("listing_all_back")}</Link>
        </div>
      </PageShell>
    );
  }

  const statusLabel = project.status === "devam" ? t("status_ongoing") : t("status_completed");

  const isOwner = firma && project.ownerSubscriberId === firma.id;
  const isMember = firma && project.consortiumMembers?.some((m) => m.subscriberId === firma.id);
  const hasOwner = !!project.ownerSubscriberId;

  const submitRequest = async () => {
    if (!firma || !project) return;
    setSubmitting(true);
    const db = getDataProvider();
    const req = await db.createOwnershipRequest({
      projectId: project.id,
      subscriberId: firma.id,
      subscriberName: firma.organization ?? firma.name,
      requestedRole: hasOwner ? "uye" : requestRole,
      note: requestNote || undefined,
    });
    setMyRequest(req);
    setSubmitting(false);
    setSubmitted(true);
    setShowRequestForm(false);
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: t("breadcrumb_home"), href: "/" },
          { label: t("projects_title"), href: "/projeler" },
          { label: project.title },
        ]} />

        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            project.status === "devam" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {statusLabel}
          </span>
          <span className="text-xs text-mist">{project.ipaPeriod}</span>
          {sector && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sector.color}20`, color: sector.color }}>
              {isEn ? (sector.nameEn ?? sector.name) : sector.name}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-ink leading-tight mb-4">{project.title}</h1>
        <p className="text-slate text-lg leading-relaxed mb-8">{project.objective ?? project.summary}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface rounded-2xl p-6 mb-6">
          <Info label={t("info_donor")} value={isEn ? (donor?.nameEn ?? donor?.name ?? project.donorId) : (donor?.name ?? project.donorId)} />
          <Info label={t("info_beneficiary")} value={project.beneficiary} />
          {project.priorityArea && <Info label={isEn ? "Priority Area" : "Öncelik Alanı"} value={project.priorityArea} />}
          {project.euBudget && (
            <Info label={isEn ? "EU Contribution" : "AB Katkısı"} value={"€" + project.euBudget.toLocaleString("tr-TR")} />
          )}
          {project.totalBudget && (
            <Info label={isEn ? "Total Budget" : "Toplam Bütçe"} value={"€" + project.totalBudget.toLocaleString("tr-TR")} />
          )}
          {!project.euBudget && project.budget && <Info label={t("info_budget")} value={project.budget} />}
          {project.startDate && <Info label={t("info_start")} value={project.startDate} />}
          {project.endDate && <Info label={t("info_end")} value={project.endDate} />}
          {project.locations.length > 0 && (
            <Info label={t("info_locations")} value={project.locations.join(", ")} />
          )}
        </div>

        {/* Yürütücü ve konsorsiyum bilgisi */}
        {(project.ownerSubscriberName || (project.consortiumMembers && project.consortiumMembers.length > 0)) && (
          <div className="mb-6 bg-white border border-line rounded-2xl p-5">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("consortium_title")}</h2>
            <div className="flex flex-wrap gap-2">
              {project.ownerSubscriberName && (
                <span className="inline-flex items-center gap-1.5 text-sm bg-eu text-white px-3 py-1.5 rounded-full font-medium">
                  🏆 {project.ownerSubscriberName}
                  <span className="text-xs text-blue-200">{t("consortium_role_owner")}</span>
                </span>
              )}
              {project.consortiumMembers?.map((m) => (
                <span key={m.subscriberId} className="inline-flex items-center gap-1.5 text-sm bg-eu-pale text-eu px-3 py-1.5 rounded-full font-medium">
                  {m.subscriberName}
                  {m.role && <span className="text-xs text-eu/70">{m.role}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Proje Web Sitesi Butonu — sadece proje sahibi veya admin2 görür */}
        {(isOwner || firma?.isAdmin2) && (
          <div className="mb-6">
            <Link href={`/projeler/${project.id}/website`}
              className="inline-flex items-center gap-2.5 px-5 py-3 border-2 border-eu text-eu rounded-xl font-semibold text-sm hover:bg-eu hover:text-white transition-all group">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              🌐 Proje Web Sitesi Oluştur
              <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}

        {project.startDate && project.endDate && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("progress_title")}</h2>
            <ProjectProgressBar
              project={project}
              variant="full"
              labels={{
                notStarted: t("progress_not_started"),
                completed: t("progress_completed"),
                daysRemaining: t("progress_days_remaining"),
                needsUpdate: t("progress_needs_update"),
              }}
            />
          </div>
        )}

        {project.locations.length > 0 && project.locations[0] !== "Türkiye geneli" && (
          <div className="mb-10">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("info_locations")}</h2>
            <ProjectLocationMap locations={project.locations} />
          </div>
        )}

        {project.objective && <Section title={t("project_objective")} content={project.objective} />}
        {project.expectedOutputs && <Section title={t("project_outputs")} content={project.expectedOutputs} />}
        {project.activities && <Section title={t("project_activities")} content={project.activities} />}

        {(stakeholders.length > 0 || experts.length > 0) && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-ink mb-4">{t("project_team")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stakeholders.map((s) => (
                <div key={s.id} className="flex items-start gap-3 p-4 bg-white border border-line rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-eu-pale flex items-center justify-center text-eu font-bold flex-shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink text-sm">{s.name}</p>
                    <p className="text-xs text-mist">{s.role}{s.organization ? ` · ${s.organization}` : ""}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.type === "kamu" ? "bg-blue-100 text-blue-700" :
                      s.type === "uzman" ? "bg-purple-100 text-purple-700" :
                      s.type === "ekip" ? "bg-green-100 text-green-700" :
                      s.type === "tedarikci" ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {s.type === "kamu" ? t("team_type_kamu") :
                       s.type === "uzman" ? t("team_type_uzman") :
                       s.type === "ekip" ? t("team_type_ekip") :
                       s.type === "tedarikci" ? t("team_type_tedarikci") : t("team_type_diger")}
                    </span>
                  </div>
                </div>
              ))}
              {experts.map((e, i) => (
                <Link key={`expert-${i}`} href={`/uzmanlar/${e.profile.id}`}
                  className="flex items-center gap-3 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-full bg-eu-pale flex items-center justify-center text-eu font-bold flex-shrink-0">
                    {e.profile.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink text-sm">{e.profile.name}</p>
                    <p className="text-xs text-mist">{e.role}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
                      {t("team_type_uzman")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {documents.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-ink mb-4">{t("project_documents")}</h2>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 p-4 bg-white border border-line rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">
                      {doc.category === "rapor" ? "📊" : doc.category === "sunum" ? "📑" : doc.category === "sozlesme" ? "📜" : "📁"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-mist">
                        {doc.fileSize ?? ""} {doc.fileSize ? "·" : ""} {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                    doc.accessLevel === "herkes" ? "bg-green-100 text-green-700" :
                    doc.accessLevel === "uye" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {doc.accessLevel === "herkes" ? t("doc_access_herkes") :
                     doc.accessLevel === "uye" ? t("doc_access_uye") : t("doc_access_ekip")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proje İlanları */}
        {relatedListings.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-ink mb-4">Bu Projeye Ait İlanlar</h2>
            <div className="space-y-2">
              {relatedListings.map((l) => {
                const TYPE_LABEL: Record<string, string> = { is: "İş İlanı", satinalma: "Satınalma", ihale: "İhale" };
                const TYPE_COLOR: Record<string, string> = { is: "bg-blue-100 text-blue-700", satinalma: "bg-orange-100 text-orange-700", ihale: "bg-purple-100 text-purple-700" };
                const isExpired = l.expiresAt ? new Date(l.expiresAt) < new Date() : false;
                return (
                  <Link key={l.id} href={`/ilanlar/${l.id}`}
                    className={`flex items-center justify-between gap-3 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all ${isExpired ? "opacity-60" : ""}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_COLOR[l.type]}`}>{TYPE_LABEL[l.type]}</span>
                        {isExpired && <span className="text-xs text-mist">Süresi dolmuş</span>}
                      </div>
                      <p className="font-semibold text-ink text-sm truncate">{l.title}</p>
                      {l.subject && <p className="text-xs text-mist mt-0.5">{l.subject}</p>}
                    </div>
                    <div className="text-xs text-mist flex-shrink-0 text-right">
                      {l.deadline && <p>Son: {new Date(l.deadline).toLocaleDateString("tr-TR")}</p>}
                      {l.budget && <p className="text-eu font-semibold">{l.budget}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {relatedEvents.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-ink mb-4">{t("project_events")}</h2>
            <div className="space-y-3">
              {relatedEvents.map((ev) => {
                const d = new Date(ev.date);
                return (
                  <Link key={ev.id} href={`/etkinlikler/${ev.id}`}
                    className="flex items-center gap-4 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                    <div className="flex-shrink-0 text-center bg-eu-pale rounded-lg p-2 w-14">
                      <div className="text-lg font-extrabold text-eu">{d.getDate()}</div>
                      <div className="text-[10px] text-eu font-semibold uppercase">
                        {d.toLocaleDateString("tr", { month: "short" })}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-sm truncate">{ev.title}</p>
                      <p className="text-xs text-mist">📍 {ev.location}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {relatedPosts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-ink mb-5">{t("project_news")}</h2>
            <div className="space-y-3">
              {relatedPosts.map((post) => (
                <Link key={post.id} href={`/gundem/${post.slug}`}
                  className="flex items-start gap-4 p-4 border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                  {post.coverImage ? (
              <img src={post.coverImage} alt={post.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="flex-shrink-0 text-xs text-eu font-semibold bg-eu-pale px-2 py-1 rounded">
                      {post.category}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-ink text-sm">{post.title}</h3>
                    <p className="text-xs text-mist mt-1">{post.category} · {new Date(post.publishedAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/gundem" className="inline-block mt-4 text-eu text-sm font-semibold hover:underline">
              {t("news_all")} →
            </Link>
          </div>
        )}

        {/* Proje Eğitim Materyalleri */}
        {trainingMaterials.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-ink mb-4">Proje Eğitim Materyalleri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trainingMaterials.map((v) => (
                <div key={v.id} className="bg-white border border-line rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{v.kind === "video" ? "🎬" : "📄"}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink text-sm">{v.title}</p>
                    {v.description && <p className="text-xs text-mist mt-0.5 line-clamp-2">{v.description}</p>}
                    {v.keywords && v.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {v.keywords.slice(0, 3).map((k) => (
                          <span key={k} className="text-xs bg-eu-pale text-eu px-1.5 py-0.5 rounded">#{k}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/araclar/egitim" className="text-xs text-eu hover:underline mt-2 inline-block">
              Tüm eğitim materyallerini gör →
            </Link>
          </div>
        )}

        {/* Admin2 Edit Logları */}
        {editLogs.length > 0 && (
          <div className="mb-8 pt-6 border-t border-line">
            <p className="text-xs text-mist">
              Son düzenleme: {editLogs[0].editorName} tarafından {new Date(editLogs[0].editedAt).toLocaleDateString("tr-TR")} tarihinde güncellendi.
            </p>
          </div>
        )}

        {/* İletişim & Sosyal Medya */}
        {(project.contactEmail || project.contactPhone || project.projectWebsiteUrl ||
          project.socialTwitter || project.socialLinkedin || project.socialFacebook ||
          project.socialInstagram || project.socialYoutube) && (
          <div className="mb-8 p-5 bg-surface rounded-2xl border border-line">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-4">
              {isEn ? "Contact & Social Media" : "İletişim & Sosyal Medya"}
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.contactEmail && (
                <a href={`mailto:${project.contactEmail}`}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-xl text-sm text-slate hover:border-eu hover:text-eu transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  {project.contactEmail}
                </a>
              )}
              {project.contactPhone && (
                <a href={`tel:${project.contactPhone}`}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-xl text-sm text-slate hover:border-eu hover:text-eu transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  {project.contactPhone}
                </a>
              )}
              {project.projectWebsiteUrl && (
                <a href={project.projectWebsiteUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-xl text-sm text-eu hover:shadow-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  {isEn ? "Project Website" : "Proje Web Sitesi"}
                </a>
              )}
              {[
                { val: project.socialTwitter, icon: "𝕏", color: "#000", label: "X/Twitter" },
                { val: project.socialLinkedin, icon: "in", color: "#0A66C2", label: "LinkedIn" },
                { val: project.socialFacebook, icon: "f", color: "#1877F2", label: "Facebook" },
                { val: project.socialInstagram, icon: "📷", color: "#E1306C", label: "Instagram" },
                { val: project.socialYoutube, icon: "▶", color: "#FF0000", label: "YouTube" },
              ].filter(s => s.val).map((s) => {
                const href = s.val!.startsWith("http") ? s.val! : `https://${s.val!.replace(/^@/, "")}`;
                return (
                  <a key={s.label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-xl text-sm font-semibold hover:shadow-sm transition-colors"
                    style={{ color: s.color }}>
                    <span className="text-base">{s.icon}</span>
                    {s.label}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Sahiplenme / Konsorsiyum katılım bölümü */}
        <div className="mt-12">
          {isOwner ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4">
              <div className="text-3xl">🏆</div>
              <div>
                <h3 className="font-bold text-ink mb-1">{t("consortium_is_owner_title")}</h3>
                <p className="text-slate text-sm">
                  {t("consortium_is_owner_sub")}{" "}
                  <Link href="/firma" className="text-eu font-semibold hover:underline">{t("consortium_from_panel")}</Link>
                  {" "}{t("consortium_manage")}
                </p>
              </div>
            </div>
          ) : isMember ? (
            <div className="bg-eu-pale border border-eu/20 rounded-xl p-6 flex items-start gap-4">
              <div className="text-3xl">🤝</div>
              <div>
                <h3 className="font-bold text-ink mb-1">{t("consortium_is_member_title")}</h3>
                <p className="text-slate text-sm">{t("consortium_owner_label")}: {project.ownerSubscriberName}</p>
              </div>
            </div>
          ) : firma ? (
            myRequest ? (
              <div className="bg-white border border-line rounded-xl p-6 flex items-start gap-4">
                <div className="text-3xl">{myRequest.status === "bekliyor" ? "⏳" : myRequest.status === "onaylandi" ? "✅" : "❌"}</div>
                <div>
                  <h3 className="font-bold text-ink mb-1">
                    {myRequest.status === "bekliyor" ? t("consortium_request_pending_title") : myRequest.status === "onaylandi" ? t("consortium_request_approved_title") : t("consortium_request_rejected_title")}
                  </h3>
                  <p className="text-slate text-sm">
                    {myRequest.requestedRole === "yurutucu" ? t("consortium_role_owner") : t("consortium_role_member")} {t("consortium_applied_as")}.
                    {" "}{myRequest.approverType === "admin" ? t("consortium_approver_admin") : t("consortium_approver_owner")}
                  </p>
                </div>
              </div>
            ) : showRequestForm ? (
              <div className="bg-eu-pale border border-eu/20 rounded-xl p-6">
                <h3 className="font-bold text-ink mb-1">{firma.organization ?? firma.name} {t("consortium_apply_title")}</h3>
                <p className="text-slate text-sm mb-4">
                  {hasOwner
                    ? <>{t("consortium_apply_has_owner")} <strong>{project.ownerSubscriberName}</strong>. {t("consortium_apply_will_go_to")}</>
                    : t("consortium_apply_no_owner")}
                </p>

                {!hasOwner && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-ink mb-2">{t("consortium_which_role")}</label>
                    <div className="flex gap-3">
                      <button onClick={() => setRequestRole("yurutucu")}
                        className={`flex-1 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${requestRole === "yurutucu" ? "border-eu bg-eu text-white" : "border-line text-slate"}`}>
                        {t("consortium_role_owner_btn")}
                      </button>
                      <button onClick={() => setRequestRole("uye")}
                        className={`flex-1 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${requestRole === "uye" ? "border-eu bg-eu text-white" : "border-line text-slate"}`}>
                        {t("consortium_role_member_btn")}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-ink mb-1">{t("consortium_note_label")}</label>
                  <textarea value={requestNote} onChange={(e) => setRequestNote(e.target.value)}
                    rows={3} placeholder={t("consortium_note_placeholder")}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
                </div>

                <div className="flex gap-2">
                  <button onClick={submitRequest} disabled={submitting}
                    className="px-5 py-2.5 bg-eu text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                    {submitting ? t("consortium_sending") : t("consortium_send")}
                  </button>
                  <button onClick={() => setShowRequestForm(false)} className="px-5 py-2.5 border border-line text-slate rounded-lg text-sm">
                    {t("consortium_cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-eu-pale border border-eu/20 rounded-xl p-6 flex items-start gap-4">
                <div className="text-3xl">🏢</div>
                <div>
                  <h3 className="font-bold text-ink mb-1">{t("project_owner_q")}</h3>
                  <p className="text-slate text-sm mb-3">
                    {hasOwner
                      ? <>{t("consortium_apply_has_owner")} <strong>{project.ownerSubscriberName}</strong>. {t("consortium_can_apply_member")}</>
                      : t("consortium_can_apply_either")}
                  </p>
                  <button onClick={() => setShowRequestForm(true)}
                    className="inline-block px-4 py-2 bg-eu text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors">
                    {t("consortium_apply_button")}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="bg-eu-pale border border-eu/20 rounded-xl p-6 flex items-start gap-4">
              <div className="text-3xl">🏢</div>
              <div>
                <h3 className="font-bold text-ink mb-1">{t("project_owner_q")}</h3>
                <p className="text-slate text-sm mb-3">{t("project_owner_sub")}</p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/giris" className="inline-block px-4 py-2 bg-eu text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors">
                    {t("consortium_login_as_firma")}
                  </Link>
                  <Link href="/kayit" className="inline-block px-4 py-2 border border-eu text-eu text-sm font-semibold rounded-lg hover:bg-eu-pale transition-colors">
                    {t("project_owner_cta")}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-mist font-semibold">{label}</p>
      <p className="text-ink font-medium mt-0.5 text-sm">{value}</p>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-ink mb-3">{title}</h2>
      <p className="text-slate leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}
