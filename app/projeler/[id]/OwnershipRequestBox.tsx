"use client";

import { useState } from "react";
import { getDataProvider } from "@/lib/data";
import { useAuth } from "@/lib/firebase/auth-context";
import type { OwnershipRequest } from "@/lib/types";

// Sahipsiz (arşiv) projelerde gösterilir: şirket portföyüne ekleme talebi
export function OwnershipRequestBox({ projectId, projectTitle }: { projectId: string; projectTitle: string }) {
  const db = getDataProvider();
  const { user, enabled } = useAuth();
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);

  async function submit() {
    // Demo: giriş yoksa örnek bir şirket adıyla talep oluştur
    const subscriberName = user?.email ?? "Şirketiniz (demo)";
    const req: OwnershipRequest = {
      id: `own-${Date.now()}`,
      projectId,
      subscriberId: user?.uid ?? "demo-subscriber",
      subscriberName,
      note: note || undefined,
      status: "bekliyor",
      createdAt: new Date().toISOString(),
    };
    await db.saveOwnershipRequest(req);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-6">
        <p className="text-sm text-green-800">
          ✓ Talebiniz alındı. Yönetici onayladığında bu proje portföyünüze eklenecek.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-ink text-sm">Bu proje sizin mi?</h3>
          <p className="text-sm text-slate mt-1">
            Bu, arşivden eklenmiş bir projedir ve henüz bir portföye bağlı değildir.
            Yürütücüsü sizseniz portföyünüze eklemek için talep gönderebilirsiniz.
          </p>
        </div>
        {!open && (
          <button onClick={() => setOpen(true)} className="shrink-0 px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold">
            Portföyüme Ekle
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4">
          {enabled && !user && (
            <p className="text-xs text-amber-800 mb-2">
              Not: Talebin hesabınıza bağlanması için giriş yapmış olmanız gerekir. (Demo modunda talep yine de oluşturulur.)
            </p>
          )}
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Bu projedeki rolünüz / katkınız (opsiyonel)"
            className="w-full px-3 py-2 rounded-lg border border-line text-sm min-h-[70px] focus:outline-none focus:ring-2 focus:ring-eu/30"
          />
          <div className="flex gap-3 mt-3">
            <button onClick={submit} className="px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold">Talep Gönder</button>
            <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate">Vazgeç</button>
          </div>
        </div>
      )}
    </div>
  );
}
