import type { Project } from "./types";

export interface ProjectProgress {
  /** 0–100 arası ilerleme yüzdesi (tarihe göre hesaplanır) */
  percent: number;
  /** Proje başlamadan önce mi? */
  notStarted: boolean;
  /** Bitiş tarihi geçmiş ama proje verisinde hâlâ "devam" işaretli mi? (admin'in güncellemesi gerekir) */
  overdue: boolean;
  /** Kalan veya geçen gün sayısı (bilgi amaçlı) */
  daysRemaining: number | null;
}

/**
 * Proje başlangıç/bitiş tarihlerine göre zaman bazlı ilerleme yüzdesini hesaplar.
 * Proje "tamamlandi" işaretliyse her zaman %100 döner.
 * Tarih bilgisi yoksa null benzeri bir varsayılan döner (percent: 0).
 */
export function getProjectProgress(project: Project, now: Date = new Date()): ProjectProgress {
  if (project.status === "tamamlandi") {
    return { percent: 100, notStarted: false, overdue: false, daysRemaining: null };
  }

  if (!project.startDate || !project.endDate) {
    return { percent: 0, notStarted: false, overdue: false, daysRemaining: null };
  }

  const start = new Date(project.startDate).getTime();
  const end = new Date(project.endDate).getTime();
  const current = now.getTime();

  if (isNaN(start) || isNaN(end) || end <= start) {
    return { percent: 0, notStarted: false, overdue: false, daysRemaining: null };
  }

  if (current < start) {
    const daysRemaining = Math.ceil((start - current) / (1000 * 60 * 60 * 24));
    return { percent: 0, notStarted: true, overdue: false, daysRemaining };
  }

  if (current >= end) {
    // Bitiş tarihi geçmiş ama proje hâlâ "devam ediyor" işaretli — admin tarafından
    // güncellenmesi beklenir. Kullanıcıya "süresi doldu" değil, ilerlemenin %100'e
    // yaklaştığını ama henüz tamamlandı olarak işaretlenmediğini gösteririz.
    return { percent: 100, notStarted: false, overdue: true, daysRemaining: 0 };
  }

  const percent = Math.round(((current - start) / (end - start)) * 100);
  const daysRemaining = Math.ceil((end - current) / (1000 * 60 * 60 * 24));
  return { percent: Math.min(99, Math.max(1, percent)), notStarted: false, overdue: false, daysRemaining };
}
