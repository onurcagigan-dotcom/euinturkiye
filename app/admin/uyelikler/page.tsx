"use client";
import { useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import { PLAN_PRICING, getSubscriptionYear, getCurrentYearPrice, formatEuro, type PlanId } from "@/lib/pricing";
import type { Subscriber } from "@/lib/types";

const PLAN_LABELS: Record<PlanId, string> = {
  ucretsiz: "Ücretsiz", paket1: "Paket 1", paket2: "Paket 2", tedarikci: "Tedarikçi",
};

const emptySubscriber = (): Subscriber => ({
  id: `sub-${Date.now()}`, name: "", email: "", accountType: "sirket", plan: "ucretsiz",
  tags: [], createdAt: new Date().toISOString(),
});

export default function AdminUyeliklerPage() {
  const { subscribers, saveSubscriber, removeSubscriber } = useAdmin();
  const [editing, setEditing] = useState<Subscriber | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const save = () => {
    if (!editing || !editing.name || !editing.email) return;
    saveSubscriber(editing);
    setEditing(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Üyelikler <span className="text-mist font-normal text-lg">({subscribers.length})</span></h1>
        <button onClick={() => setEditing(emptySubscriber())} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
          + Yeni Üye
        </button>
      </div>

      {/* Fiyatlandırma referans tablosu */}
      <div className="bg-white border border-line rounded-xl p-5 mb-6">
        <h2 className="font-bold text-ink text-sm mb-3">Üyelik Paketleri — Fiyatlandırma</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(PLAN_PRICING) as PlanId[]).map((pid) => {
            const pricing = PLAN_PRICING[pid];
            return (
              <div key={pid} className="bg-surface rounded-lg p-3">
                <p className="text-xs font-semibold text-mist">{PLAN_LABELS[pid]}</p>
                <p className="text-ink font-bold">{formatEuro(pricing.firstYearPrice)} <span className="text-xs text-mist font-normal">ilk yıl</span></p>
                {pricing.hasRenewalDiscount ? (
                  <p className="text-xs text-eu mt-0.5">{formatEuro(pricing.renewalPrice)}/yıl yenileme</p>
                ) : (
                  <p className="text-xs text-mist mt-0.5">Yenileme farkı yok</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {editing && (
        <div className="bg-white border border-eu/30 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-ink mb-4">{subscribers.some(s => s.id === editing.id) ? "Düzenle" : "Yeni Üye"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Ad Soyad *</label>
              <input value={editing.name} onChange={e => setEditing(p => p && ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">E-posta *</label>
              <input value={editing.email} onChange={e => setEditing(p => p && ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Kurum</label>
              <input value={editing.organization ?? ""} onChange={e => setEditing(p => p && ({ ...p, organization: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Hesap Türü</label>
              <select value={editing.accountType} onChange={e => setEditing(p => p && ({ ...p, accountType: e.target.value as Subscriber["accountType"] }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                <option value="sirket">Şirket</option>
                <option value="stk">STK</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Üyelik Paketi</label>
              <select value={editing.plan} onChange={e => setEditing(p => p && ({ ...p, plan: e.target.value as PlanId }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                {(Object.keys(PLAN_PRICING) as PlanId[]).map(pid => <option key={pid} value={pid}>{PLAN_LABELS[pid]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Üyelik Başlangıç Tarihi</label>
              <input type="date" value={editing.createdAt.slice(0, 10)}
                onChange={e => setEditing(p => p && ({ ...p, createdAt: new Date(e.target.value).toISOString() }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
          </div>
          {editing.plan !== "ucretsiz" && (
            <div className="mt-3 bg-eu-pale rounded-lg p-3 text-sm">
              <span className="text-eu font-semibold">
                {getSubscriptionYear(editing.createdAt) <= 1 ? "İlk yıl ücreti" : `${getSubscriptionYear(editing.createdAt)}. yıl yenileme ücreti`}:
              </span>{" "}
              <span className="font-bold text-ink">{formatEuro(getCurrentYearPrice(editing.plan, editing.createdAt))}</span>
            </div>
          )}
          <div className="flex gap-2 mt-5">
            <button onClick={save} className="px-5 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Kaydet</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-ink mb-2">Üyeyi sil?</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { removeSubscriber(confirmDel); setConfirmDel(null); }} className="px-4 py-2 bg-tr text-white rounded-lg text-sm font-semibold">Sil</button>
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-line rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-surface border-b border-line">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate">Ad / Kurum</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Paket</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Üyelik Başlangıcı</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Yıl</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Güncel Ücret</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => {
              const year = getSubscriptionYear(s.createdAt);
              const price = getCurrentYearPrice(s.plan, s.createdAt);
              return (
                <tr key={s.id} className="border-t border-line hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{s.organization ?? s.name}</p>
                    <p className="text-xs text-mist">{s.name} · {s.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-eu-pale text-eu px-2 py-0.5 rounded-full font-semibold">{PLAN_LABELS[s.plan]}</span>
                  </td>
                  <td className="px-4 py-3 text-slate text-xs">{new Date(s.createdAt).toLocaleDateString("tr")}</td>
                  <td className="px-4 py-3 text-slate text-xs">{year}. yıl{year > 1 ? " (yenileme)" : " (ilk yıl)"}</td>
                  <td className="px-4 py-3 font-semibold text-ink text-xs">{s.plan === "ucretsiz" ? "—" : formatEuro(price)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setEditing({ ...s })} className="text-eu text-xs font-semibold hover:underline">Düzenle</button>
                      <button onClick={() => setConfirmDel(s.id)} className="text-mist text-xs hover:text-tr">Sil</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
