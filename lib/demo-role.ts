// Demo rol seçimi — ziyaretçi hangi perspektiften sistemi deneyimleyeceğini seçer.
const STORAGE_KEY = "eu_demo_role";

export type DemoRoleId = "guest" | "firma" | "stk" | "tedarikci" | "delegasyon" | "program_otoritesi";

export interface DemoRole {
  id: DemoRoleId;
  label: string;
  labelEn: string;
  desc: string;
  descEn: string;
  icon: string;
  subscriberId?: string; // demo data'daki hangi sub ile eşleşir
}

export const DEMO_ROLES: DemoRole[] = [
  {
    id: "guest",
    label: "Kayıtsız Ziyaretçi",
    labelEn: "Guest Visitor",
    desc: "Kamuya açık içerikler: proje kataloğu, gündem, haberler. Panel yok.",
    descEn: "Public content only: project catalog, agenda, news. No panel.",
    icon: "👁️",
  },
  {
    id: "firma",
    label: "Yönetici Paket (Firma)",
    labelEn: "Manager Package (Firm)",
    desc: "ABC Danışmanlık olarak giriş. Tam panel, projeler, ilanlar, dijital araçlar.",
    descEn: "Login as ABC Consulting. Full panel, projects, listings, digital tools.",
    icon: "🏢",
    subscriberId: "sub-1",
  },
  {
    id: "stk",
    label: "STK / Vakıf",
    labelEn: "NGO / Foundation",
    desc: "Tarım Geliştirme Vakfı olarak giriş. Proje ve ilan yönetimi.",
    descEn: "Login as Agri Dev Foundation. Project and listing management.",
    icon: "🤝",
    subscriberId: "sub-4",
  },
  {
    id: "tedarikci",
    label: "Tedarikçi Paketi",
    labelEn: "Supplier Package",
    desc: "MK İnşaat olarak giriş. İhale ilanları, tedarikçi profili.",
    descEn: "Login as MK Construction. Tender listings, supplier profile.",
    icon: "⚙️",
    subscriberId: "sub-3",
  },
  {
    id: "delegasyon",
    label: "AB Türkiye Delegasyonu",
    labelEn: "EU Delegation Turkey",
    desc: "Delegasyon yetkilileri perspektifi. Proje izleme, ilan ve duyuru.",
    descEn: "EU Delegation staff view. Project monitoring, listings, announcements.",
    icon: "🇪🇺",
    subscriberId: "sub-6",
  },
  {
    id: "program_otoritesi",
    label: "Program Otoritesi (MFİB)",
    labelEn: "Programme Authority (CFCU)",
    desc: "MFİB perspektifi. Program yönetimi ve proje denetimi.",
    descEn: "CFCU perspective. Programme management and project oversight.",
    icon: "🏛️",
    subscriberId: "sub-7",
  },
];

export function getDemoRole(): DemoRoleId | null {
  if (typeof window === "undefined") return null;
  try {
    const val = window.localStorage.getItem(STORAGE_KEY);
    if (val && DEMO_ROLES.find((r) => r.id === val)) return val as DemoRoleId;
  } catch {}
  return null;
}

export function setDemoRole(role: DemoRoleId) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, role); } catch {}
}

export function clearDemoRole() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
}
