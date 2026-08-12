"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { useLocale } from "@/lib/i18n/context";
import { getDataProvider } from "@/lib/data";
import { PLAN_PRICING, getSubscriptionYear, getCurrentYearPrice, formatEuro } from "@/lib/pricing";
import type { PlanPricing } from "@/lib/pricing";
import { canPostTender } from "@/lib/types";
import type {
  Project, OwnershipRequest, Listing, ListingType,
  Sector, Donor, IpaPeriod, SubscriberProfileType, ExpertProfile,
  Subscriber, AddressGroup,
} from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/translations";

// ─── Rol sabitleri ────────────────────────────────────────────
const CAN_OWN_PROJECTS: SubscriberProfileType[] = ["firma", "stk"];
const IS_SUPPLIER: SubscriberProfileType[] = ["tedarikci"];
const IS_AUTHORITY: SubscriberProfileType[] = ["delegasyon", "program_otoritesi"];

const ROLE_LABEL: Record<SubscriberProfileType, string> = {
  firma: "Firma", stk: "STK", tedarikci: "Tedarikçi",
  delegasyon: "AB Delegasyonu", program_otoritesi: "Program Otoritesi",
};
const ROLE_COLOR: Record<SubscriberProfileType, string> = {
  firma: "bg-blue-100 text-blue-700", stk: "bg-green-100 text-green-700",
  tedarikci: "bg-orange-100 text-orange-700", delegasyon: "bg-purple-100 text-purple-700",
  program_otoritesi: "bg-red-100 text-red-700",
};

// ─── SVG ikonlar ──────────────────────────────────────────────
function Icon({ id, className = "w-5 h-5" }: { id: string; className?: string }) {
  const paths: Record<string, string> = {
    project:  "M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z",
    listing:  "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
    event:    "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
    tools:    "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z",
    address:  "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
    profile:  "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
    edit:     "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10",
    trash:    "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
    plus:     "M12 4.5v15m7.5-7.5h-15",
    check:    "m4.5 12.75 6 6 9-13.5",
    chevron:  "M19 9l-7 7-7-7",
    mail:     "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75",
    doc:      "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
    graduate: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5",
    megaphone:"M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46",
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[id] ?? paths.project} />
    </svg>
  );
}

// ─── Tab tanımları ─────────────────────────────────────────────
type TabId = "projeler" | "ilanlar" | "etkinlikler" | "araclar" | "adres" | "profil";

interface TabDef { id: TabId; label: string; icon: string; roles: SubscriberProfileType[] }

const TABS: TabDef[] = [
  { id: "projeler",    label: "Projelerim",      icon: "project",  roles: ["firma", "stk"] },
  { id: "ilanlar",     label: "İlanlarım",        icon: "listing",  roles: ["firma", "stk", "tedarikci", "delegasyon", "program_otoritesi"] },
  { id: "etkinlikler", label: "Etkinliklerim",    icon: "event",    roles: ["firma", "stk", "delegasyon", "program_otoritesi"] },
  { id: "araclar",     label: "Dijital Araçlar",  icon: "tools",    roles: ["firma", "stk", "delegasyon", "program_otoritesi"] },
  { id: "adres",       label: "Adres Defteri",    icon: "address",  roles: ["firma", "stk", "tedarikci", "delegasyon", "program_otoritesi"] },
  { id: "profil",      label: "Profil & Hesap",   icon: "profile",  roles: ["firma", "stk", "tedarikci", "delegasyon", "program_otoritesi"] },
];

// Dijital araçlar — role göre
const TOOL_CARDS: { href: string; icon: string; label: string; roles: SubscriberProfileType[] }[] = [
  { href: "/araclar/etkinlik", icon: "event",     label: "Etkinlik Yönetimi",    roles: ["firma", "stk", "delegasyon", "program_otoritesi"] },
  { href: "/araclar/dokuman",  icon: "doc",       label: "E-Doküman Yönetimi",   roles: ["firma", "stk", "delegasyon", "program_otoritesi"] },
  { href: "/araclar/bulten",   icon: "mail",      label: "Bülten Gönderimi",     roles: ["firma", "stk", "delegasyon", "program_otoritesi"] },
  { href: "/araclar/paydas",   icon: "megaphone", label: "Paydaş İletişimi",     roles: ["firma", "stk", "delegasyon", "program_otoritesi"] },
  { href: "/araclar/egitim",   icon: "graduate",  label: "Eğitim Materyalleri",  roles: ["firma", "stk", "delegasyon", "program_otoritesi"] },
  { href: "/uzmanlar",         icon: "address",   label: "Uzman CV Havuzu",      roles: ["firma", "stk", "delegasyon", "program_otoritesi"] },
  // Tedarikçi: sadece eğitim materyali görüntüler
  { href: "/araclar/egitim",   icon: "graduate",  label: "Eğitim Materyalleri",  roles: ["tedarikci"] },
];

// ─── Ana component ─────────────────────────────────────────────
export default function FirmaPanelPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const { current, loading, logout } = useFirma();
  const [activeTab, setActiveTab] = useState<TabId>("projeler");
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

  useEffect(() => {
    if (loading) return;
    if (!current) { router.push("/giris"); return; }
    const db = getDataProvider();
    Promise.all([
      db.getProjects(), db.getListings(), db.getSectors(), db.getDonors(),
      db.getExpertProfiles(), db.getSubscribers(), db.getAddressGroups(current.id),
    ]).then(([allProjects, allListings, allSectors, allDonors, allExperts, subs, groups]) => {
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

        {/* Profil özet başlığı */}
        <div className="bg-white border border-line rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-eu flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {(current.organization ?? current.name).charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-ink truncate">{current.organization ?? current.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${ROLE_COLOR[role]}`}>
                {ROLE_LABEL[role]}
              </span>
            </div>
            <p className="text-sm text-slate">{current.name} · {current.email}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/firma/${current.id}`} className="text-xs text-eu font-semibold hover:underline hidden sm:block">
              Profil Sayfam →
            </Link>
            <button onClick={() => { logout(); router.push("/"); }}
              className="text-xs text-mist hover:text-tr font-medium">
              Çıkış
            </button>
          </div>
        </div>

        {/* Tab navigasyonu */}
        <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1 overflow-x-auto">
          {myTabs.map((tab) => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-white text-ink shadow-sm"
                  : "text-slate hover:text-ink"
              }`}>
              <Icon id={tab.icon} className="w-4 h-4" />
              {tab.label}
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
          {activeTab === "etkinlikler" && (
            <EventsTab current={current} locale={locale} />
          )}
          {activeTab === "araclar" && (
            <ToolsTab role={role} />
          )}
          {activeTab === "adres" && (
            <AddressTab
              current={current} locale={locale}
              allSubscribers={allSubscribers}
              groups={addressGroups} setGroups={setAddressGroups}
            />
          )}
          {activeTab === "profil" && (
            <ProfileTab current={current} locale={locale} myExpertProfile={myExpertProfile} setMyExpertProfile={setMyExpertProfile} />
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─── SEKMELER ─────────────────────────────────────────────────

// ── Projelerim ────────────────────────────────────────────────
function ProjectsTab({ current, locale, ownedProjects, setOwnedProjects, memberProjects, sectors, donors }: {
  current: Subscriber; locale: string;
  ownedProjects: Project[]; setOwnedProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  memberProjects: Project[];
  sectors: Sector[]; donors: Donor[];
}) {
  const isEn = locale === "en";
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [locText, setLocText] = useState("");

  const emptyProject = (): Project => ({
    id: `prj-${Date.now()}`, title: "", summary: "", sectorId: sectors[0]?.id ?? "tarim",
    donorId: donors[0]?.id ?? "eu", ipaPeriod: "IPA-III", beneficiary: "", locations: [],
    status: "devam", featured: false,
    ownerSubscriberId: current.id, ownerSubscriberName: current.organization ?? current.name,
  });

  const openNew = () => { setEditProject(emptyProject()); setLocText(""); setShowForm(true); };
  const openEdit = (p: Project) => { setEditProject({ ...p }); setLocText(p.locations.join(", ")); setShowForm(true); };

  const save = async () => {
    if (!editProject?.title || !editProject.summary) return;
    const updated = { ...editProject, locations: locText.split(",").map((l) => l.trim()).filter(Boolean) };
    await getDataProvider().saveProject(updated);
    setOwnedProjects((prev) => {
      const i = prev.findIndex((p) => p.id === updated.id);
      return i !== -1 ? prev.map((p, j) => j === i ? updated : p) : [updated, ...prev];
    });
    setShowForm(false); setEditProject(null);
  };

  const del = async (id: string) => {
    if (!confirm(isEn ? "Delete this project?" : "Bu projeyi silmek istiyor musunuz?")) return;
    await getDataProvider().removeProject(id);
    setOwnedProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-ink">{isEn ? "My Projects" : "Projelerim"}</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
          <Icon id="plus" className="w-4 h-4" /> {isEn ? "New Project" : "Yeni Proje"}
        </button>
      </div>

      {showForm && editProject && (
        <ProjectForm
          form={editProject} setForm={setEditProject}
          locText={locText} setLocText={setLocText}
          sectors={sectors} donors={donors} locale={locale}
          isNew={!ownedProjects.find((p) => p.id === editProject.id)}
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
        <div className="space-y-3">
          {ownedProjects.map((p) => (
            <div key={p.id} className="bg-white border border-line rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === "devam" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.status === "devam" ? (isEn ? "Ongoing" : "Devam Ediyor") : (isEn ? "Completed" : "Tamamlandı")}
                    </span>
                    <span className="text-xs text-mist">{p.ipaPeriod}</span>
                  </div>
                  <h3 className="font-bold text-ink">{p.title}</h3>
                  <p className="text-sm text-slate mt-1 line-clamp-2">{p.summary}</p>
                  {p.locations.length > 0 && (
                    <p className="text-xs text-mist mt-1">📍 {p.locations.join(", ")}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href={`/projeler/${p.id}`} className="text-xs text-mist hover:text-eu">Gör</Link>
                  <button onClick={() => openEdit(p)} className="text-xs text-eu font-semibold hover:underline">Düzenle</button>
                  <button onClick={() => del(p.id)} className="text-xs text-mist hover:text-tr">Sil</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {memberProjects.length > 0 && (
        <div className="mt-8">
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
        <h2 className="text-lg font-bold text-ink">{isEn ? "My Listings" : "İlanlarım"}</h2>
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
      </div>

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
function ToolsTab({ role }: { role: SubscriberProfileType }) {
  const myTools = TOOL_CARDS.filter((t) => t.roles.includes(role));
  // Tedarikçi için özel mesaj
  const isSupplier = role === "tedarikci";

  return (
    <div>
      <h2 className="text-lg font-bold text-ink mb-2">Dijital Araçlar</h2>
      {isSupplier && (
        <p className="text-sm text-mist mb-5 bg-white border border-line rounded-xl px-4 py-3">
          Tedarikçi hesabı olarak eğitim materyallerini görüntüleyebilir, uzman profilinizi oluşturabilirsiniz.
          Etkinlik yönetimi, doküman yönetimi ve bülten gönderimi firma/STK hesaplarına özeldir.
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {myTools.map((tool) => (
          <Link key={`${tool.href}-${tool.label}`} href={tool.href}
            className="bg-white border border-line rounded-xl p-4 flex flex-col items-center gap-2 hover:border-eu hover:shadow-sm transition-all group text-center">
            <span className="w-10 h-10 rounded-full bg-eu-pale text-eu flex items-center justify-center group-hover:bg-eu group-hover:text-white transition-colors">
              <Icon id={tool.icon} className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold text-ink leading-tight">{tool.label}</span>
          </Link>
        ))}
      </div>
      {/* Tedarikçi için uzman profil kısayolu */}
      {isSupplier && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-ink mb-3">Uzman Profilim</h3>
          <Link href="/uzmanlar" className="bg-white border border-line rounded-xl p-4 flex items-center gap-3 hover:border-eu transition-colors">
            <span className="w-10 h-10 rounded-full bg-eu-pale text-eu flex items-center justify-center">
              <Icon id="profile" className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Uzman Dizinine Git</p>
              <p className="text-xs text-mist">Profilinizi oluşturun ve görünür olun</p>
            </div>
          </Link>
        </div>
      )}
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
function ProfileTab({ current, locale, myExpertProfile, setMyExpertProfile }: {
  current: Subscriber; locale: string;
  myExpertProfile: ExpertProfile | null;
  setMyExpertProfile: (p: ExpertProfile | null) => void;
}) {
  const isEn = locale === "en";
  const isSupplier = IS_SUPPLIER.includes(current.profileType);
  const canOwnProjects = CAN_OWN_PROJECTS.includes(current.profileType);

  const pricing = PLAN_PRICING[current.plan];
  const subscriptionYear = getSubscriptionYear(current.createdAt);
  const currentYearPrice = getCurrentYearPrice(current.plan, current.createdAt);
  const PLAN_LABELS: Record<string, string> = {
    ucretsiz: "Ücretsiz", paket1: "Paket 1", paket2: "Paket 2", tedarikci: "Tedarikçi",
  };

  const startDate = new Date(current.createdAt);
  const renewal = new Date(startDate);
  renewal.setFullYear(renewal.getFullYear() + subscriptionYear);
  const fmt = (d: Date) => d.toLocaleDateString(isEn ? "en-GB" : "tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Profil düzenleme */}
      {(canOwnProjects || isSupplier) && (
        <ProfileEditSection current={current} locale={locale} />
      )}

      {/* Uzman profil — tedarikçi */}
      {isSupplier && (
        <ExpertProfileSection current={current} profile={myExpertProfile} onSave={setMyExpertProfile} locale={locale} />
      )}

      {/* Abonelik */}
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
    </div>
  );
}

// ─── YARDIMCI BİLEŞENLER ──────────────────────────────────────

function ProfileEditSection({ current, locale }: { current: Subscriber; locale: string }) {
  const isEn = locale === "en";
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    organization: current.organization ?? "",
    shortBio: current.shortBio ?? "",
    mission: current.mission ?? "",
    foundedYear: current.foundedYear?.toString() ?? "",
    employeeCount: current.employeeCount ?? "",
    servicesText: (current.services ?? []).join(", "),
    contactAddress: current.contactAddress ?? "",
    contactPhone: current.contactPhone ?? "",
    contactEmail: current.contactEmail ?? "",
    website: current.socialLinks?.website ?? "",
    linkedin: current.socialLinks?.linkedin ?? "",
    twitter: current.socialLinks?.twitter ?? "",
    instagram: current.socialLinks?.instagram ?? "",
    facebook: current.socialLinks?.facebook ?? "",
  });

  const save = async () => {
    setSaving(true);
    const updated: Subscriber = {
      ...current,
      organization: form.organization || undefined,
      shortBio: form.shortBio || undefined,
      foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
      employeeCount: form.employeeCount || undefined,
      services: form.servicesText ? form.servicesText.split(",").map((s) => s.trim()).filter(Boolean) : [],
      contactAddress: form.contactAddress || undefined,
      contactPhone: form.contactPhone || undefined,
      contactEmail: form.contactEmail || undefined,
      socialLinks: {
        website: form.website || undefined, linkedin: form.linkedin || undefined,
        twitter: form.twitter || undefined, instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
      },
    };
    await getDataProvider().saveSubscriber(updated);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isStk = current.profileType === "stk";

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
                <label className="block text-xs font-semibold text-mist mb-1">
                  {isStk ? "Faaliyet Alanları (virgülle ayırın)" : "Hizmetler & Uzmanlık (virgülle ayırın)"}
                </label>
                <input value={form.servicesText} onChange={(e) => setForm((f) => ({ ...f, servicesText: e.target.value }))}
                  placeholder="Proje Yönetimi, Eğitim, Kapasite Geliştirme"
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
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
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Bütçe</label>
              <input value={form.budget ?? ""} onChange={(e) => set({ budget: e.target.value })} placeholder="€12.5M"
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
