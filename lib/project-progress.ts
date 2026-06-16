// ============================================================
// Proje zaman çizelgesi ilerleme hesabı.
//
// startDate / endDate (ISO) ve bugünün tarihine göre projenin
// zaman ekseninde yüzde kaçının geçtiğini hesaplar.
// Durum (status) ile birlikte değerlendirilir.
// ============================================================

import type { Project } from "@/lib/types";

export interface ProgressInfo {
  percent: number;          // 0–100 zaman ekseninde geçen oran
  label: string;            // "Devam ediyor", "Tamamlandı"...
  daysLeft: number | null;  // kalan gün (bittiyse 0, tarih yoksa null)
  hasTimeline: boolean;     // start+end var mı
}

export function projectProgress(p: Project, now: Date = new Date()): ProgressInfo {
  // Durum öncelikli: tamamlandı/planlama net
  if (p.status === "tamamlandi") {
    return { percent: 100, label: "Tamamlandı", daysLeft: 0, hasTimeline: Boolean(p.startDate && p.endDate) };
  }
  if (p.status === "planlama") {
    return { percent: 0, label: "Planlama", daysLeft: null, hasTimeline: Boolean(p.startDate && p.endDate) };
  }

  // Devam ediyor: tarihlerden hesapla
  if (!p.startDate || !p.endDate) {
    return { percent: 50, label: "Devam ediyor", daysLeft: null, hasTimeline: false };
  }

  const start = new Date(p.startDate).getTime();
  const end = new Date(p.endDate).getTime();
  const t = now.getTime();

  if (t <= start) return { percent: 0, label: "Henüz başlamadı", daysLeft: null, hasTimeline: true };
  if (t >= end) return { percent: 100, label: "Süre doldu", daysLeft: 0, hasTimeline: true };

  const percent = Math.round(((t - start) / (end - start)) * 100);
  const daysLeft = Math.ceil((end - t) / (1000 * 60 * 60 * 24));
  return { percent, label: "Devam ediyor", daysLeft, hasTimeline: true };
}

/** Bir proje grubu için durum dağılımı */
export function statusBreakdown(projects: Project[]) {
  const planlama = projects.filter((p) => p.status === "planlama").length;
  const devam = projects.filter((p) => p.status === "devam").length;
  const tamamlandi = projects.filter((p) => p.status === "tamamlandi").length;
  const total = projects.length || 1;
  return {
    planlama, devam, tamamlandi,
    total: projects.length,
    devamPct: Math.round((devam / total) * 100),
    tamamPct: Math.round((tamamlandi / total) * 100),
    planlamaPct: Math.round((planlama / total) * 100),
  };
}
