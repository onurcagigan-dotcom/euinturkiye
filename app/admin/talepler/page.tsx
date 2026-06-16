"use client";

import { useState, useEffect, useCallback } from "react";
import { getDataProvider } from "@/lib/data";
import { useAdmin } from "@/lib/admin/store";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import type { OwnershipRequest } from "@/lib/types";

const STATUS: Record<OwnershipRequest["status"], { label: string; cls: string }> = {
  bekliyor: { label: "Bekliyor", cls: "bg-amber-100 text-amber-700" },
  onaylandi: { label: "Onaylandı", cls: "bg-green-100 text-green-700" },
  reddedildi: { label: "Reddedildi", cls: "bg-red-100 text-red-600" },
};

export default function AdminRequests() {
  const db = getDataProvider();
  const { projects } = useAdmin();
  const [requests, setRequests] = useState<OwnershipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    db.getOwnershipRequests().then((r) => { setRequests(r); setLoading(false); });
  }, [db]);
  useEffect(() => { load(); }, [load]);

  const projectTitle = (id: string) => projects.find((p) => p.id === id)?.title ?? id;

  async function approve(r: OwnershipRequest) {
    await db.assignProjectOwner(r.projectId, r.subscriberId);
    await db.saveOwnershipRequest({ ...r, status: "onaylandi" });
    load();
  }
  async function reject(r: OwnershipRequest) {
    await db.saveOwnershipRequest({ ...r, status: "reddedildi" });
    load();
  }
  async function remove(id: string) {
    if (!confirm("Talep kaydı silinsin mi?")) return;
    await db.removeOwnershipRequest(id);
    load();
  }

  const pending = requests.filter((r) => r.status === "bekliyor");

  return (
    <>
      <PageHeader title="Sahiplik Talepleri" />
      <p className="text-slate text-sm mb-6 -mt-2">
        Şirketlerin arşiv projelerini portföylerine ekleme talepleri. Onayladığınızda proje,
        talebi yapan aboneye atanır.
      </p>

      {loading ? (
        <p className="text-slate">Yükleniyor…</p>
      ) : requests.length === 0 ? (
        <EmptyState text="Henüz sahiplik talebi yok." />
      ) : (
        <div className="space-y-3">
          {pending.length > 0 && (
            <p className="text-sm font-semibold text-amber-700">{pending.length} bekleyen talep</p>
          )}
          {requests.map((r) => (
            <div key={r.id} className="bg-white border border-line rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ink">{projectTitle(r.projectId)}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS[r.status].cls}`}>
                      {STATUS[r.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-slate mt-1">Talep eden: <strong>{r.subscriberName}</strong></p>
                  {r.note && <p className="text-sm text-slate mt-1 italic">&quot;{r.note}&quot;</p>}
                  <p className="text-xs text-mist mt-1">{r.createdAt.slice(0, 10)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {r.status === "bekliyor" && (
                    <>
                      <button onClick={() => approve(r)} className="px-3 py-1.5 rounded-lg bg-eu text-white text-sm font-semibold">Onayla</button>
                      <button onClick={() => reject(r)} className="text-tr text-sm hover:underline">Reddet</button>
                    </>
                  )}
                  <button onClick={() => remove(r.id)} className="text-slate text-xs hover:underline">Sil</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
