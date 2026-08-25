"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { useLocale } from "@/lib/i18n/context";
import { getDataProvider } from "@/lib/data";
import { PLAN_PRICING, getSubscriptionYear, getCurrentYearPrice, formatEuro } from "@/lib/pricing";
import type { PlanPricing } from "@/lib/pricing";
import { TOOLS, ToolIcon } from "@/lib/tools-config";
import type {
  Project, OwnershipRequest, Listing, ListingType,
  Sector, Donor, IpaPeriod, SubscriberProfileType, ExpertProfile,
  Subscriber, AddressGroup, SavedListing, EditLog,
} from "@/lib/types";
import { canPostTender } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/translations";

// ─── Rol sabitleri ────────────────────────────────────────────
const CAN_OWN_PROJECTS: SubscriberProfileType[] = ["firma", "stk"];
const IS_SUPPLIER: SubscriberProfileType[] = ["tedarikci"];
const IS_AUTHORITY: SubscriberProfileType[] = ["delegasyon", "program_otoritesi"];

const ROLE_LABEL: Record<SubscriberProfileType, string> = {
  firma: "Firma", stk: "STK", tedarikci: "Tedarikçi",
  delegasyon: "AB Delegasyonu", program_otoritesi: "Program Otoritesi",
  admin2: "Admin2",
};
const ROLE_COLOR: Record<SubscriberProfileType, string> = {
  firma: "bg-blue-100 text-blue-700", stk: "bg-green-100 text-green-700",
  tedarikci: "bg-orange-100 text-orange-700", delegasyon: "bg-purple-100 text-purple-700",
  program_otoritesi: "bg-red-100 text-red-700", admin2: "bg-gray-100 text-gray-700",
};

// ─── SVG ikonlar ──────────────────────────────────────────────
// ─── Yardımcı ikon bileşeni (tab nav için) ─────────────────────
function Icon({ id, className = "w-5 h-5" }: { id: string; className?: string }) {
  const paths: Record<string, string> = {
    project:  "M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z",
    listing:  "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
    tools:    "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z",
    address:  "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
    profile:  "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
    edit:     "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10",
    trash:    "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
    plus:     "M12 4.5v15m7.5-7.5h-15",
    check:    "m4.5 12.75 6 6 9-13.5",
    chevron:  "M19 9l-7 7-7-7",
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[id] ?? paths.project} />
    </svg>
  );
}

// ─── Tab tanımları ─────────────────────────────────────────────
type TabId = "projeler" | "ilanlar" | "araclar" | "adres" | "profil";

interface TabDef { id: TabId; label: string; icon: string; roles: SubscriberProfileType[] }

const TABS: TabDef[] = [
  { id: "projeler",    label: "Projelerim",      icon: "project",  roles: ["firma", "stk"] },
  { id: "ilanlar",     label: "İlanlarım",        icon: "listing",  roles: ["firma", "stk", "tedarikci", "delegasyon", "program_otoritesi", "admin2"] },
  { id: "araclar",     label: "Dijital Araçlar",  icon: "tools",    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2"] },
  { id: "adres",       label: "Adres Defteri",    icon: "address",  roles: ["firma", "stk", "tedarikci", "delegasyon", "program_otoritesi", "admin2"] },
  { id: "profil",      label: "Profil & Hesap",   icon: "profile",  roles: ["firma", "stk", "tedarikci", "delegasyon", "program_otoritesi", "admin2"] },
];

// ─── Ana component ─────────────────────────────────────────────
export default function FirmaPanelPage() {
  return (
    <Suspense>
      <FirmaPanelInner />
    </Suspense>
  );
}

function FirmaPanelInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const isEn = locale === "en";
  const { current, loading, logout, updateCurrent } = useFirma();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["projeler","ilanlar","araclar","adres","profil"].includes(tabParam)) {
      return tabParam as TabId;
    }
    return "projeler";
  });
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Veriler
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [myExpertProfile, setMyExpertProfile] = useState<ExpertProfile | null>(null);
  const [allSubscribers, setAllSubscribers] = useState<Subscriber[]>([]);
  const [addressGroups, setAddressGroups] = useState<AddressGroup[]>([]);

  // Gelen talep sayısını ana bileşende de tut — tab badge için
  const [incomingRequestCount, setIncomingRequestCount] = useState(0);

  useEffect(() => {
    if (loading || !current) return;
    const db = getDataProvider();
    Promise.all([
      db.getProjects(), db.getListings(), db.getSectors(), db.getDonors(),
      db.getExpertProfiles(), db.getSubscribers(), db.getAddressGroups(current.id),
      db.getOwnershipRequestsFor({ approverSubscriberId: current.id }),
    ]).then(([allProjects, allListings, allSectors, allDonors, allExperts, subs, groups, reqs]) => {
      setOwnedProjects(allProjects.filter((p) => p.ownerSubscriberId === current.id));
      setMemberProjects(allProjects.filter((p) =>
        p.ownerSubscriberId !== current.id &&
        p.consortiumMembers?.some((m) => m.subscriberId === current.id)
      ));
      setMyListings(allListings.filter((l) => l.publisherSubscriberId === current.id));
      setSectors(allSectors);
      setDonors(allDonors);
      setMyExpertProfile(allExperts.find((ep) => ep.subscriberId === current.id) ?? null);
      setAllSubscribers(subs);
      setAddressGroups(groups);
      setIncomingRequestCount(reqs.filter((r) => r.status === "bekliyor").length);
      setDataLoading(false);
    });
  }, [current, loading, router]);

  if (loading || (current && dataLoading)) {
    return <PageShell><div className="max-w-5xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div></PageShell>;
  }
  if (!current) return null;

  const role = current.profileType;
  const canOwnProjects = CAN_OWN_PROJECTS.includes(role);
  const isSupplier = IS_SUPPLIER.includes(role);
  const canTender = canPostTender(role);
  const myTabs = TABS.filter((t) => t.roles.includes(role));

  // Tab başlangıcını rol'e göre ayarla
  const defaultTab = canOwnProjects ? "projeler" : isSupplier ? "ilanlar" : "ilanlar";

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Panelim" }]} />

        {/* Profil başlığı */}
        <div className="bg-white border border-line rounded-2xl p-6 mb-5">
          <div className="flex items-start gap-5">
            {/* Logo — tıklanınca yükleme */}
            <label className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer group">
              {current.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.logoUrl} alt={current.organization ?? current.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-eu flex items-center justify-center text-white font-bold text-2xl">
                  {(current.organization ?? current.name).charAt(0)}
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                </svg>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const url = ev.target?.result as string;
                  const updated = { ...current, logoUrl: url };
                  updateCurrent(updated);
                  getDataProvider().saveSubscriber(updated);
                };
                reader.readAsDataURL(file);
              }} />
            </label>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h1 className="text-xl font-bold text-ink">{current.organization ?? current.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${ROLE_COLOR[role]}`}>
                  {ROLE_LABEL[role]}
                </span>
              </div>
              <p className="text-sm text-slate mb-3">{current.name} · {current.email}</p>

              {/* Hakkında */}
              {current.shortBio && <p className="text-sm text-slate leading-relaxed mb-1">{current.shortBio}</p>}
              {current.mission && <p className="text-xs text-mist italic mb-3">"{current.mission}"</p>}

              {/* Meta bilgiler — ferah, ikonlu satır */}
              {(current.foundedYear || current.employeeCount || current.contactAddress || current.contactPhone || current.contactEmail) && (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 mt-4 pt-4 border-t border-line text-sm text-slate">
                  {current.foundedYear && (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-mist flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                      <span><strong className="text-ink">{current.foundedYear}</strong> {isEn ? "founded" : "kuruluş"}</span>
                    </span>
                  )}
                  {current.employeeCount && (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-mist flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                      <span><strong className="text-ink">{current.employeeCount}</strong> {isEn ? "employees" : "çalışan"}</span>
                    </span>
                  )}
                  {current.contactAddress && (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-mist flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      {current.contactAddress}
                    </span>
                  )}
                  {current.contactPhone && (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-mist flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                      {current.contactPhone}
                    </span>
                  )}
                  {current.contactEmail && (
                    <a href={`mailto:${current.contactEmail}`} className="flex items-center gap-2 text-eu hover:underline">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                      {current.contactEmail}
                    </a>
                  )}
                </div>
              )}

              {/* Hizmetler */}
              {current.services && current.services.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {current.services.slice(0, 6).map((s) => (
                    <span key={s} className="text-xs bg-eu-pale text-eu px-2.5 py-1 rounded-full font-medium">{s}</span>
                  ))}
                  {current.services.length > 6 && <span className="text-xs text-mist self-center">+{current.services.length - 6}</span>}
                </div>
              )}

              {/* Web sitesi */}
              {(current.socialLinks?.website || current.institutionWebsite) && (
                <a href={current.socialLinks?.website ?? current.institutionWebsite} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-eu hover:underline mt-2 w-fit">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                  {(current.socialLinks?.website ?? current.institutionWebsite ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
            </div>

            {/* Sağ: Düzenle + Çıkış */}
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button onClick={() => { setActiveTab("profil"); setProfileEditOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-line text-slate rounded-lg text-xs font-semibold hover:border-eu hover:text-eu transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                </svg>
                {isEn ? "Edit" : "Düzenle"}
              </button>
              <button onClick={() => { logout(); router.push("/"); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Çıkış
              </button>
            </div>
          </div>
        </div>

        {/* Admin2 banner */}
        {role === "admin2" && (
          <div className="bg-gray-800 text-white rounded-2xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-bold text-sm">Admin2 Modu</p>
              <p className="text-xs text-gray-300">Tüm içeriklere erişebilirsiniz. Düzenlediğiniz metinlere otomatik "admin2 tarafından düzenlendi" etiketi düşer.</p>
            </div>
          </div>
        )}

        {/* Tab navigasyonu */}
        <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1 overflow-x-auto">
          {myTabs.map((tab) => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === tab.id ? "bg-white text-ink shadow-sm" : "text-slate hover:text-ink"
              }`}>
              <Icon id={tab.icon} className="w-4 h-4" />
              {tab.label}
              {tab.id === "projeler" && incomingRequestCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {incomingRequestCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab içerikleri */}
        <div className="min-h-[400px]">
          {activeTab === "projeler" && canOwnProjects && (
            <ProjectsTab
              current={current} locale={locale}
              ownedProjects={ownedProjects} setOwnedProjects={setOwnedProjects}
              memberProjects={memberProjects}
              sectors={sectors} donors={donors}
              allSubscribers={allSubscribers}
              myListings={myListings} setMyListings={setMyListings}
            />
          )}
          {activeTab === "ilanlar" && (
            <ListingsTab
              current={current} locale={locale}
              myListings={myListings} setMyListings={setMyListings}
              ownedProjects={ownedProjects}
              canTender={canTender}
            />
          )}
          {activeTab === "araclar" && (
            <ToolsTab role={role} locale={locale} plan={current.plan} />
          )}
          {activeTab === "adres" && (
            <AddressTab
              current={current} locale={locale}
              allSubscribers={allSubscribers}
              groups={addressGroups} setGroups={setAddressGroups}
            />
          )}
          {activeTab === "profil" && <ProfileTab current={current} locale={locale} myExpertProfile={myExpertProfile} setMyExpertProfile={setMyExpertProfile} forceEdit={profileEditOpen} onEditOpened={() => setProfileEditOpen(false)} />}
        </div>
      </div>
    </PageShell>
  );
}

// ─── SEKMELER ─────────────────────────────────────────────────

// ── Projelerim ────────────────────────────────────────────────
function ProjectsTab({ current, locale, ownedProjects, setOwnedProjects, memberProjects, sectors, donors, allSubscribers, myListings, setMyListings }: {
  current: Subscriber; locale: string;
  ownedProjects: Project[]; setOwnedProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  memberProjects: Project[];
  sectors: Sector[]; donors: Donor[];
  allSubscribers: Subscriber[];
  myListings: Listing[]; setMyListings: React.Dispatch<React.SetStateAction<Listing[]>>;
}) {
  const isEn = locale === "en";
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [locText, setLocText] = useState("");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectTab, setProjectTab] = useState<"bilgiler" | "ekip" | "dosyalar" | "ilanlar" | "website">("bilgiler");
  const [incomingRequests, setIncomingRequests] = useState<import("@/lib/types").OwnershipRequest[]>([]);
  const [projectDocs, setProjectDocs] = useState<import("@/lib/types").ProjectDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  // Gelen konsorsiyum taleplerini yükle
  useEffect(() => {
    getDataProvider().getOwnershipRequestsFor({ approverSubscriberId: current.id })
      .then((reqs) => setIncomingRequests(reqs.filter((r) => r.status === "bekliyor")));
  }, [current.id]);

  const resolveRequest = async (reqId: string, status: "onaylandi" | "reddedildi") => {
    await getDataProvider().resolveOwnershipRequest(reqId, status);
    setIncomingRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const emptyProject = (): Project => ({
    id: `prj-${Date.now()}`, title: "", summary: "", sectorId: sectors[0]?.id ?? "tarim",
    donorId: donors[0]?.id ?? "eu", ipaPeriod: "IPA-III", beneficiary: "", locations: [],
    status: "devam", featured: false,
    ownerSubscriberId: current.id, ownerSubscriberName: current.organization ?? current.name,
  });

  const openNew = () => { setEditProject(emptyProject()); setLocText(""); setShowForm(true); setActiveProjectId(null); };
  const openManage = (p: Project) => {
    setActiveProjectId(p.id); setProjectTab("bilgiler");
    setEditProject({ ...p }); setLocText(p.locations.join(", "));
    setShowForm(false);
    // Dosyaları yükle
    setDocsLoading(true);
    getDataProvider().getDocuments(p.id).then((docs) => { setProjectDocs(docs); setDocsLoading(false); });
  };

  const save = async () => {
    if (!editProject?.title || !editProject.summary) return;
    const updated = { ...editProject, locations: locText.split(",").map((l) => l.trim()).filter(Boolean) };
    await getDataProvider().saveProject(updated);
    // Admin2 ise edit log kaydet
    if (current.profileType === "admin2") {
      await getDataProvider().saveEditLog({
        id: `log-${Date.now()}`, editorSubscriberId: current.id, editorName: current.name,
        entityType: "project", entityId: updated.id, editedAt: new Date().toISOString(),
        summary: `Proje düzenlendi: ${updated.title}`,
      });
    }
    setOwnedProjects((prev) => {
      const i = prev.findIndex((p) => p.id === updated.id);
      return i !== -1 ? prev.map((p, j) => j === i ? updated : p) : [updated, ...prev];
    });
    if (showForm) { setShowForm(false); setEditProject(null); }
  };

  const del = async (id: string) => {
    if (!confirm(isEn ? "Delete this project?" : "Bu projeyi silmek istiyor musunuz?")) return;
    await getDataProvider().removeProject(id);
    setOwnedProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  };

  const activeProject = ownedProjects.find((p) => p.id === activeProjectId);
  const projectListings = myListings.filter((l) => l.projectId === activeProjectId);

  // Ekip üyeleri = konsorsiyum üyeleri
  const consortiumMembers = activeProject?.consortiumMembers ?? [];

  const addMember = async (subId: string, role: string) => {
    if (!activeProject) return;
    const sub = allSubscribers.find((s) => s.id === subId);
    if (!sub || consortiumMembers.some((m) => m.subscriberId === subId)) return;
    const newMember: import("@/lib/types").ConsortiumMember = {
      subscriberId: subId, subscriberName: sub.organization ?? sub.name,
      role: role || undefined, joinedAt: new Date().toISOString(),
    };
    const updated = { ...activeProject, consortiumMembers: [...consortiumMembers, newMember] };
    await getDataProvider().saveProject(updated);
    setOwnedProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    setEditProject(updated);
  };

  const removeMember = async (subId: string) => {
    if (!activeProject) return;
    const updated = { ...activeProject, consortiumMembers: consortiumMembers.filter((m) => m.subscriberId !== subId) };
    await getDataProvider().saveProject(updated);
    setOwnedProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    setEditProject(updated);
  };

  const uploadDoc = async (fileName: string) => {
    if (!activeProjectId) return;
    const doc: import("@/lib/types").ProjectDocument = {
      id: `doc-${Date.now()}`, name: fileName, projectId: activeProjectId,
      category: "diger", accessLevel: "ekip", fileSize: "—",
      uploadedAt: new Date().toISOString(), downloadCount: 0,
    };
    await getDataProvider().saveDocument(doc);
    setProjectDocs((prev) => [doc, ...prev]);
  };

  const removeDoc = async (id: string) => {
    setProjectDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-ink">{isEn ? "My Projects" : "Projelerim"}</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
          <Icon id="plus" className="w-4 h-4" /> {isEn ? "New Project" : "Yeni Proje"}
        </button>
      </div>

      {/* Yeni proje oluşturma formu */}
      {showForm && editProject && (
        <ProjectForm
          form={editProject} setForm={setEditProject}
          locText={locText} setLocText={setLocText}
          sectors={sectors} donors={donors} locale={locale}
          isNew={true}
          onSave={save} onCancel={() => { setShowForm(false); setEditProject(null); }}
        />
      )}

      {ownedProjects.length === 0 && !showForm ? (
        <div className="bg-white border border-line rounded-2xl p-8 text-center">
          <p className="text-slate mb-4">{isEn ? "No projects yet." : "Henüz proje eklenmemiş."}</p>
          <button onClick={openNew} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
            {isEn ? "Add Your First Project" : "İlk Projenizi Ekleyin"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 mb-6">
          {ownedProjects.map((p) => (
            <div key={p.id} className={`bg-white border rounded-xl ${activeProjectId === p.id ? "border-eu shadow-sm" : "border-line"}`}>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === "devam" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.status === "devam" ? "Devam Ediyor" : "Tamamlandı"}
                    </span>
                    <span className="text-xs text-mist">{p.ipaPeriod}</span>
                  </div>
                  <h3 className="font-bold text-ink text-sm">{p.title}</h3>
                  {p.locations.length > 0 && <p className="text-xs text-mist">📍 {p.locations.join(", ")}</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link href={`/projeler/${p.id}`}
                    title="Proje sayfasını gör"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-line text-mist hover:border-eu hover:text-eu transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </Link>
                  <button
                    title={activeProjectId === p.id ? "Kapat" : "Yönet"}
                    onClick={() => activeProjectId === p.id ? setActiveProjectId(null) : openManage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                      activeProjectId === p.id
                        ? "border-eu bg-eu text-white"
                        : "border-line text-eu hover:border-eu hover:bg-eu-pale"
                    }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                    </svg>
                  </button>
                  <button
                    title="Projeyi sil"
                    onClick={() => del(p.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-line text-mist hover:border-red-300 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Proje yönetim paneli — sekmeli */}
              {activeProjectId === p.id && editProject && (
                <div className="border-t border-line">
                  {/* Sekme navigasyonu */}
                  <div className="flex gap-1 px-4 pt-3 pb-0 overflow-x-auto">
                    {(["bilgiler", "ekip", "dosyalar", "ilanlar", "website"] as const).map((tab) => (
                      <button key={tab} onClick={() => setProjectTab(tab)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                          projectTab === tab ? "border-eu text-eu bg-eu-pale" : "border-transparent text-slate hover:text-ink"
                        }`}>
                        {tab === "bilgiler" ? "📋 Bilgiler" : tab === "ekip" ? "👥 Ekip" : tab === "dosyalar" ? "📁 Dosyalar" : tab === "ilanlar" ? "📢 İlanlar" : "🌐 Web Sitesi"}
                      </button>
                    ))}
                  </div>

                  <div className="p-4">
                    {/* Bilgiler sekmesi */}
                    {projectTab === "bilgiler" && (
                      <ProjectForm
                        form={editProject} setForm={setEditProject}
                        locText={locText} setLocText={setLocText}
                        sectors={sectors} donors={donors} locale={locale}
                        isNew={false}
                        onSave={save} onCancel={() => setActiveProjectId(null)}
                      />
                    )}

                    {/* Ekip sekmesi */}
                    {projectTab === "ekip" && (
                      <ProjectTeamTab
                        project={activeProject!} members={consortiumMembers}
                        allSubscribers={allSubscribers} currentId={current.id}
                        onAdd={addMember} onRemove={removeMember} locale={locale}
                      />
                    )}

                    {/* Dosyalar sekmesi */}
                    {projectTab === "dosyalar" && (
                      <ProjectDocsTab
                        docs={docsLoading ? [] : projectDocs}
                        loading={docsLoading}
                        onUpload={uploadDoc} onRemove={removeDoc} locale={locale}
                      />
                    )}

                    {/* İlanlar sekmesi */}
                    {projectTab === "ilanlar" && (
                      <ProjectListingsTab
                        projectId={p.id} projectTitle={p.title}
                        listings={projectListings}
                        setMyListings={setMyListings}
                        current={current} locale={locale}
                      />
                    )}

                    {/* Web Sitesi sekmesi — tam ekran builder'a yönlendir */}
                    {projectTab === "website" && (
                      <div className="p-6 text-center">
                        <div className="text-4xl mb-3">🌐</div>
                        <h3 className="font-bold text-ink mb-2">Proje Web Sitesi</h3>
                        <p className="text-sm text-slate mb-5 max-w-sm mx-auto">
                          Projeniz için özelleştirilebilir bir landing page oluşturun. 4 şablon, hero banner, navigasyon menüsü ve footer logo yönetimi.
                        </p>
                        <Link href={`/projeler/${p.id}/website`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-eu text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                          </svg>
                          Web Sitesi Oluşturucuyu Aç
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {memberProjects.length > 0 && (
        <div className="mt-4">
          <h2 className="text-base font-bold text-ink mb-3">{isEn ? "Projects I'm a Member Of" : "Konsorsiyum Üyesi Olduğum Projeler"}</h2>
          <div className="space-y-2">
            {memberProjects.map((p) => (
              <div key={p.id} className="bg-white border border-line rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-ink text-sm">{p.title}</h3>
                  <p className="text-xs text-mist mt-0.5">{isEn ? "Lead:" : "Yürütücü:"} {p.ownerSubscriberName}</p>
                </div>
                <Link href={`/projeler/${p.id}`} className="text-xs text-eu hover:underline">Gör →</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gelen Konsorsiyum Talepleri ── */}
      {incomingRequests.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-bold text-ink">Gelen Konsorsiyum Talepleri</h2>
            <span className="bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {incomingRequests.length}
            </span>
          </div>
          <p className="text-xs text-mist mb-3">
            Aşağıdaki firmalar projelerinize katılmak istiyor. İnceleyip onaylayabilir veya reddedebilirsiniz.
          </p>
          <div className="space-y-3">
            {incomingRequests.map((req) => {
              const project = ownedProjects.find((p) => p.id === req.projectId);
              return (
                <div key={req.id} className="bg-white border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-ink">{req.subscriberName}</span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                          {req.requestedRole === "yurutucu" ? "Yürütücü Talebi" : "Üye Katılım Talebi"}
                        </span>
                      </div>
                      {project && (
                        <p className="text-xs text-mist mb-1">
                          📁 Proje: <span className="font-medium text-ink">{project.title}</span>
                        </p>
                      )}
                      {req.note && (
                        <p className="text-sm text-slate bg-surface rounded-lg px-3 py-2 mt-2 italic">
                          "{req.note}"
                        </p>
                      )}
                      <p className="text-xs text-mist mt-1">
                        {new Date(req.createdAt).toLocaleDateString("tr-TR")} tarihinde gönderildi
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => resolveRequest(req.id, "onaylandi")}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Onayla
                      </button>
                      <button onClick={() => resolveRequest(req.id, "reddedildi")}
                        className="flex items-center gap-1.5 px-3 py-2 border border-line text-mist rounded-lg text-xs font-semibold hover:border-red-300 hover:text-red-500 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        Reddet
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Proje Ekip Sekmesi ──────────────────────────────────────
function ProjectTeamTab({ project, members, allSubscribers, currentId, onAdd, onRemove, locale }: {
  project: Project;
  members: import("@/lib/types").ConsortiumMember[];
  allSubscribers: Subscriber[]; currentId: string;
  onAdd: (subId: string, role: string) => void;
  onRemove: (subId: string) => void;
  locale: string;
}) {
  const [newSubId, setNewSubId] = useState("");
  const [newRole, setNewRole] = useState("");
  const available = allSubscribers.filter((s) => s.id !== currentId && !members.some((m) => m.subscriberId === s.id));

  return (
    <div>
      <p className="text-xs text-mist mb-3">Konsorsiyum üyeleri ve proje ekibi. Yürütücü: <strong className="text-ink">{project.ownerSubscriberName}</strong></p>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 p-2.5 bg-eu-pale rounded-lg">
          <span className="text-xs font-bold text-eu">🏆 Yürütücü</span>
          <span className="text-sm font-medium text-ink">{project.ownerSubscriberName}</span>
        </div>
        {members.map((m) => (
          <div key={m.subscriberId} className="flex items-center gap-3 p-2.5 bg-white border border-line rounded-lg">
            <div className="flex-1">
              <span className="text-sm font-medium text-ink">{m.subscriberName}</span>
              {m.role && <span className="text-xs text-mist ml-2">— {m.role}</span>}
            </div>
            <button onClick={() => onRemove(m.subscriberId)} className="text-xs text-mist hover:text-tr">Çıkar</button>
          </div>
        ))}
      </div>
      {available.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <select value={newSubId} onChange={(e) => setNewSubId(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
            <option value="">— Üye seçin —</option>
            {available.map((s) => <option key={s.id} value={s.id}>{s.organization ?? s.name}</option>)}
          </select>
          <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Rol (opsiyonel)"
            className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu min-w-[120px]" />
          <button onClick={() => { onAdd(newSubId, newRole); setNewSubId(""); setNewRole(""); }} disabled={!newSubId}
            className="px-3 py-2 bg-eu text-white rounded-lg text-sm font-semibold disabled:opacity-40">+ Ekle</button>
        </div>
      )}
    </div>
  );
}

// ── Proje Dosyalar Sekmesi ──────────────────────────────────
function ProjectDocsTab({ docs, loading, onUpload, onRemove, locale }: {
  docs: import("@/lib/types").ProjectDocument[]; loading: boolean;
  onUpload: (name: string) => void; onRemove: (id: string) => void; locale: string;
}) {
  const ACCESS: Record<string, string> = { herkes: "Herkese Açık", uye: "Üyeler", ekip: "Ekip" };
  return (
    <div>
      <label className="flex items-center justify-center gap-2 px-4 py-5 border-2 border-dashed border-line rounded-xl cursor-pointer hover:border-eu hover:bg-eu-pale transition-colors mb-4">
        <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f.name); e.target.value = ""; }} />
        <span className="text-slate text-sm">📎 Dosya yüklemek için tıklayın</span>
      </label>
      {loading ? <p className="text-sm text-mist">Yükleniyor…</p> : docs.length === 0 ? (
        <p className="text-sm text-mist">Bu projeye henüz dosya eklenmemiş.</p>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 p-3 bg-white border border-line rounded-xl">
              <div>
                <span className="text-sm font-medium text-ink">📄 {d.name}</span>
                <span className="text-xs text-mist ml-2">{ACCESS[d.accessLevel] ?? d.accessLevel}</span>
              </div>
              <button onClick={() => onRemove(d.id)} className="text-xs text-mist hover:text-tr">Sil</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Proje Web Sitesi Sekmesi ─────────────────────────────────
function ProjectWebsiteTab({ projectId, locale }: { projectId: string; locale: string }) {
  const db = getDataProvider();
  const isEn = locale === "en";

  const [website, setWebsite] = useState<import("@/lib/types").ProjectWebsite | null | undefined>(undefined);
  const [project, setProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [slugOk, setSlugOk] = useState(false);
  const [showLogoLib, setShowLogoLib] = useState(false);
  const [logoCategory, setLogoCategory] = useState("ab");
  const [previewLocale, setPreviewLocale] = useState<"tr" | "en">("tr");
  const [activeTab, setActiveTab] = useState<"template" | "header" | "hero" | "menu" | "footer" | "settings">("template");

  // Lazy import — website kütüphanesi sadece bu sekme açıkken yüklenir
  const { TEMPLATE_META, renderTemplate, WebsiteFooter } = require("@/lib/website/templates") as typeof import("@/lib/website/templates");
  const { LOGO_LIBRARY, LOGO_CATEGORIES, getLibraryLogo } = require("@/lib/website/logo-library") as typeof import("@/lib/website/logo-library");

  useEffect(() => {
    (async () => {
      const [w, p] = await Promise.all([db.getProjectWebsite(projectId), db.getProject(projectId)]);
      setProject(p);
      if (w) {
        setWebsite(w);
      } else if (p) {
        // Yeni site şablonu
        const slug = p.title.toLowerCase()
          .replace(/[ğüşıöçĞÜŞİÖÇ]/g, (c: string) => ({ğ:"g",ü:"u",ş:"s",ı:"i",ö:"o",ç:"c",Ğ:"g",Ü:"u",Ş:"s",İ:"i",Ö:"o",Ç:"c"}[c] ?? c))
          .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
        setWebsite({
          id: `pw-${Date.now()}`,
          projectId,
          ownerSubscriberId: "",
          slug,
          templateId: "minimal",
          headerVersion: 1,
          headerTr: { title: p.title, subtitle: p.summary?.slice(0, 100), tagline: "AB Destekli Proje" },
          headerEn: { title: p.title, subtitle: p.summary?.slice(0, 100), tagline: "EU-Funded Project" },
          footerLogos: [{ id: "fl-eu", source: "library", libraryKey: "eu", label: "Avrupa Birliği", order: 1 }],
          published: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          showObjective: true, showOutputs: true, showLocations: true, showBudget: true, showConsortium: false,
        });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const set = (patch: Partial<import("@/lib/types").ProjectWebsite>) =>
    setWebsite((w) => w ? { ...w, ...patch } : w);

  const handleSave = async () => {
    if (!website) return;
    setSaving(true);
    await db.saveProjectWebsite({ ...website, updatedAt: new Date().toISOString() });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const checkSlug = async (slug: string) => {
    if (!slug || slug.length < 3) { setSlugError("En az 3 karakter"); setSlugOk(false); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { setSlugError("Sadece küçük harf, rakam ve tire"); setSlugOk(false); return; }
    const ok = await db.isSlugAvailable(slug, projectId);
    if (ok) { setSlugError(""); setSlugOk(true); }
    else { setSlugError("Bu kısa ad kullanımda"); setSlugOk(false); }
  };

  if (website === undefined) return <div className="p-6 text-sm text-mist">Yükleniyor…</div>;
  if (!website || !project) return <div className="p-6 text-sm text-slate">Proje verisi alınamadı.</div>;

  const resolvedLogos = website.footerLogos.map((fl: import("@/lib/types").WebsiteFooterLogo) => ({
    id: fl.id,
    imageUrl: fl.source === "custom" ? fl.imageUrl : getLibraryLogo(fl.libraryKey ?? "")?.svgOrUrl,
    label: fl.label,
    libraryLogo: fl.libraryKey ? getLibraryLogo(fl.libraryKey) : undefined,
  }));

  const ACCENT_COLORS = ["#003399","#1D7A5F","#B45309","#7C3AED","#111827","#C2410C"];
  const accent = website.accentColor ?? "#003399";

  return (
    <div className="space-y-0">
      {/* Üst bar */}
      <div className="flex items-center gap-3 pb-3 mb-4 border-b border-line">
        <div className="text-xs text-mist flex-1">
          <span className="font-semibold text-ink">URL:</span>{" "}
          <span className="font-mono bg-surface px-1.5 py-0.5 rounded">euinturkiye.com/p/{website.slug}</span>
        </div>
        <button onClick={() => set({ published: !website.published })}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${website.published ? "bg-green-100 text-green-700" : "bg-surface text-slate border border-line"}`}>
          {website.published ? "✓ Yayında" : "Taslak"}
        </button>
        {website.published && (
          <a href={`/p/${website.slug}`} target="_blank" rel="noopener noreferrer"
            className="text-xs text-eu font-semibold hover:underline">↗ Görüntüle</a>
        )}
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-1.5 bg-eu text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-60">
          {saving ? "…" : saved ? "✓ Kaydedildi" : "Kaydet"}
        </button>
      </div>

      {/* Ana içerik — iki kolon */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Sol: Editor paneli */}
        <div className="lg:col-span-2 space-y-4">
          {/* Editör sekme nav */}
          <div className="flex gap-0.5 bg-surface rounded-xl p-1 flex-wrap">
            {(["template", "header", "hero", "menu", "footer", "settings"] as const).map((t) => {
              const labels: Record<string, string> = { template: "Şablon", header: "Başlık", hero: "Banner", menu: "Menü", footer: "Footer", settings: "Ayarlar" };
              return (
                <button key={t} onClick={() => setActiveTab(t as typeof activeTab)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === t ? "bg-white text-eu shadow-sm" : "text-slate hover:text-ink"}`}>
                  {labels[t]}
                </button>
              );
            })}
          </div>

          {/* ── ŞABLON ── */}
          {activeTab === "template" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_META.map((tm) => {
                  const selected = website.templateId === tm.id;
                  return (
                    <button key={tm.id} onClick={() => set({ templateId: tm.id })}
                      className={`border-2 rounded-xl overflow-hidden text-left transition-all ${selected ? "border-eu shadow-md" : "border-line hover:border-eu/40"}`}>
                      {/* Mini önizleme */}
                      <div style={{ height: 60, background: tm.preview.bg, position: "relative", borderBottom: `2px solid ${website.accentColor ?? tm.preview.accent}30` }}>
                        {tm.preview.style === "dark" ? (
                          <>
                            <div style={{ position: "absolute", inset: 0, background: "#111827" }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 16, background: website.accentColor ?? tm.preview.accent }} />
                            <div style={{ position: "absolute", top: 10, left: 10, right: 10 }}>
                              <div style={{ height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 2, width: "70%", marginBottom: 4 }} />
                              <div style={{ height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, width: "45%" }} />
                            </div>
                          </>
                        ) : tm.preview.style === "sidebar" ? (
                          <div style={{ position: "absolute", inset: 0, display: "flex" }}>
                            <div style={{ width: 36, background: "#f8fafc", borderRight: "1px solid #e2e8f0" }} />
                            <div style={{ flex: 1, padding: 8 }}>
                              <div style={{ height: 3, background: "#1e293b", borderRadius: 2, width: "80%", marginBottom: 4 }} />
                              <div style={{ height: 2.5, background: "#94a3b8", borderRadius: 2, width: "60%", marginBottom: 3 }} />
                              <div style={{ height: 2.5, background: "#94a3b8", borderRadius: 2, width: "50%" }} />
                            </div>
                          </div>
                        ) : tm.preview.style === "stats" ? (
                          <>
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 22, background: website.accentColor ?? tm.preview.accent, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 8px" }}>
                              {["€275M","23 İl"].map(v => <span key={v} style={{ fontSize: 8, fontWeight: 800, color: "#FFCC00" }}>{v}</span>)}
                            </div>
                            <div style={{ position: "absolute", top: 26, left: 10, right: 10 }}>
                              <div style={{ height: 3, background: "#1e293b", borderRadius: 2, width: "75%", marginBottom: 3 }} />
                              <div style={{ height: 2.5, background: "#94a3b8", borderRadius: 2, width: "50%" }} />
                            </div>
                          </>
                        ) : (
                          <div style={{ position: "absolute", top: 10, left: 10, right: 10 }}>
                            <div style={{ height: 4, background: "#1e293b", borderRadius: 2, width: "80%", marginBottom: 5 }} />
                            <div style={{ height: 2.5, background: "#94a3b8", borderRadius: 2, width: "55%", marginBottom: 3 }} />
                            <div style={{ height: 2, background: "#cbd5e1", borderRadius: 2, width: "40%" }} />
                          </div>
                        )}
                        {selected && <div style={{ position: "absolute", top: 4, right: 4, background: "#003399", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff" }}>✓</div>}
                      </div>
                      <div className="p-2.5">
                        <div className="text-xs font-bold text-ink">{tm.label}</div>
                        <div className="text-[9px] text-mist mt-0.5 leading-tight">{tm.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1.5">Vurgu Rengi</label>
                <div className="flex items-center gap-2 mb-2">
                  <input type="color" value={accent} onChange={(e) => set({ accentColor: e.target.value })}
                    className="w-9 h-8 rounded cursor-pointer border border-line" />
                  <input value={accent} onChange={(e) => set({ accentColor: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 border border-line rounded-lg text-xs font-mono focus:outline-none focus:border-eu" />
                </div>
                <div className="flex gap-1.5">
                  {ACCENT_COLORS.map((c) => (
                    <button key={c} onClick={() => set({ accentColor: c })}
                      className={`w-5 h-5 rounded-full border-2 ${website.accentColor === c ? "border-ink" : "border-transparent"}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BAŞLIK ── */}
          {activeTab === "header" && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-mist mb-2">Header Versiyonu</p>
                <div className="flex gap-2">
                  {([1,2,3] as const).map((v) => (
                    <button key={v} onClick={() => set({ headerVersion: v })}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border-2 transition-all ${website.headerVersion === v ? "border-eu text-eu bg-eu-pale" : "border-line text-slate"}`}>
                      V{v}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-mist mt-1.5">
                  {website.headerVersion === 1 ? "Logo sol, metin orta, yıldız sağ" :
                   website.headerVersion === 2 ? "İki kolon — metin sol, logo sağ dikey" :
                   "Üst renk şerit + yatay içerik"}
                </p>
              </div>
              {(["tr","en"] as const).map((lang) => {
                const key = lang === "tr" ? "headerTr" : "headerEn";
                const val = website[key];
                return (
                  <div key={lang} className="border border-line rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white bg-eu px-2 py-0.5 rounded-full">{lang.toUpperCase()}</span>
                      <span className="text-xs text-mist">{lang === "tr" ? "Türkçe" : "İngilizce"}</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-mist mb-0.5">Başlık *</label>
                      <input value={val.title} onChange={(e) => set({ [key]: { ...val, title: e.target.value } })}
                        className="w-full px-2 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-mist mb-0.5">Alt Başlık</label>
                      <textarea value={val.subtitle ?? ""} onChange={(e) => set({ [key]: { ...val, subtitle: e.target.value } })}
                        rows={2} className="w-full px-2 py-1.5 border border-line rounded-lg text-xs resize-none focus:outline-none focus:border-eu" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-mist mb-0.5">Tagline</label>
                      <input value={val.tagline ?? ""} onChange={(e) => set({ [key]: { ...val, tagline: e.target.value } })}
                        className="w-full px-2 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── HERO BANNER ── */}
          {activeTab === "hero" && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => set({ heroBanner: { ...(website.heroBanner ?? { enabled: false }), enabled: !website.heroBanner?.enabled } })}
                  className={`w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${website.heroBanner?.enabled ? "bg-eu" : "bg-line"}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full mt-0.5 transition-transform shadow-sm ${website.heroBanner?.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm font-semibold text-ink">Hero Banner Aktif</span>
              </label>
              {website.heroBanner?.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-mist mb-1.5">Banner Görseli</label>
                    <label className="block border-2 border-dashed border-line rounded-xl p-4 text-center cursor-pointer hover:border-eu transition-colors">
                      <span className="text-xs text-eu font-semibold">
                        {website.heroBanner.imageUrl ? "✓ Görsel yüklendi — değiştir" : "Görsel Yükle (JPG/PNG)"}
                      </span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => set({ heroBanner: { ...website.heroBanner!, enabled: true, imageUrl: ev.target?.result as string } });
                          reader.readAsDataURL(file);
                        }} />
                    </label>
                    {website.heroBanner.imageUrl && (
                      <button onClick={() => set({ heroBanner: { ...website.heroBanner!, imageUrl: undefined } })}
                        className="mt-1 text-xs text-red-500 hover:underline">Görseli kaldır</button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mist mb-1">Banner Yüksekliği</label>
                    <div className="flex gap-1.5">
                      {(["sm", "md", "lg"] as const).map((h) => (
                        <button key={h} onClick={() => set({ heroBanner: { ...website.heroBanner!, height: h } })}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${(website.heroBanner?.height ?? "md") === h ? "border-eu text-eu bg-eu-pale" : "border-line text-slate"}`}>
                          {h === "sm" ? "Dar (300px)" : h === "md" ? "Orta (420px)" : "Geniş (580px)"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mist mb-1">
                      Overlay Yoğunluğu ({Math.round((website.heroBanner.overlayOpacity ?? 0.5) * 100)}%)
                    </label>
                    <input type="range" min="0" max="90" step="5"
                      value={Math.round((website.heroBanner.overlayOpacity ?? 0.5) * 100)}
                      onChange={(e) => set({ heroBanner: { ...website.heroBanner!, overlayOpacity: Number(e.target.value) / 100 } })}
                      className="w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mist mb-1">CTA Butonu (TR)</label>
                    <div className="flex gap-2">
                      <input value={website.heroBanner.ctaLabel ?? ""} onChange={(e) => set({ heroBanner: { ...website.heroBanner!, ctaLabel: e.target.value } })}
                        placeholder="Daha Fazla Bilgi"
                        className="flex-1 px-2.5 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                      <input value={website.heroBanner.ctaLabelEn ?? ""} onChange={(e) => set({ heroBanner: { ...website.heroBanner!, ctaLabelEn: e.target.value } })}
                        placeholder="Learn More (EN)"
                        className="flex-1 px-2.5 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mist mb-1">CTA Linki</label>
                    <input value={website.heroBanner.ctaUrl ?? ""} onChange={(e) => set({ heroBanner: { ...website.heroBanner!, ctaUrl: e.target.value } })}
                      placeholder="#proje-amaci veya https://..."
                      className="w-full px-2.5 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MENÜ ── */}
          {activeTab === "menu" && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => set({ navMenu: { items: website.navMenu?.items ?? [], enabled: !website.navMenu?.enabled } })}
                  className={`w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${website.navMenu?.enabled ? "bg-eu" : "bg-line"}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full mt-0.5 transition-transform shadow-sm ${website.navMenu?.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm font-semibold text-ink">Navigasyon Menüsü</span>
              </label>
              {website.navMenu?.enabled && (
                <div className="space-y-2">
                  <p className="text-xs text-mist">Menü öğeleri ekleyin. Bölüm linkleri için # kullanın (ör. #proje-amaci)</p>
                  {(website.navMenu.items ?? []).map((item, idx) => (
                    <div key={idx} className="flex gap-1.5 items-center">
                      <input value={item.label} onChange={(e) => {
                        const items = [...website.navMenu!.items];
                        items[idx] = { ...item, label: e.target.value };
                        set({ navMenu: { ...website.navMenu!, items } });
                      }} placeholder="TR Etiket" className="flex-1 px-2 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                      <input value={item.labelEn ?? ""} onChange={(e) => {
                        const items = [...website.navMenu!.items];
                        items[idx] = { ...item, labelEn: e.target.value };
                        set({ navMenu: { ...website.navMenu!, items } });
                      }} placeholder="EN Label" className="flex-1 px-2 py-1.5 border border-line rounded-lg text-xs focus:outline-none focus:border-eu" />
                      <input value={item.href} onChange={(e) => {
                        const items = [...website.navMenu!.items];
                        items[idx] = { ...item, href: e.target.value };
                        set({ navMenu: { ...website.navMenu!, items } });
                      }} placeholder="#link" className="flex-1 px-2 py-1.5 border border-line rounded-lg text-xs font-mono focus:outline-none focus:border-eu" />
                      <button onClick={() => {
                        const items = website.navMenu!.items.filter((_, i) => i !== idx);
                        set({ navMenu: { ...website.navMenu!, items } });
                      }} className="w-6 h-6 text-red-400 border border-red-200 rounded flex-shrink-0 text-xs hover:bg-red-50">✕</button>
                    </div>
                  ))}
                  <button onClick={() => set({ navMenu: { ...website.navMenu!, items: [...(website.navMenu?.items ?? []), { label: "Bölüm", labelEn: "Section", href: "#" }] } })}
                    className="w-full py-2 border-2 border-dashed border-line rounded-lg text-xs text-slate hover:border-eu hover:text-eu transition-colors">
                    + Menü Öğesi Ekle
                  </button>
                  <div className="bg-eu-pale rounded-lg p-2.5 text-xs text-eu">
                    <strong>Hazır bölümler:</strong> #proje-amaci · #ciktilar · #uygulama-yerleri · #konsorsiyum · #iletisim
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── FOOTER ── */}
          {activeTab === "footer" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-mist">Footer Logoları</p>
                <button onClick={() => setShowLogoLib(true)} className="text-xs text-eu font-semibold">+ Kütüphane</button>
              </div>
              {website.footerLogos.length === 0 ? (
                <div className="bg-surface rounded-lg p-4 text-center text-xs text-mist">Logo yok — kütüphaneden ekleyin veya yükleyin.</div>
              ) : (
                <div className="space-y-1.5">
                  {[...website.footerLogos].sort((a,b)=>a.order-b.order).map((fl, idx) => {
                    const lib = fl.libraryKey ? getLibraryLogo(fl.libraryKey) : undefined;
                    const src = fl.source === "custom" ? fl.imageUrl : lib?.svgOrUrl;
                    return (
                      <div key={fl.id} className="flex items-center gap-2 bg-surface rounded-lg p-2">
                        <div className="w-10 h-7 flex items-center justify-center bg-white rounded border border-line flex-shrink-0">
                          {src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={src} alt="" className="max-w-full max-h-full object-contain" />
                          ) : <span className="text-[9px] text-mist">?</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-ink truncate">{fl.label ?? lib?.label ?? "Logo"}</p>
                        </div>
                        <div className="flex gap-1">
                          <button disabled={idx === 0}
                            onClick={() => {
                              const logs = [...website.footerLogos].sort((a,b)=>a.order-b.order);
                              [logs[idx-1].order, logs[idx].order] = [logs[idx].order, logs[idx-1].order];
                              set({ footerLogos: [...logs] });
                            }}
                            className="w-5 h-5 text-[10px] text-slate border border-line rounded disabled:opacity-30">←</button>
                          <button disabled={idx === website.footerLogos.length-1}
                            onClick={() => {
                              const logs = [...website.footerLogos].sort((a,b)=>a.order-b.order);
                              [logs[idx+1].order, logs[idx].order] = [logs[idx].order, logs[idx+1].order];
                              set({ footerLogos: [...logs] });
                            }}
                            className="w-5 h-5 text-[10px] text-slate border border-line rounded disabled:opacity-30">→</button>
                          <button onClick={() => set({ footerLogos: website.footerLogos.filter((x) => x.id !== fl.id) })}
                            className="w-5 h-5 text-[10px] text-red-500 border border-red-200 rounded hover:bg-red-50">✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Kendi logosu */}
              <label className="block border-2 border-dashed border-line rounded-lg p-3 text-center cursor-pointer hover:border-eu">
                <span className="text-xs text-eu font-semibold">+ Kendi logonu yükle (PNG/SVG)</span>
                <input type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const url = ev.target?.result as string;
                      set({ footerLogos: [...website.footerLogos, { id: `fl-c-${Date.now()}`, source: "custom", imageUrl: url, label: file.name.replace(/\.[^.]+$/, ""), order: website.footerLogos.length + 1 }] });
                    };
                    reader.readAsDataURL(file);
                  }} />
              </label>
            </div>
          )}

          {/* ── AYARLAR ── */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Kısa URL</label>
                <p className="text-[10px] text-mist mb-1">euinturkiye.com/p/<span className="font-mono font-bold text-ink">{website.slug}</span></p>
                <div className="flex gap-2">
                  <input value={website.slug} onChange={(e) => { set({ slug: e.target.value }); setSlugOk(false); setSlugError(""); }}
                    className={`flex-1 px-2.5 py-1.5 border rounded-lg text-xs font-mono focus:outline-none ${slugError ? "border-red-400" : slugOk ? "border-green-500" : "border-line focus:border-eu"}`} />
                  <button onClick={() => checkSlug(website.slug)} className="px-2.5 py-1.5 text-xs border border-line rounded-lg hover:bg-surface">✓</button>
                </div>
                {slugError && <p className="text-[10px] text-red-500 mt-1">{slugError}</p>}
                {slugOk && <p className="text-[10px] text-green-600 mt-1">✓ Uygun</p>}
              </div>
              <div>
                <p className="text-xs font-semibold text-mist mb-2">Gösterilecek Bölümler</p>
                {[
                  { key: "showObjective", label: "Proje Amacı" },
                  { key: "showOutputs", label: "Çıktılar" },
                  { key: "showLocations", label: "Uygulama Yerleri" },
                  { key: "showBudget", label: "Bütçe" },
                  { key: "showConsortium", label: "Konsorsiyum" },
                  { key: "showTeam", label: "Ekip" },
                  { key: "showDocuments", label: "Paylaşılan Dosyalar" },
                  { key: "showNews", label: "Haberler" },
                  { key: "showEvents", label: "Etkinlikler" },
                  { key: "showContact", label: "İletişim & Sosyal Medya" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 py-1.5 cursor-pointer border-b border-line/60 last:border-0">
                    <div onClick={() => set({ [key]: !website[key as keyof typeof website] })}
                      className={`w-8 h-4 rounded-full transition-colors cursor-pointer flex-shrink-0 ${website[key as keyof typeof website] ? "bg-eu" : "bg-line"}`}>
                      <div className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform shadow-sm ${website[key as keyof typeof website] ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-xs text-slate">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ: Canlı önizleme */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-mist">Önizleme:</span>
            <button onClick={() => setPreviewLocale("tr")}
              className={`text-xs px-2 py-0.5 rounded font-semibold ${previewLocale === "tr" ? "bg-eu text-white" : "text-slate border border-line"}`}>TR</button>
            <button onClick={() => setPreviewLocale("en")}
              className={`text-xs px-2 py-0.5 rounded font-semibold ${previewLocale === "en" ? "bg-eu text-white" : "text-slate border border-line"}`}>EN</button>
          </div>
          <div className="border border-line rounded-xl overflow-hidden bg-white" style={{ maxHeight: 520, overflowY: "auto" }}>
            <div style={{ transform: "scale(0.7)", transformOrigin: "top left", width: "143%", pointerEvents: "none" }}>
              {renderTemplate({ website, project, sector: null, donor: null, resolvedLogos, locale: previewLocale, preview: true })}
            </div>
          </div>
        </div>
      </div>

      {/* Logo kütüphanesi modal */}
      {showLogoLib && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoLib(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[65vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-line flex items-center justify-between">
              <h3 className="font-bold text-ink text-sm">Logo Kütüphanesi</h3>
              <button onClick={() => setShowLogoLib(false)} className="text-mist hover:text-ink text-xl leading-none">×</button>
            </div>
            <div className="px-4 py-2 border-b border-line flex gap-1.5 overflow-x-auto">
              {LOGO_CATEGORIES.map((cat: { id: string; label: string }) => (
                <button key={cat.id} onClick={() => setLogoCategory(cat.id)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${logoCategory === cat.id ? "bg-eu text-white" : "bg-surface text-slate"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2">
              {LOGO_LIBRARY.filter((l: { category: string }) => l.category === logoCategory).map((lib: { key: string; svgOrUrl: string; label: string }) => {
                const already = website.footerLogos.some((fl) => fl.libraryKey === lib.key);
                return (
                  <button key={lib.key} disabled={already}
                    onClick={() => {
                      set({ footerLogos: [...website.footerLogos, { id: `fl-${lib.key}-${Date.now()}`, source: "library", libraryKey: lib.key, label: lib.label, order: website.footerLogos.length + 1 }] });
                      setShowLogoLib(false);
                    }}
                    className={`border-2 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center transition-all ${already ? "border-line opacity-40 cursor-not-allowed" : "border-line hover:border-eu"}`}>
                    <div className="w-14 h-8 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={lib.svgOrUrl} alt={lib.label} className="max-w-full max-h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <span className="text-[9px] text-slate leading-tight">{lib.label}</span>
                    {already && <span className="text-[9px] text-green-600">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Proje İlanlar Sekmesi ───────────────────────────────────
function ProjectListingsTab({ projectId, projectTitle, listings, setMyListings, current, locale }: {
  projectId: string; projectTitle: string;
  listings: Listing[]; setMyListings: React.Dispatch<React.SetStateAction<Listing[]>>;
  current: Subscriber; locale: string;
}) {
  const canTender = canPostTender(current.profileType);
  const TYPE_LABEL: Record<string, string> = { is: "İş İlanı", satinalma: "Satınalma", ihale: "İhale" };
  const TYPE_COLOR: Record<string, string> = { is: "bg-blue-100 text-blue-700", satinalma: "bg-orange-100 text-orange-700", ihale: "bg-purple-100 text-purple-700" };

  const addListing = async (type: import("@/lib/types").ListingType) => {
    const l: Listing = {
      id: `ilan-${Date.now()}`, type, projectId, title: `${projectTitle} — Yeni ${TYPE_LABEL[type]}`,
      organization: current.organization ?? current.name, locked: type !== "is",
      description: "", publisherSubscriberId: current.id, publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(), isActive: true,
    };
    await getDataProvider().saveListing(l);
    setMyListings((prev) => [l, ...prev]);
  };

  return (
    <div>
      <p className="text-xs text-mist mb-3">Bu projeye bağlı ilanlar. Yeni ilan oluşturunca otomatik projeye bağlanır.</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {!canTender && <button onClick={() => addListing("is")} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">+ İş İlanı</button>}
        {!canTender && <button onClick={() => addListing("satinalma")} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold">+ Satınalma</button>}
        {canTender && <button onClick={() => addListing("ihale")} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold">+ İhale</button>}
      </div>
      {listings.length === 0 ? (
        <p className="text-sm text-mist">Bu projeye ait ilan yok.</p>
      ) : (
        <div className="space-y-2">
          {listings.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3 p-3 bg-white border border-line rounded-xl">
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mr-2 ${TYPE_COLOR[l.type]}`}>{TYPE_LABEL[l.type]}</span>
                <span className="text-sm font-medium text-ink">{l.title}</span>
              </div>
              <Link href={`/ilanlar/${l.id}`} className="text-xs text-eu hover:underline">Gör →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── İlanlarım ─────────────────────────────────────────────────
function ListingsTab({ current, locale, myListings, setMyListings, ownedProjects, canTender }: {
  current: Subscriber; locale: string;
  myListings: Listing[]; setMyListings: (fn: (prev: Listing[]) => Listing[]) => void;
  ownedProjects: Project[]; canTender: boolean;
}) {
  const isEn = locale === "en";
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Listing | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [expiryDays, setExpiryDays] = useState("30");
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [activeView, setActiveView] = useState<"mine" | "saved">("mine");

  useEffect(() => {
    Promise.all([
      getDataProvider().getSavedListings(current.id),
      getDataProvider().getListings(),
    ]).then(([saved, all]) => { setSavedListings(saved); setAllListings(all); });
  }, [current.id]);

  const bookmarkListing = async (listingId: string) => {
    if (savedListings.some((s) => s.listingId === listingId)) return;
    const s: SavedListing = { id: `sv-${Date.now()}`, subscriberId: current.id, listingId, savedAt: new Date().toISOString() };
    await getDataProvider().saveListing_bookmark(s);
    setSavedListings((prev) => [s, ...prev]);
  };

  const unbookmark = async (id: string) => {
    await getDataProvider().removeSavedListing(id);
    setSavedListings((prev) => prev.filter((s) => s.id !== id));
  };

  const TYPE_LABEL: Record<string, string> = { is: "İş İlanı", satinalma: "Satınalma", ihale: "İhale" };
  const TYPE_COLOR: Record<string, string> = { is: "bg-blue-100 text-blue-700", satinalma: "bg-orange-100 text-orange-700", ihale: "bg-purple-100 text-purple-700" };

  const emptyListing = (): Listing => ({
    id: `ilan-${Date.now()}`, type: canTender ? "ihale" : "is",
    title: "", organization: current.organization ?? current.name ?? "",
    locked: false, description: "", publisherSubscriberId: current.id,
    publishedAt: new Date().toISOString(),
  });

  const openNew = (type?: ListingType) => {
    const l = emptyListing();
    if (type) l.type = type;
    setForm(l); setShowForm(true);
  };
  const openEdit = (l: Listing) => { setForm({ ...l }); setShowForm(true); };

  const save = async () => {
    if (!form?.title) return;
    const withExpiry: Listing = expiryDays
      ? { ...form, expiresAt: new Date(Date.now() + Number(expiryDays) * 86400000).toISOString() }
      : { ...form };
    await getDataProvider().saveListing(withExpiry);
    setMyListings((prev) => {
      const i = prev.findIndex((x) => x.id === withExpiry.id);
      return i !== -1 ? prev.map((x, j) => j === i ? withExpiry : x) : [withExpiry, ...prev];
    });
    setShowForm(false); setForm(null);
  };

  const del = async (id: string) => {
    await getDataProvider().removeListing(id);
    setMyListings((prev) => prev.filter((l) => l.id !== id));
    setConfirmDel(null);
  };

  const isExpired = (l: Listing) => l.expiresAt ? new Date(l.expiresAt) < new Date() : false;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex gap-1 bg-surface rounded-xl p-1">
          <button onClick={() => setActiveView("mine")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeView === "mine" ? "bg-white shadow-sm text-ink" : "text-slate"}`}>
            Kendi İlanlarım
          </button>
          <button onClick={() => setActiveView("saved")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeView === "saved" ? "bg-white shadow-sm text-ink" : "text-slate"}`}>
            🔖 İzlediklerim
            {savedListings.length > 0 && (
              <span className="bg-eu text-white rounded-full px-1.5 py-0.5 text-xs leading-none">{savedListings.length}</span>
            )}
          </button>
        </div>
        {activeView === "mine" && (
          <div className="flex gap-2">
            {!canTender && (
              <>
                <button onClick={() => openNew("is")} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
                  <Icon id="plus" className="w-3.5 h-3.5" /> İş İlanı
                </button>
                <button onClick={() => openNew("satinalma")} className="flex items-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold">
                  <Icon id="plus" className="w-3.5 h-3.5" /> Satınalma
                </button>
              </>
            )}
            {canTender && (
              <button onClick={() => openNew("ihale")} className="flex items-center gap-1.5 px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
                <Icon id="plus" className="w-4 h-4" /> Yeni İhale
              </button>
            )}
          </div>
        )}
      </div>

      {/* İzlenen ilanlar görünümü */}
      {activeView === "saved" && (
        <div>
          <p className="text-xs text-mist mb-4">
            İzlediğiniz ilanlar. Herhangi bir ilanın detay sayfasında "İzle" butonunu kullanarak buraya ekleyebilirsiniz.
          </p>
          {savedListings.length === 0 ? (
            <div className="bg-white border border-line rounded-2xl p-8 text-center">
              <p className="text-slate text-sm mb-3">Henüz izlediğiniz ilan yok.</p>
              <Link href="/ilanlar" className="text-eu text-sm font-semibold hover:underline">İlanlara Göz At →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {savedListings.map((sv) => {
                const l = allListings.find((x) => x.id === sv.listingId);
                if (!l) return null;
                const TYPE_LABEL: Record<string, string> = { is: "İş İlanı", satinalma: "Satınalma", ihale: "İhale" };
                const TYPE_COLOR: Record<string, string> = { is: "bg-blue-100 text-blue-700", satinalma: "bg-orange-100 text-orange-700", ihale: "bg-purple-100 text-purple-700" };
                return (
                  <div key={sv.id} className="bg-white border border-line rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mr-2 ${TYPE_COLOR[l.type]}`}>{TYPE_LABEL[l.type]}</span>
                      <span className="font-semibold text-ink text-sm">{l.title}</span>
                      {l.deadline && <span className="text-xs text-mist ml-2">Son: {new Date(l.deadline).toLocaleDateString("tr-TR")}</span>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link href={`/ilanlar/${l.id}`} className="text-xs text-eu hover:underline">Gör</Link>
                      <button onClick={() => unbookmark(sv.id)} className="text-xs text-mist hover:text-tr">Kaldır</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Kendi ilanlarım görünümü */}
      {activeView === "mine" && (
        <>
        {showForm && form && (
        <ListingForm
          form={form} setForm={(f: Listing) => setForm(f)}
          ownedProjects={ownedProjects} canTender={canTender}
          expiryDays={expiryDays} setExpiryDays={setExpiryDays}
          locale={locale} onSave={save} onCancel={() => { setShowForm(false); setForm(null); }}
        />
        )}

      {myListings.length === 0 && !showForm ? (
        <div className="bg-white border border-line rounded-2xl p-8 text-center">
          <p className="text-slate">{isEn ? "No listings yet." : "Henüz ilan eklenmemiş."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myListings.map((l) => (
            <div key={l.id} className={`bg-white border rounded-xl p-4 ${isExpired(l) ? "border-line opacity-60" : "border-line"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_COLOR[l.type]}`}>{TYPE_LABEL[l.type]}</span>
                    {isExpired(l) && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Süresi Dolmuş</span>}
                    {l.projectId && ownedProjects.find((p) => p.id === l.projectId) && (
                      <span className="text-xs bg-surface text-mist px-2 py-0.5 rounded">
                        📁 {ownedProjects.find((p) => p.id === l.projectId)?.title}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-ink">{l.title}</h3>
                  {l.subject && <p className="text-sm text-slate mt-0.5">{l.subject}</p>}
                  <div className="flex gap-3 mt-1 text-xs text-mist flex-wrap">
                    {l.deadline && <span>Son Başvuru: {new Date(l.deadline).toLocaleDateString("tr-TR")}</span>}
                    {l.expiresAt && <span>Yayın Sonu: {new Date(l.expiresAt).toLocaleDateString("tr-TR")}</span>}
                    {l.budget && <span>Bütçe: {l.budget}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href={`/ilanlar/${l.id}`} className="text-xs text-mist hover:text-eu">Gör</Link>
                  <button onClick={() => openEdit(l)} className="text-xs text-eu font-semibold hover:underline">Düzenle</button>
                  {confirmDel === l.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => del(l.id)} className="text-xs text-tr font-semibold">Evet</button>
                      <button onClick={() => setConfirmDel(null)} className="text-xs text-mist">İptal</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDel(l.id)} className="text-xs text-mist hover:text-tr">Sil</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}

// ── Etkinliklerim ─────────────────────────────────────────────
function EventsTab({ current, locale }: { current: Subscriber; locale: string }) {
  const isEn = locale === "en";
  const [events, setEvents] = useState<import("@/lib/types").EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDataProvider().getEvents().then((all) => {
      setEvents(all.filter((e) => e.organizerSubscriberId === current.id));
      setLoading(false);
    });
  }, [current.id]);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);

  if (loading) return <div className="text-center py-10 text-slate">Yükleniyor…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-ink">{isEn ? "My Events" : "Etkinliklerim"}</h2>
        <Link href="/araclar/etkinlik" className="flex items-center gap-1.5 px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
          <Icon id="plus" className="w-4 h-4" /> {isEn ? "New Event" : "Yeni Etkinlik"}
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-8 text-center">
          <p className="text-slate mb-4">{isEn ? "No events yet." : "Henüz etkinlik oluşturulmadı."}</p>
          <Link href="/araclar/etkinlik" className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold inline-block">
            {isEn ? "Create First Event" : "İlk Etkinliği Oluştur"}
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{isEn ? "Upcoming" : "Yaklaşan"}</h3>
              <div className="space-y-2">
                {upcoming.map((e) => (
                  <EventCard key={e.id} event={e} locale={locale} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{isEn ? "Past" : "Geçmiş"}</h3>
              <div className="space-y-2 opacity-70">
                {past.map((e) => (
                  <EventCard key={e.id} event={e} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event: e, locale }: { event: import("@/lib/types").EventItem; locale: string }) {
  const isEn = locale === "en";
  const d = new Date(e.date);
  const isPast = d < new Date();
  return (
    <div className="bg-white border border-line rounded-xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-eu-pale rounded-lg p-2 text-center w-14 flex-shrink-0">
          <div className="text-xs text-eu font-semibold">{d.toLocaleString(isEn ? "en-GB" : "tr-TR", { month: "short" })}</div>
          <div className="text-lg font-bold text-ink leading-none">{d.getDate()}</div>
        </div>
        <div>
          <h3 className="font-semibold text-ink text-sm">{e.title}</h3>
          <div className="flex gap-3 text-xs text-mist mt-0.5">
            <span>📍 {e.location}</span>
            {e.capacity && <span>👥 Kapasite: {e.capacity}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isPast && (
          <Link href="/araclar/etkinlik" className="text-xs text-eu font-semibold hover:underline">Yönet</Link>
        )}
        <Link href={`/etkinlikler/${e.id}`} className="text-xs text-mist hover:text-eu">Gör</Link>
      </div>
    </div>
  );
}

// ── Dijital Araçlar ───────────────────────────────────────────
function ToolsTab({ role, locale, plan }: { role: SubscriberProfileType; locale: string; plan: string }) {
  const isEn = locale === "en";
  const isPaid = plan === "yonetici" || plan === "tedarikci";
  const myTools = TOOLS.filter((t) => t.roles.includes(role));

  return (
    <div>
      <h2 className="text-lg font-bold text-ink mb-4">{isEn ? "Digital Tools" : "Dijital Araçlar"}</h2>

      {/* Ücretsiz plan uyarısı */}
      {!isPaid && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">🔒</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 mb-1">
              {isEn ? "Digital tools require a paid plan" : "Dijital araçlar ücretli plan gerektirir"}
            </p>
            <p className="text-amber-700 text-sm mb-3">
              {isEn
                ? "Your free profile gives you access to the project catalog, news and listings. Upgrade to unlock all digital tools."
                : "Ücretsiz profiliniz ile proje kataloğu, haberler ve ilanları görüntüleyebilirsiniz. Dijital araçların tümünü açmak için yükseltin."}
            </p>
            <a href="/kayit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-eu text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
              {isEn ? "See Pricing Plans" : "Paketleri İncele"}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${!isPaid ? "opacity-50 pointer-events-none select-none" : ""}`}>
        {myTools.map((tool) => (
          <Link key={tool.id} href={isPaid ? tool.href : "#"}
            className="bg-white border border-line rounded-xl p-4 flex flex-col gap-2 hover:border-eu hover:shadow-sm transition-all group">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ background: tool.color + "18", color: tool.color }}>
              <ToolIcon svgPath={tool.svgPath} className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-ink leading-tight mb-0.5">
                {isEn ? tool.labelEn : tool.label}
              </p>
              <p className="text-[10px] text-mist leading-tight">
                {isEn ? tool.descEn : tool.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Adres Defteri ─────────────────────────────────────────────
function AddressTab({ current, locale, allSubscribers, groups, setGroups }: {
  current: Subscriber; locale: string;
  allSubscribers: Subscriber[]; groups: AddressGroup[]; setGroups: (g: AddressGroup[]) => void;
}) {
  const isEn = locale === "en";
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [filterRole, setFilterRole] = useState<SubscriberProfileType | "">("");
  const [msgText, setMsgText] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  // Tüm kayıtlı aboneler (kendisi hariç)
  const directory = allSubscribers.filter((s) => s.id !== current.id);
  const filtered = directory.filter((s) => {
    const q = searchQ.toLocaleLowerCase("tr");
    const match = !q || [s.organization ?? "", s.name, s.email].join(" ").toLocaleLowerCase("tr").includes(q);
    const roleMatch = !filterRole || s.profileType === filterRole;
    return match && roleMatch;
  });

  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const groupMembers = activeGroup
    ? allSubscribers.filter((s) => activeGroup.memberIds.includes(s.id))
    : [];

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    const g: AddressGroup = {
      id: `ag-${Date.now()}`, ownerSubscriberId: current.id,
      name: newGroupName.trim(), memberIds: [], createdAt: new Date().toISOString(),
    };
    await getDataProvider().saveAddressGroup(g);
    setGroups([...groups, g]);
    setNewGroupName(""); setShowNewGroup(false); setActiveGroupId(g.id);
  };

  const addToGroup = async (subId: string) => {
    if (!activeGroup) return;
    if (activeGroup.memberIds.includes(subId)) return;
    const updated = { ...activeGroup, memberIds: [...activeGroup.memberIds, subId] };
    await getDataProvider().saveAddressGroup(updated);
    setGroups(groups.map((g) => g.id === updated.id ? updated : g));
  };

  const removeFromGroup = async (subId: string) => {
    if (!activeGroup) return;
    const updated = { ...activeGroup, memberIds: activeGroup.memberIds.filter((id) => id !== subId) };
    await getDataProvider().saveAddressGroup(updated);
    setGroups(groups.map((g) => g.id === updated.id ? updated : g));
  };

  const deleteGroup = async (id: string) => {
    await getDataProvider().removeAddressGroup(id);
    setGroups(groups.filter((g) => g.id !== id));
    if (activeGroupId === id) setActiveGroupId(null);
  };

  const sendBulkMsg = () => {
    if (!msgText.trim()) return;
    setMsgSent(true);
    setMsgText("");
    setTimeout(() => setMsgSent(false), 3000);
  };

  const exportCSV = () => {
    const rows = groupMembers.map((s) =>
      `"${s.organization ?? s.name}","${s.email}","${ROLE_LABEL[s.profileType]}","${s.contactPhone ?? ""}"`
    );
    const blob = new Blob([`Kurum/Ad,E-posta,Rol,Telefon\n${rows.join("\n")}`], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `grup-${activeGroup?.name ?? "liste"}.csv`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Sol: Gruplar */}
      <div className="md:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-ink text-sm">Gruplarım</h3>
          <button onClick={() => setShowNewGroup(true)} className="text-xs text-eu font-semibold hover:underline">+ Grup</button>
        </div>

        {showNewGroup && (
          <div className="mb-3 flex gap-2">
            <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Grup adı" autoFocus
              className="flex-1 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            <button onClick={createGroup} className="px-3 py-2 bg-eu text-white rounded-lg text-sm font-semibold">✓</button>
            <button onClick={() => setShowNewGroup(false)} className="px-3 py-2 text-mist text-sm">✕</button>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={() => setActiveGroupId(null)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${!activeGroupId ? "bg-eu text-white" : "bg-white border border-line text-slate hover:bg-surface"}`}>
            Tüm Rehber ({directory.length})
          </button>
          {groups.map((g) => (
            <div key={g.id} className={`rounded-xl border overflow-hidden ${activeGroupId === g.id ? "border-eu" : "border-line"}`}>
              <button
                onClick={() => setActiveGroupId(g.id)}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-colors ${activeGroupId === g.id ? "bg-eu-pale text-eu" : "bg-white text-slate hover:bg-surface"}`}>
                {g.name} ({g.memberIds.length})
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sağ: İçerik */}
      <div className="md:col-span-2">
        {!activeGroupId ? (
          /* Tüm rehber */
          <div>
            <div className="flex gap-2 mb-4">
              <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Ad, kurum, e-posta ara…"
                className="flex-1 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as SubscriberProfileType | "")}
                className="px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                <option value="">Tüm Roller</option>
                {(["firma", "stk", "tedarikci", "delegasyon", "program_otoritesi"] as SubscriberProfileType[]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filtered.map((s) => (
                <div key={s.id} className="bg-white border border-line rounded-xl p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{s.organization ?? s.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${ROLE_COLOR[s.profileType]}`}>{ROLE_LABEL[s.profileType]}</span>
                    </div>
                    <p className="text-xs text-mist">{s.email}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/firma/${s.id}`} className="text-xs text-mist hover:text-eu">Profil</Link>
                    {groups.length > 0 && (
                      <select
                        onChange={(e) => { if (e.target.value) { setActiveGroupId(e.target.value); addToGroup(s.id); } e.target.value = ""; }}
                        className="text-xs border border-line rounded px-1 py-0.5 bg-white text-slate focus:outline-none">
                        <option value="">+ Gruba Ekle</option>
                        {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    )}
                    {s.contactPhone && (
                      <a href={`https://wa.me/${s.contactPhone.replace(/\D/g, "")}?text=Merhaba`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-green-700 font-semibold hover:underline">WA</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grup detayı */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink">{activeGroup?.name}</h3>
              <div className="flex gap-2">
                <button onClick={exportCSV} className="text-xs font-semibold border border-line text-slate px-3 py-1.5 rounded-lg hover:bg-surface">CSV İndir</button>
                <button onClick={() => { if (confirm("Bu grubu silmek istiyor musunuz?")) deleteGroup(activeGroupId); }}
                  className="text-xs text-mist hover:text-tr">Grubu Sil</button>
              </div>
            </div>

            {groupMembers.length === 0 ? (
              <p className="text-sm text-mist py-4">Bu grupta henüz kimse yok. Sol panelden tüm rehbere gidip kişileri ekleyin.</p>
            ) : (
              <div className="space-y-2 mb-5">
                {groupMembers.map((s) => (
                  <div key={s.id} className="bg-white border border-line rounded-xl p-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-sm font-medium text-ink">{s.organization ?? s.name}</span>
                      <p className="text-xs text-mist">{s.email}</p>
                    </div>
                    <div className="flex gap-2">
                      {s.contactPhone && (
                        <a href={`https://wa.me/${s.contactPhone.replace(/\D/g, "")}?text=Merhaba`} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-green-700 font-semibold hover:underline">WA</a>
                      )}
                      <button onClick={() => removeFromGroup(s.id)} className="text-xs text-mist hover:text-tr">Çıkar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Toplu mesaj */}
            {groupMembers.length > 0 && (
              <div className="bg-surface rounded-xl p-4">
                <h4 className="text-sm font-bold text-ink mb-2">Gruba Toplu Mesaj</h4>
                <textarea value={msgText} onChange={(e) => setMsgText(e.target.value)} rows={3}
                  placeholder={`${groupMembers.length} kişiye gönderilecek mesaj…`}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm resize-none focus:outline-none focus:border-eu mb-2" />
                <button onClick={sendBulkMsg} disabled={!msgText.trim()}
                  className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold disabled:opacity-40">
                  Gönder ({groupMembers.length} kişi)
                </button>
                {msgSent && <p className="text-green-700 text-xs font-semibold mt-2">✓ Mesaj iletildi.</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Profil & Hesap ─────────────────────────────────────────────
function ProfileTab({ current, locale, myExpertProfile, setMyExpertProfile, forceEdit, onEditOpened }: {
  current: Subscriber; locale: string;
  myExpertProfile: ExpertProfile | null;
  setMyExpertProfile: (p: ExpertProfile | null) => void;
  forceEdit?: boolean;
  onEditOpened?: () => void;
}) {
  const isEn = locale === "en";
  const isSupplier = IS_SUPPLIER.includes(current.profileType);
  const canOwnProjects = CAN_OWN_PROJECTS.includes(current.profileType);

  const pricing = PLAN_PRICING[current.plan];
  const subscriptionYear = getSubscriptionYear(current.createdAt);
  const currentYearPrice = getCurrentYearPrice(current.plan, current.createdAt);
  const PLAN_LABELS: Record<string, string> = {
    uzman: "Uzman (Ücretsiz)", yonetici: "Yönetici Paketi", tedarikci: "Tedarikçi Paketi",
  };

  const startDate = new Date(current.createdAt);
  const renewal = new Date(startDate);
  renewal.setFullYear(renewal.getFullYear() + subscriptionYear);
  const fmt = (d: Date) => d.toLocaleDateString(isEn ? "en-GB" : "tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Profil düzenleme */}
      {(canOwnProjects || isSupplier || current.profileType === "admin2") && (
        <ProfileEditSection current={current} locale={locale} forceOpen={forceEdit} onOpened={onEditOpened} />
      )}

      {/* Uzman profil — tedarikçi */}
      {isSupplier && (
        <ExpertProfileSection current={current} profile={myExpertProfile} onSave={setMyExpertProfile} locale={locale} />
      )}

      {/* Abonelik — admin2 için yok */}
      {current.profileType !== "admin2" && (
      <div className="bg-white border border-line rounded-2xl p-5">
        <h3 className="font-bold text-ink mb-4">{isEn ? "Subscription" : "Abonelik"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-surface rounded-xl p-3">
            <p className="text-xs text-mist mb-1">{isEn ? "Plan" : "Paket"}</p>
            <p className="font-semibold text-ink text-sm">{PLAN_LABELS[current.plan]}</p>
          </div>
          <div className="bg-surface rounded-xl p-3">
            <p className="text-xs text-mist mb-1">{isEn ? "Member since" : "Üyelik başlangıcı"}</p>
            <p className="font-semibold text-ink text-sm">{fmt(startDate)}</p>
          </div>
          <div className="bg-surface rounded-xl p-3">
            <p className="text-xs text-mist mb-1">{isEn ? "Next renewal" : "Yenileme tarihi"}</p>
            <p className="font-semibold text-ink text-sm">{fmt(renewal)}</p>
          </div>
          <div className="bg-surface rounded-xl p-3">
            <p className="text-xs text-mist mb-1">{isEn ? `Year ${subscriptionYear} fee` : `${subscriptionYear}. yıl`}</p>
            <p className="font-semibold text-eu text-sm">{formatEuro(currentYearPrice)}/yıl</p>
          </div>
        </div>

        {/* Demo faturalar */}
        <h4 className="text-xs font-bold text-mist uppercase tracking-wide mb-2">{isEn ? "Invoices" : "Faturalar"}</h4>
        <div className="border border-line rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-line">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate">{isEn ? "Date" : "Tarih"}</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate">{isEn ? "Description" : "Açıklama"}</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate">{isEn ? "Amount" : "Tutar"}</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate">{isEn ? "Status" : "Durum"}</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: subscriptionYear }, (_, i) => {
                const d = new Date(startDate); d.setFullYear(d.getFullYear() + i);
                const amt = i === 0 ? pricing.firstYearPrice : pricing.renewalPrice;
                return (
                  <tr key={i} className="border-t border-line">
                    <td className="px-4 py-2.5 text-slate">{fmt(d)}</td>
                    <td className="px-4 py-2.5 text-ink font-medium">{isEn ? `Year ${i + 1}` : `${i + 1}. Yıl`} · {PLAN_LABELS[current.plan]}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-ink">{formatEuro(amt)}</td>
                    <td className="px-4 py-2.5 text-center"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Ödendi ✓</span></td>
                  </tr>
                );
              }).reverse()}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-mist mt-2">Demo modu — gerçek Stripe entegrasyonu Firebase aşamasında aktif olacak.</p>
      </div>
      )}
    </div>
  );
}

// ─── YARDIMCI BİLEŞENLER ──────────────────────────────────────

function ProfileEditSection({ current, locale, forceOpen, onOpened }: {
  current: Subscriber; locale: string;
  forceOpen?: boolean;
  onOpened?: () => void;
}) {
  const isEn = locale === "en";
  const [open, setOpen] = useState(false);
  const { updateCurrent } = useFirma();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const makeForm = (s: Subscriber) => ({
    organization: s.organization ?? "",
    shortBio: s.shortBio ?? "",
    mission: s.mission ?? "",
    foundedYear: s.foundedYear?.toString() ?? "",
    employeeCount: s.employeeCount ?? "",
    servicesText: (s.services ?? []).join(", "),
    contactAddress: s.contactAddress ?? "",
    contactPhone: s.contactPhone ?? "",
    contactEmail: s.contactEmail ?? "",
    website: s.socialLinks?.website ?? s.institutionWebsite ?? "",
    linkedin: s.socialLinks?.linkedin ?? "",
    twitter: s.socialLinks?.twitter ?? "",
    instagram: s.socialLinks?.instagram ?? "",
    facebook: s.socialLinks?.facebook ?? "",
  });

  const [form, setForm] = useState(() => makeForm(current));

  // Düzenle butonundan tetiklenince accordion'u aç
  useEffect(() => {
    if (forceOpen && !open) {
      setOpen(true);
      onOpened?.();
    }
  }, [forceOpen, open, onOpened]);

  const save = async () => {
    setSaving(true);
    const updated: Subscriber = {
      ...current,
      organization: form.organization || undefined,
      shortBio: form.shortBio || undefined,
      mission: form.mission || undefined,
      foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
      employeeCount: form.employeeCount || undefined,
      services: form.servicesText ? form.servicesText.split(",").map((s) => s.trim()).filter(Boolean) : [],
      contactAddress: form.contactAddress || undefined,
      contactPhone: form.contactPhone || undefined,
      contactEmail: form.contactEmail || undefined,
      socialLinks: {
        website: form.website || undefined,
        linkedin: form.linkedin || undefined,
        twitter: form.twitter || undefined,
        instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
      },
    };
    await getDataProvider().saveSubscriber(updated);
    updateCurrent(updated);  // ← Paneli anında güncelle
    setForm(makeForm(updated));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isStk = current.profileType === "stk";
  const isSupplier = current.profileType === "tedarikci";

  // Tedarikçi hizmet kategorileri
  const SUPPLIER_SERVICE_CATS = [
    "İnşaat & Altyapı", "Bilişim & Yazılım", "Eğitim & Danışmanlık", "Tercüme & Çeviri",
    "Medya & İletişim", "Lojistik & Nakliye", "Araştırma & Analiz", "Hukuki Hizmetler",
    "Mali Hizmetler", "Yiyecek & İkram", "Ekipman & Malzeme", "Çevre & Enerji",
  ];

  const selectedServices = form.servicesText ? form.servicesText.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const toggleService = (cat: string) => {
    const current_set = new Set(selectedServices);
    if (current_set.has(cat)) { current_set.delete(cat); }
    else { current_set.add(cat); }
    setForm((f) => ({ ...f, servicesText: Array.from(current_set).join(", ") }));
  };

  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors text-left">
        <div className="flex items-center gap-2">
          <Icon id="edit" className="w-4 h-4 text-mist" />
          <span className="font-semibold text-ink text-sm">{isEn ? "Edit Profile" : "Profil Bilgilerimi Düzenle"}</span>
        </div>
        <Icon id="chevron" className={`w-4 h-4 text-mist transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-line px-5 pb-6 pt-4 space-y-5">
          {/* Temel */}
          <div>
            <p className="text-xs font-bold text-mist uppercase tracking-wide mb-3">Temel Bilgiler</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-mist mb-1">{isStk ? "Vakıf / Dernek Adı" : "Şirket / Kuruluş Adı"}</label>
                <input value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-mist mb-1">Hakkında / Kısa Açıklama</label>
                <textarea value={form.shortBio} onChange={(e) => setForm((f) => ({ ...f, shortBio: e.target.value }))}
                  rows={3} className="w-full px-3 py-2 border border-line rounded-lg text-sm resize-none focus:outline-none focus:border-eu" />
              </div>
              {isStk && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-mist mb-1">Misyon / Vizyon</label>
                  <textarea value={form.mission} onChange={(e) => setForm((f) => ({ ...f, mission: e.target.value }))}
                    rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm resize-none focus:outline-none focus:border-eu" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Kuruluş Yılı</label>
                <input type="number" min={1900} max={2030} value={form.foundedYear}
                  onChange={(e) => setForm((f) => ({ ...f, foundedYear: e.target.value }))} placeholder="2010"
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Çalışan Sayısı</label>
                <select value={form.employeeCount} onChange={(e) => setForm((f) => ({ ...f, employeeCount: e.target.value }))}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                  <option value="">— Seçin —</option>
                  {["1-10", "11-50", "51-200", "201-500", "500+"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-mist mb-2">
                  {isStk ? "Faaliyet Alanları" : isSupplier ? "Sunduğunuz Hizmet Kategorileri" : "Hizmetler & Uzmanlık"}
                </label>
                {isSupplier ? (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {SUPPLIER_SERVICE_CATS.map((cat) => (
                        <button key={cat} type="button"
                          onClick={() => toggleService(cat)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedServices.includes(cat) ? "bg-eu text-white border-eu" : "bg-white text-slate border-line hover:border-eu"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    <input value={form.servicesText} onChange={(e) => setForm((f) => ({ ...f, servicesText: e.target.value }))}
                      placeholder="Yukarıdaki listede olmayanlar için virgülle ekleyin"
                      className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu mt-1" />
                  </div>
                ) : (
                  <input value={form.servicesText} onChange={(e) => setForm((f) => ({ ...f, servicesText: e.target.value }))}
                    placeholder={isStk ? "Tarım, Gençlik, Kırsal Kalkınma" : "Proje Yönetimi, Eğitim, Kapasite Geliştirme"}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                )}
              </div>
            </div>
          </div>
          {/* İletişim */}
          <div>
            <p className="text-xs font-bold text-mist uppercase tracking-wide mb-3">İletişim</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-mist mb-1">Adres</label>
                <input value={form.contactAddress} onChange={(e) => setForm((f) => ({ ...f, contactAddress: e.target.value }))}
                  placeholder="İlçe, Şehir" className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Telefon</label>
                <input value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="+90 312 000 0000" className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">İletişim E-postası</label>
                <input type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  placeholder="info@firma.com" className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
            </div>
          </div>
          {/* Sosyal */}
          <div>
            <p className="text-xs font-bold text-mist uppercase tracking-wide mb-3">Web & Sosyal Medya</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: "website", label: "Website", placeholder: "https://firma.com" },
                { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/..." },
                { key: "twitter", label: "X / Twitter", placeholder: "https://twitter.com/..." },
                { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
                { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-mist mb-1">{label}</label>
                  <input value={(form as Record<string, string>)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                </div>
              ))}
            </div>
          </div>
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 bg-eu text-white rounded-lg text-sm font-semibold disabled:opacity-50">
            {saving ? "…" : saved ? "Kaydedildi ✓" : "Değişiklikleri Kaydet"}
          </button>
        </div>
      )}
    </div>
  );
}

function ExpertProfileSection({ current, profile, onSave, locale }: {
  current: Subscriber; profile: ExpertProfile | null; onSave: (p: ExpertProfile | null) => void; locale: string;
}) {
  const isEn = locale === "en";
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name ?? current.name,
    title: profile?.title ?? "",
    bio: profile?.bio ?? "",
    expertiseText: (profile?.expertise ?? []).join(", "),
    visible: profile?.visible ?? true,
  });

  const save = async () => {
    setSaving(true);
    const p: ExpertProfile = {
      id: profile?.id ?? `exp-${Date.now()}`, subscriberId: current.id,
      name: form.name, title: form.title, bio: form.bio || undefined,
      expertise: form.expertiseText.split(",").map((e) => e.trim()).filter(Boolean),
      projectHistory: profile?.projectHistory ?? [], visible: form.visible,
      updatedAt: new Date().toISOString(),
    };
    await getDataProvider().saveExpertProfile(p);
    onSave(p); setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors text-left">
        <div className="flex items-center gap-2">
          <Icon id="profile" className="w-4 h-4 text-mist" />
          <span className="font-semibold text-ink text-sm">{isEn ? "Expert Profile" : "Uzman Profilim"}</span>
        </div>
        <Icon id="chevron" className={`w-4 h-4 text-mist transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-line px-5 pb-6 pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Ad Soyad *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Unvan *</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Kıdemli Proje Yöneticisi"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-mist mb-1">Biyografi</label>
            <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3} placeholder="Deneyimlerinizi kısaca açıklayın…"
              className="w-full px-3 py-2 border border-line rounded-lg text-sm resize-none focus:outline-none focus:border-eu" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-mist mb-1">Uzmanlık Alanları (virgülle)</label>
            <input value={form.expertiseText} onChange={(e) => setForm((f) => ({ ...f, expertiseText: e.target.value }))}
              placeholder="Proje Yönetimi, İzleme & Değerlendirme, Tarım"
              className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate cursor-pointer">
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))} />
            Uzman havuzunda herkese görünür olsun
          </label>
          <button onClick={save} disabled={saving || !form.name || !form.title}
            className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold disabled:opacity-50">
            {saving ? "…" : saved ? "Kaydedildi ✓" : "Kaydet"}
          </button>
          {profile && (
            <Link href={`/uzmanlar/${profile.id}`} className="text-xs text-eu hover:underline ml-3">Profil sayfamı gör →</Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Proje Formu ──────────────────────────────────────────────
function ProjectForm({ form, setForm, locText, setLocText, sectors, donors, locale, isNew, onSave, onCancel }: {
  form: Project; setForm: (f: Project) => void;
  locText: string; setLocText: (s: string) => void;
  sectors: Sector[]; donors: Donor[]; locale: string; isNew: boolean;
  onSave: () => void; onCancel: () => void;
}) {
  const isEn = locale === "en";
  const set = (patch: Partial<Project>) => setForm({ ...form, ...patch });

  return (
    <div className="bg-eu-pale border border-eu/20 rounded-2xl p-5 mb-5">
      <h3 className="font-bold text-ink mb-4">{isNew ? (isEn ? "New Project" : "Yeni Proje") : (isEn ? "Edit Project" : "Projeyi Düzenle")}</h3>
      <div className="space-y-5">
        {/* Temel */}
        <div>
          <p className="text-xs font-bold text-mist uppercase tracking-wide mb-3">Temel Bilgiler</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Proje Adı *</label>
              <input value={form.title} onChange={(e) => set({ title: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Kısa Özet *</label>
              <textarea value={form.summary} onChange={(e) => set({ summary: e.target.value })}
                rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-none focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Sektör</label>
              <select value={form.sectorId} onChange={(e) => set({ sectorId: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Donör</label>
              <select value={form.donorId} onChange={(e) => set({ donorId: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                {donors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">IPA Dönemi</label>
              <select value={form.ipaPeriod} onChange={(e) => set({ ipaPeriod: e.target.value as IpaPeriod })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                {(["IPA-I", "IPA-II", "IPA-III"] as IpaPeriod[]).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Durum</label>
              <select value={form.status} onChange={(e) => set({ status: e.target.value as Project["status"] })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                <option value="devam">Devam Ediyor</option>
                <option value="tamamlandi">Tamamlandı</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Yararlanıcı</label>
              <input value={form.beneficiary} onChange={(e) => set({ beneficiary: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Uygulama İlleri (virgülle)</label>
              <input value={locText} onChange={(e) => setLocText(e.target.value)} placeholder="Ankara, Konya, İzmir"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Öncelik Alanı</label>
              <input value={form.priorityArea ?? ""} onChange={(e) => set({ priorityArea: e.target.value })}
                placeholder="Ör. Entegre Sınır Yönetimi, Su Altyapısı…"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">AB Katkısı (€)</label>
              <input type="number" value={form.euBudget ?? ""} onChange={(e) => set({ euBudget: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ör. 12500000"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Toplam Proje Bütçesi (€)</label>
              <input type="number" value={form.totalBudget ?? ""} onChange={(e) => set({ totalBudget: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ör. 14000000"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Bütçe Gösterimi</label>
              <input value={form.budget ?? ""} onChange={(e) => set({ budget: e.target.value })} placeholder="€12.5M (otomatik veya özel)"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Başlangıç</label>
                <input type="date" value={form.startDate ?? ""} onChange={(e) => set({ startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Bitiş</label>
                <input type="date" value={form.endDate ?? ""} onChange={(e) => set({ endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
              </div>
            </div>
          </div>
        </div>

        {/* İçerik */}
        <div>
          <p className="text-xs font-bold text-mist uppercase tracking-wide mb-3">Proje İçeriği</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Amaçlar</label>
              <textarea value={form.objective ?? ""} onChange={(e) => set({ objective: e.target.value })}
                rows={3} placeholder="Projenin temel amaçlarını açıklayın…"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-none focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Beklenen Çıktılar</label>
              <textarea value={form.expectedOutputs ?? ""} onChange={(e) => set({ expectedOutputs: e.target.value })}
                rows={3} placeholder="Projenin sonunda elde edilmesi beklenen çıktılar…"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-none focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Faaliyetler</label>
              <textarea value={form.activities ?? ""} onChange={(e) => set({ activities: e.target.value })}
                rows={3} placeholder="Proje kapsamında yürütülecek ana faaliyetler…"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-none focus:outline-none focus:border-eu" />
            </div>
          </div>
        </div>

        {/* İletişim & Sosyal Medya */}
        <div>
          <p className="text-xs font-bold text-mist uppercase tracking-wide mb-3">İletişim & Sosyal Medya</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">İletişim E-posta</label>
              <input type="email" value={form.contactEmail ?? ""} onChange={(e) => set({ contactEmail: e.target.value })}
                placeholder="iletisim@proje.org"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Telefon</label>
              <input value={form.contactPhone ?? ""} onChange={(e) => set({ contactPhone: e.target.value })}
                placeholder="+90 312 000 00 00"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Proje Web Sitesi (harici)</label>
              <input value={form.projectWebsiteUrl ?? ""} onChange={(e) => set({ projectWebsiteUrl: e.target.value })}
                placeholder="https://www.projeadi.org"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
            </div>
            {[
              { key: "socialTwitter" as const, label: "X / Twitter", placeholder: "@projeadi" },
              { key: "socialLinkedin" as const, label: "LinkedIn", placeholder: "linkedin.com/company/..." },
              { key: "socialFacebook" as const, label: "Facebook", placeholder: "facebook.com/..." },
              { key: "socialInstagram" as const, label: "Instagram", placeholder: "@projeadi" },
              { key: "socialYoutube" as const, label: "YouTube", placeholder: "youtube.com/@kanal" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-mist mb-1">{label}</label>
                <input value={form[key] ?? ""} onChange={(e) => set({ [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-line">
        <button onClick={onSave} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
          {isNew ? (isEn ? "Create Project" : "Proje Oluştur") : (isEn ? "Save Changes" : "Değişiklikleri Kaydet")}
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
      </div>
    </div>
  );
}

// ─── İlan Formu ───────────────────────────────────────────────
function ListingForm({ form, setForm, ownedProjects, canTender, expiryDays, setExpiryDays, locale, onSave, onCancel }: {
  form: Listing; setForm: (f: Listing) => void;
  ownedProjects: Project[]; canTender: boolean;
  expiryDays: string; setExpiryDays: (v: string) => void;
  locale: string; onSave: () => void; onCancel: () => void;
}) {
  const isEn = locale === "en";
  const set = (patch: Partial<Listing>) => setForm({ ...form, ...patch });

  return (
    <div className="bg-eu-pale border border-eu/20 rounded-2xl p-5 mb-5">
      <h3 className="font-bold text-ink mb-4">İlan Bilgileri</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">İlan Başlığı *</label>
          <input value={form.title} onChange={(e) => set({ title: e.target.value })}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">Konu Özeti</label>
          <input value={form.subject ?? ""} onChange={(e) => set({ subject: e.target.value })}
            placeholder="İhaleye / işe konu iş — kısa özet"
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">İlan Türü</label>
          <select value={form.type} onChange={(e) => set({ type: e.target.value as ListingType })}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
            {!canTender && <option value="is">İş İlanı</option>}
            {!canTender && <option value="satinalma">Satınalma</option>}
            {canTender && <option value="ihale">İhale</option>}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Lokasyon</label>
          <input value={form.location ?? ""} onChange={(e) => set({ location: e.target.value })}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
        </div>
        {ownedProjects.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-mist mb-1">İlgili Proje</label>
            <select value={form.projectId ?? ""} onChange={(e) => set({ projectId: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
              <option value="">— Proje seçin (opsiyonel) —</option>
              {ownedProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Yayında Kalma Süresi</label>
          <select value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
            <option value="30">30 gün</option>
            <option value="60">60 gün</option>
            <option value="90">90 gün</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Son Başvuru / Teklif Tarihi</label>
          <input type="date" value={form.deadline ?? ""} onChange={(e) => set({ deadline: e.target.value })}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Bütçe / Değer</label>
          <input value={form.budget ?? ""} onChange={(e) => set({ budget: e.target.value })} placeholder="€ 500.000"
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Referans No</label>
          <input value={form.referenceNo ?? ""} onChange={(e) => set({ referenceNo: e.target.value })} placeholder="EuropeAid/123456/..."
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">İletişim E-postası</label>
          <input type="email" value={form.contactEmail ?? ""} onChange={(e) => set({ contactEmail: e.target.value })}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">Açıklama *</label>
          <textarea value={form.description} onChange={(e) => set({ description: e.target.value })}
            rows={4} className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-none focus:outline-none focus:border-eu" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Kaydet</button>
        <button onClick={onCancel} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
      </div>
    </div>
  );
}
