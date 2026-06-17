"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { useLocale } from "@/lib/i18n/context";
import { getDataProvider } from "@/lib/data";
import type { Project, OwnershipRequest } from "@/lib/types";

export default function FirmaPanelPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { current, loading, logout } = useFirma();
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<OwnershipRequest[]>([]);
  const [myRequests, setMyRequests] = useState<OwnershipRequest[]>([]);
  const [allProjectsMap, setAllProjectsMap] = useState<Record<string, Project>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!current) { router.push("/giris"); return; }

    const db = getDataProvider();
    Promise.all([
      db.getProjects(),
      db.getOwnershipRequestsFor({ approverSubscriberId: current.id }),
      db.getOwnershipRequestsFor({ subscriberId: current.id }),
    ]).then(([allProjects, incoming, mine]) => {
      const map: Record<string, Project> = {};
      allProjects.forEach((p) => { map[p.id] = p; });
      setAllProjectsMap(map);
      setOwnedProjects(allProjects.filter((p) => p.ownerSubscriberId === current.id));
      setMemberProjects(allProjects.filter((p) =>
        p.ownerSubscriberId !== current.id &&
        p.consortiumMembers?.some((m) => m.subscriberId === current.id)
      ));
      setIncomingRequests(incoming.filter((r) => r.status === "bekliyor"));
      setMyRequests(mine);
      setDataLoading(false);
    });
  }, [current, loading, router]);

  const resolveRequest = async (id: string, status: "onaylandi" | "reddedildi") => {
    const db = getDataProvider();
    await db.resolveOwnershipRequest(id, status);
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
    setActionMsg(status === "onaylandi" ? t("firma_action_success_approved") : t("firma_action_success_rejected"));
    if (current) {
      const allProjects = await db.getProjects();
      setOwnedProjects(allProjects.filter((p) => p.ownerSubscriberId === current.id));
    }
  };

  if (loading || (current && dataLoading)) {
    return <PageShell><div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }

  if (!current) return null;

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("firma_panel_title") }]} />

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">{current.organization ?? current.name}</h1>
            <p className="text-slate text-sm mt-0.5">
              {current.accountType === "sirket" ? t("firma_account_type_sirket") : t("firma_account_type_stk")} {t("firma_account_label")} · {current.name}
            </p>
          </div>
          <button onClick={() => { logout(); router.push("/"); }}
            className="text-sm px-4 py-2 border border-line text-slate rounded-lg hover:bg-surface">
            {t("firma_logout")}
          </button>
        </div>

        {actionMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-6">
            {actionMsg}
          </div>
        )}

        {/* Onay bekleyen gelen talepler */}
        {incomingRequests.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-ink mb-1">{t("firma_pending_title")}</h2>
            <p className="text-slate text-sm mb-4">
              {t("firma_pending_sub")}
            </p>
            <div className="space-y-3">
              {incomingRequests.map((r) => {
                const project = [...ownedProjects].find((p) => p.id === r.projectId);
                return (
                  <div key={r.id} className="bg-white border border-eu/30 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-xs text-mist mb-1">
                          {project ? <Link href={`/projeler/${project.id}`} className="text-eu hover:underline font-semibold">{project.title}</Link> : r.projectId}
                        </p>
                        <h3 className="font-bold text-ink">{r.subscriberName}</h3>
                        <p className="text-xs text-mist mt-0.5">{t("firma_requested_role_member")}</p>
                        {r.note && <p className="text-sm text-slate mt-2 bg-surface rounded-lg p-3">{r.note}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => resolveRequest(r.id, "onaylandi")}
                          className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
                          {t("firma_approve")}
                        </button>
                        <button onClick={() => resolveRequest(r.id, "reddedildi")}
                          className="px-4 py-2 border border-line text-slate rounded-lg text-sm">
                          {t("firma_reject")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Yürütücüsü olunan projeler */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-ink mb-4">{t("firma_owned_title")}</h2>
          {ownedProjects.length === 0 ? (
            <p className="text-slate text-sm">{t("firma_owned_empty")}</p>
          ) : (
            <div className="space-y-3">
              {ownedProjects.map((p) => (
                <Link key={p.id} href={`/projeler/${p.id}`}
                  className="block bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-ink">{p.title}</h3>
                      <p className="text-xs text-mist mt-0.5">{p.ipaPeriod} · {p.budget ?? "—"}</p>
                    </div>
                    <span className="text-xs bg-eu-pale text-eu px-2 py-1 rounded-full font-semibold flex-shrink-0">{t("firma_owner_badge")}</span>
                  </div>
                  {p.consortiumMembers && p.consortiumMembers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-line">
                      <p className="text-xs text-mist mb-1.5">{t("firma_members_count")} ({p.consortiumMembers.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.consortiumMembers.map((m) => (
                          <span key={m.subscriberId} className="text-xs bg-surface text-slate px-2 py-0.5 rounded-full">
                            {m.subscriberName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Konsorsiyum üyesi olunan projeler */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-ink mb-4">{t("firma_member_title")}</h2>
          {memberProjects.length === 0 ? (
            <p className="text-slate text-sm">{t("firma_member_empty")}</p>
          ) : (
            <div className="space-y-3">
              {memberProjects.map((p) => (
                <Link key={p.id} href={`/projeler/${p.id}`}
                  className="block bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-sm transition-all">
                  <h3 className="font-bold text-ink">{p.title}</h3>
                  <p className="text-xs text-mist mt-0.5">
                    {t("firma_owner_label")}: {p.ownerSubscriberName ?? "—"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Kendi gönderdiğiniz talepler */}
        <div>
          <h2 className="text-lg font-bold text-ink mb-4">{t("firma_sent_requests_title")}</h2>
          {myRequests.length === 0 ? (
            <p className="text-slate text-sm">{t("firma_sent_requests_empty")}</p>
          ) : (
            <div className="space-y-2">
              {myRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-white border border-line rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-ink">{allProjectsMap[r.projectId]?.title ?? r.projectId}</p>
                    <p className="text-xs text-mist mt-0.5">
                      {r.requestedRole === "yurutucu" ? t("firma_role_owner_requested") : t("firma_role_member_requested")}
                      {" · "}
                      {r.approverType === "admin" ? t("firma_approver_admin") : t("firma_approver_owner")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    r.status === "onaylandi" ? "bg-green-100 text-green-700" :
                    r.status === "reddedildi" ? "bg-red-100 text-red-600" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {r.status === "onaylandi" ? t("firma_status_approved") : r.status === "reddedildi" ? t("firma_status_rejected") : t("firma_status_pending")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
