// Üyelik paketleri — merkezi yetki mantığı
//
// Freemium akışı (Ağustos 2026):
//   Ücretsiz (uzman):   Profil oluşturma + listelenmek + katalog/haberler/ilanlar görüntüleme
//   Yönetici (yonetici): Dijital araçlar + proje yönetimi + konsorsiyum + ihale görüntüleme
//   Tedarikçi (tedarikci): Tedarikçi profili + ihale içerikleri + tedarikçi dizininde görünürlük
//
//   Profil oluşturma ve Rehber'de listelenmek ÜCRETSİZ planla da açık.
//   Araçlar ve yetkili içerikler ücretli plana geçince açılır.

export type PlanId = "uzman" | "yonetici" | "tedarikci";

// ─── Fiyatlandırma ──────────────────────────────────────────
export interface PlanPricing {
  firstYearPrice: number;
  renewalPrice: number;
  hasRenewalDiscount: boolean;
  vatRate: number;
}

export const PLAN_PRICING: Record<PlanId, PlanPricing> = {
  uzman:     { firstYearPrice: 0,    renewalPrice: 0,    hasRenewalDiscount: false, vatRate: 0 },
  yonetici:  { firstYearPrice: 2500, renewalPrice: 2500, hasRenewalDiscount: false, vatRate: 0.20 },
  tedarikci: { firstYearPrice: 2500, renewalPrice: 2500, hasRenewalDiscount: false, vatRate: 0.20 },
};

// ─── Yetki kontrolleri (tek kaynak) ────────────────────────
/** Dijital araçlara erişim (etkinlik, doküman, bülten, anket, vb.) */
export function canUseTools(plan: PlanId): boolean {
  return plan === "yonetici" || plan === "tedarikci";
}

/** Proje oluşturma ve yönetme */
export function canManageProjects(plan: PlanId): boolean {
  return plan === "yonetici";
}

/** İhale ilanı içeriğini görme */
export function canViewTenders(plan: PlanId): boolean {
  return plan === "yonetici" || plan === "tedarikci";
}

/** Tedarikçi dizininde görünürlük (profil zaten ücretsizde de var) */
export function canListInDirectory(plan: PlanId): boolean {
  return true; // Tüm planlar dizinde görünebilir
}

/** Konsorsiyum katılımı ve sahiplenme */
export function canJoinConsortium(plan: PlanId): boolean {
  return plan === "yonetici";
}

/** Profil oluşturma ve düzenleme — HERKESe açık */
export function canCreateProfile(_plan: PlanId): boolean {
  return true;
}

/** İhale ilanı oluşturma (delegasyon/program_otoritesi/admin2 rol bazlı) */
export function canPostTenderByPlan(plan: PlanId): boolean {
  return plan === "yonetici";
}

// ─── Zaman bazlı yardımcılar ───────────────────────────────
export function getSubscriptionYear(createdAt: string, now: Date = new Date()): number {
  const start = new Date(createdAt);
  const diffMs = now.getTime() - start.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffYears) + 1;
}

export function getCurrentYearPrice(planId: PlanId, createdAt: string, now: Date = new Date()): number {
  const pricing = PLAN_PRICING[planId];
  const year = getSubscriptionYear(createdAt, now);
  return year <= 1 ? pricing.firstYearPrice : pricing.renewalPrice;
}

export function formatEuro(amount: number): string {
  return `€${amount.toLocaleString("tr-TR")}`;
}

// ─── Plan etiketleri ────────────────────────────────────────
export const PLAN_LABELS: Record<PlanId, { tr: string; en: string }> = {
  uzman:     { tr: "Uzman (Ücretsiz)", en: "Expert (Free)" },
  yonetici:  { tr: "Yönetici Paketi",  en: "Manager Package" },
  tedarikci: { tr: "Tedarikçi Paketi", en: "Supplier Package" },
};
