// Üyelik paketleri için merkezi fiyatlandırma mantığı.
// Onur'un yeni yapısı (Ağustos 2026):
//   - Uzman Paketi: Ücretsiz
//   - Yönetici Paketi: 2.500€ + KDV / yıl (yenileme aynı ücret)
//   - Tedarikçi Paketi: 2.500€ + KDV / yıl (sabit)

export type PlanId = "uzman" | "yonetici" | "tedarikci";

export interface PlanPricing {
  firstYearPrice: number;    // Euro + KDV hariç, ilk yıl
  renewalPrice: number;      // Euro + KDV hariç, 2. yıl ve sonrası
  hasRenewalDiscount: boolean;
  vatRate: number;           // KDV oranı (0.20 = %20)
}

export const PLAN_PRICING: Record<PlanId, PlanPricing> = {
  uzman:     { firstYearPrice: 0,    renewalPrice: 0,    hasRenewalDiscount: false, vatRate: 0 },
  yonetici:  { firstYearPrice: 2500, renewalPrice: 2500, hasRenewalDiscount: false, vatRate: 0.20 },
  tedarikci: { firstYearPrice: 2500, renewalPrice: 2500, hasRenewalDiscount: false, vatRate: 0.20 },
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
