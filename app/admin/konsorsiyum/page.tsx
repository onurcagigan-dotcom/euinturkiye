"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import type { OwnershipRequest, Project } from "@/lib/types";

export default function AdminKonsorsiyumPage() {
  const [requests, setRequests] = useState<OwnershipRequest[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const db = getDataProvider();
    const [allRequests, allProjects] = await Promise.all([db.getOwnershipRequests(), db.getProjects()]);
    setRequests(allRequests.filter((r) => r.approverType === "admin"));
    const map: Record<string, Project> = {};
    allProjects.forEach((p) => { map[p.id] = p; });
    setProjects(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resolve = async (id: string, status: "onaylandi" | "reddedildi") => {
    const db = getDataProvider();
    await db.resolveOwnershipRequest(id, status);
    setMsg(status === "onaylandi" ? "Talep onaylandı." : "Talep reddedildi.");
    await load();
  };

  const pending = requests.filter((r) => r.status === "bekliyor");
  const resolved = requests.filter((r) => r.status !== "bekliyor");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-ink mb-2">Konsorsiyum & Sahiplik Talepleri</h1>
      <p className="text-slate text-sm mb-8">
        Yürütücüsü olmayan projelere yapılan başvurular (admin onayı gerektirir).
        Yürütücüsü olan projelerdeki üyelik talepleri ilgili firmanın kendi panelinde onaylanır.
      </p>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-6">{msg}</div>
      )}

      {loading ? (
        <p className="text-slate text-sm">Yükleniyor…</p>
      ) : (
        <>
          {/* Bekleyen talepler */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-ink mb-4">Bekleyen Talepler ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="text-slate text-sm">Bekleyen talep yok.</p>
            ) : (
              <div className="space-y-3">
                {pending.map((r) => {
                  const project = projects[r.projectId];
                  return (
                    <div key={r.id} className="bg-white border border-line rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-xs text-mist mb-1">
                            {project ? (
                              <Link href={`/projeler/${project.id}`} target="_blank" className="text-eu hover:underline font-semibold">
                                {project.title}
                              </Link>
                            ) : r.projectId}
                          </p>
                          <h3 className="font-bold text-ink">{r.subscriberName}</h3>
                          <p className="text-xs text-mist mt-0.5">
                            Talep edilen rol: <strong>{r.requestedRole === "yurutucu" ? "Yürütücü" : "Konsorsiyum Üyesi"}</strong>
                          </p>
                          {r.note && <p className="text-sm text-slate mt-2 bg-surface rounded-lg p-3">{r.note}</p>}
                          <p className="text-xs text-mist mt-2">{new Date(r.createdAt).toLocaleDateString("tr")}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => resolve(r.id, "onaylandi")}
                            className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
                            Onayla
                          </button>
                          <button onClick={() => resolve(r.id, "reddedildi")}
                            className="px-4 py-2 border border-line text-slate rounded-lg text-sm">
                            Reddet
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Geçmiş talepler */}
          {resolved.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-ink mb-4">Geçmiş Talepler</h2>
              <div className="bg-white border border-line rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface border-b border-line">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate">Proje</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate">Firma</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate">Rol</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolved.map((r) => (
                      <tr key={r.id} className="border-t border-line">
                        <td className="px-4 py-3 text-ink">{projects[r.projectId]?.title ?? r.projectId}</td>
                        <td className="px-4 py-3 text-slate">{r.subscriberName}</td>
                        <td className="px-4 py-3 text-slate text-xs">{r.requestedRole === "yurutucu" ? "Yürütücü" : "Üye"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            r.status === "onaylandi" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}>
                            {r.status === "onaylandi" ? "Onaylandı" : "Reddedildi"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
