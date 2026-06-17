// Üyelik paketleri için merkezi fiyatlandırma mantığı.
// İlk yıl ve yenileme (2. yıl ve sonrası) ücretleri farklıdır (Tedarikçi hariç — sabittir).

export type PlanId = "ucretsiz" | "paket1" | "paket2" | "tedarikci";

export interface PlanPricing {
  firstYearPrice: number; // Euro, ilk yıl ücreti
  renewalPrice: number; // Euro, 2. yıl ve sonrası yenileme ücreti
  hasRenewalDiscount: boolean; // yenileme ücreti ilk yıldan farklı mı
}

export const PLAN_PRICING: Record<PlanId, PlanPricing> = {
  ucretsiz: { firstYearPrice: 0, renewalPrice: 0, hasRenewalDiscount: false },
  paket1: { firstYearPrice: 2500, renewalPrice: 500, hasRenewalDiscount: true },
  paket2: { firstYearPrice: 4000, renewalPrice: 1000, hasRenewalDiscount: true },
  tedarikci: { firstYearPrice: 1000, renewalPrice: 1000, hasRenewalDiscount: false },
};

/** Üyeliğin başlangıç tarihine göre kaçıncı yılında olduğunu hesaplar (1 = ilk yıl). */
export function getSubscriptionYear(createdAt: string, now: Date = new Date()): number {
  const start = new Date(createdAt);
  const diffMs = now.getTime() - start.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffYears) + 1;
}

/** Üyeliğin şu anki yılına göre uygulanması gereken ücreti döndürür. */
export function getCurrentYearPrice(planId: PlanId, createdAt: string, now: Date = new Date()): number {
  const pricing = PLAN_PRICING[planId];
  const year = getSubscriptionYear(createdAt, now);
  return year <= 1 ? pricing.firstYearPrice : pricing.renewalPrice;
}

export function formatEuro(amount: number): string {
  return `€${amount.toLocaleString("tr-TR")}`;
}
