"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { useLocale } from "@/lib/i18n/context";
import { getDataProvider } from "@/lib/data";
import { PLAN_PRICING, getSubscriptionYear, getCurrentYearPrice, formatEuro } from "@/lib/pricing";
import { canPostTender } from "@/lib/types";
import type {
  Project, OwnershipRequest, Listing, ListingType,
  Sector, Donor, IpaPeriod, SubscriberProfileType, ExpertProfile,
} from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/translations";

// ─── Rol yapılandırması ────────────────────────────────────────
const ROLE_PANEL_TITLE: Record<SubscriberProfileType, string> = {
  firma: "panel_title_firma",
  stk: "panel_title_stk",
  tedarikci: "panel_title_tedarikci",
  delegasyon: "panel_title_delegasyon",
  program_otoritesi: "panel_title_program_otoritesi",
};
const ROLE_BADGE: Record<SubscriberProfileType, string> = {
  firma: "panel_role_badge_firma",
  stk: "panel_role_badge_stk",
  tedarikci: "panel_role_badge_tedarikci",
  delegasyon: "panel_role_badge_delegasyon",
  program_otoritesi: "panel_role_badge_program_otoritesi",
};
const ROLE_BADGE_COLOR: Record<SubscriberProfileType, string> = {
  firma: "bg-blue-100 text-blue-700",
  stk: "bg-green-100 text-green-700",
  tedarikci: "bg-orange-100 text-orange-700",
  delegasyon: "bg-purple-100 text-purple-700",
  program_otoritesi: "bg-red-100 text-red-700",
};
/** Hangi roller proje ekleyip yürütebilir */
const CAN_OWN_PROJECTS: SubscriberProfileType[] = ["firma", "stk"];
/** Hangi roller dijital araçların tamamına erişebilir */
const HAS_FULL_TOOLS: SubscriberProfileType[] = ["firma", "stk"];
/** Hangi roller tedarikçi/uzman odaklı (indirgenmiş araç seti) */
const IS_SUPPLIER: SubscriberProfileType[] = ["tedarikci"];
/** Hangi roller delegasyon/program otoritesi (ihale odaklı) */
const IS_AUTHORITY: SubscriberProfileType[] = ["delegasyon", "program_otoritesi"];

// ─── SVG araç ikonları ───────────────────────────────────────
function ToolIcon({ id, className = "w-6 h-6" }: { id: string; className?: string }) {
  const icons: Record<string, React.ReactElement> = {
    etkinlik: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    dokuman: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
      </svg>
    ),
    bulten: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    paydas: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
      </svg>
    ),
    egitim: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  };
  return icons[id] ?? null;
}

const ALL_TOOLS = [
  { href: "/araclar/etkinlik",  iconId: "etkinlik", label: "Etkinlik Yönetimi" },
  { href: "/araclar/dokuman",   iconId: "dokuman",  label: "E-Doküman Yönetimi" },
  { href: "/araclar/bulten",    iconId: "bulten",   label: "Bülten Gönderimi" },
  { href: "/araclar/paydas",    iconId: "paydas",   label: "Paydaş İletişimi" },
  { href: "/araclar/egitim",    iconId: "egitim",   label: "Eğitim Materyalleri" },
] as const;
const SUPPLIER_TOOLS = ALL_TOOLS.filter(t => t.href === "/araclar/dokuman" || t.href === "/araclar/egitim");
const AUTHORITY_TOOLS = ALL_TOOLS.filter(t => t.href === "/araclar/bulten" || t.href === "/araclar/paydas");

const PERIODS: IpaPeriod[] = ["IPA-I", "IPA-II", "IPA-III"];

export default function FirmaPanelPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { current, loading, logout } = useFirma();

  // Ortak veriler
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<OwnershipRequest[]>([]);
  const [myRequests, setMyRequests] = useState<OwnershipRequest[]>([]);
  const [allProjectsMap, setAllProjectsMap] = useState<Record<string, Project>>({});
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [myExpertProfile, setMyExpertProfile] = useState<ExpertProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [showSubscription, setShowSubscription] = useState(false);

  // Proje formu
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState<Project | null>(null);
  const [locationsText, setLocationsText] = useState("");

  // İlan formu
  const [showListingForm, setShowListingForm] = useState(false);
  const [listingForm, setListingForm] = useState<Listing>({ id: "", type: "is", title: "", organization: "", location: "", deadline: "", locked: false, description: "" });
  const [confirmDelListing, setConfirmDelListing] = useState<string | null>(null);

  const PLAN_LABELS: Record<string, string> = {
    ucretsiz: locale === "tr" ? "Ücretsiz" : "Free",
    paket1: locale === "tr" ? "Paket 1" : "Package 1",
    paket2: locale === "tr" ? "Paket 2" : "Package 2",
    tedarikci: locale === "tr" ? "Tedarikçi" : "Supplier",
  };

  useEffect(() => {
    if (loading) return;
    if (!current) { router.push("/giris"); return; }
    const db = getDataProvider();
    Promise.all([
      db.getProjects(),
      db.getOwnershipRequestsFor({ approverSubscriberId: current.id }),
      db.getOwnershipRequestsFor({ subscriberId: current.id }),
      db.getListings(),
      db.getSectors(),
      db.getDonors(),
      db.getExpertProfiles(),
    ]).then(([allProjects, incoming, mine, allListings, allSectors, allDonors, allExperts]) => {
      const map: Record<string, Project> = {};
      allProjects.forEach((p) => { map[p.id] = p; });
      setAllProjectsMap(map);
      setOwnedProjects(allProjects.filter((p) => p.ownerSubscriberId === current.id));
      setMemberProjects(allProjects.filter((p) =>
        p.ownerSubscriberId !== current.id &&
        p.consortiumMembers?.some((m) => m.subscriberId === current.id)
      ));
      setIncomingRequests(incoming.filter((r) => r.status === "bekliyor"));
      setMyRequests(mine);
      setMyListings(allListings.filter((l) => l.publisherSubscriberId === current.id));
      setSectors(allSectors);
      setDonors(allDonors);
      setMyExpertProfile(allExperts.find((ep) => ep.subscriberId === current.id) ?? null);
      setDataLoading(false);
    });
  }, [current, loading, router]);

  // ── Yardımcı fonksiyonlar ─────────────────────────────────────
  const resolveRequest = async (id: string, status: "onaylandi" | "reddedildi") => {
    await getDataProvider().resolveOwnershipRequest(id, status);
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
    setActionMsg(status === "onaylandi" ? t("firma_action_success_approved") : t("firma_action_success_rejected"));
    if (current) {
      const allProjects = await getDataProvider().getProjects();
      setOwnedProjects(allProjects.filter((p) => p.ownerSubscriberId === current.id));
    }
  };

  const emptyProjectForm = (): Project => ({
    id: `prj-${Date.now()}`, title: "", summary: "", sectorId: sectors[0]?.id ?? "tarim",
    donorId: donors[0]?.id ?? "eu", ipaPeriod: "IPA-III", beneficiary: "", locations: [],
    status: "devam", featured: false,
    ownerSubscriberId: current?.id, ownerSubscriberName: current?.organization ?? current?.name,
  });

  const openNewProjectForm = () => { setProjectForm(emptyProjectForm()); setLocationsText(""); setShowProjectForm(true); };
  const openEditProjectForm = (p: Project) => { setProjectForm(p); setLocationsText(p.locations.join(", ")); setShowProjectForm(true); };
  const saveProjectForm = async () => {
    if (!projectForm || !projectForm.title || !projectForm.summary) return;
    const updated: Project = { ...projectForm, locations: locationsText.split(",").map((l) => l.trim()).filter(Boolean) };
    await getDataProvider().saveProject(updated);
    setOwnedProjects((prev) => { const i = prev.findIndex((p) => p.id === updated.id); return i !== -1 ? prev.map((p, j) => (j === i ? updated : p)) : [updated, ...prev]; });
    setAllProjectsMap((prev) => ({ ...prev, [updated.id]: updated }));
    setShowProjectForm(false); setProjectForm(null);
  };

  const emptyListingForm = (): Listing => ({
    id: `ilan-${Date.now()}`, type: canPostTender(current!.profileType) ? "ihale" : "is",
    title: "", organization: current?.organization ?? current?.name ?? "",
    location: "", deadline: "", locked: false, description: "", publisherSubscriberId: current?.id,
  });
  const openListingForm = (l?: Listing) => { setListingForm(l ?? emptyListingForm()); setShowListingForm(true); };
  const saveListing = async () => {
    if (!listingForm.title) return;
    await getDataProvider().saveListing(listingForm);
    setMyListings((prev) => { const i = prev.findIndex((x) => x.id === listingForm.id); return i !== -1 ? prev.map((x, j) => (j === i ? listingForm : x)) : [listingForm, ...prev]; });
    setShowListingForm(false);
  };
  const removeListing = async (id: string) => {
    await getDataProvider().removeListing(id);
    setMyListings((prev) => prev.filter((l) => l.id !== id));
    setConfirmDelListing(null);
  };

  // ── Guard ──────────────────────────────────────────────────────
  if (loading || (current && dataLoading)) {
    return <PageShell><div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }
  if (!current) return null;

  // ── Rol bazlı değişkenler ──────────────────────────────────────
  const role = current.profileType;
  const canOwnProjects = CAN_OWN_PROJECTS.includes(role);
  const isSupplier = IS_SUPPLIER.includes(role);
  const isAuthority = IS_AUTHORITY.includes(role);
  const hasFullTools = HAS_FULL_TOOLS.includes(role);
  const activeTools = hasFullTools ? ALL_TOOLS : isSupplier ? SUPPLIER_TOOLS : AUTHORITY_TOOLS;
  const canTender = canPostTender(role);

  const pricing = PLAN_PRICING[current.plan];
  const subscriptionYear = getSubscriptionYear(current.createdAt);
  const currentYearPrice = getCurrentYearPrice(current.plan, current.createdAt);

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t(ROLE_PANEL_TITLE[role] as Parameters<typeof t>[0]) }]} />

        {/* Başlık */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-ink">{current.organization ?? current.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_BADGE_COLOR[role]}`}>
                {t(ROLE_BADGE[role] as Parameters<typeof t>[0])}
              </span>
            </div>
            <p className="text-slate text-sm">{current.name} · {current.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/firma/${current.id}`} className="text-sm px-4 py-2 border border-line text-eu rounded-lg hover:bg-eu-pale">
              {locale === "tr" ? "Profili Gör" : "View Profile"}
            </Link>
            <button onClick={() => { logout(); router.push("/"); }} className="text-sm px-4 py-2 border border-line text-slate rounded-lg hover:bg-surface">
              {t("firma_logout")}
            </button>
          </div>
        </div>


        {actionMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-6">{actionMsg}</div>
        )}

        {/* Abonelik Ayarları — accordion */}
        <div className="mb-8 border border-line rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowSubscription((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-surface transition-colors text-left">
            <span className="font-semibold text-ink text-sm">{t("firma_membership_plan")}</span>
            <span className="text-mist text-xs flex items-center gap-2">
              <span className="text-eu font-semibold">{PLAN_LABELS[current.plan]}</span>
              <svg className={`w-4 h-4 transition-transform ${showSubscription ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          {showSubscription && (
            <div className="px-5 pb-5 pt-3 bg-white border-t border-line flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-mist font-semibold mb-1">{t("firma_membership_plan")}</p>
                <p className="text-lg font-bold text-ink">{PLAN_LABELS[current.plan]}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-mist font-semibold mb-1">
                  {subscriptionYear <= 1 ? t("firma_membership_first_year") : t("firma_membership_renewal")}
                </p>
                <p className="text-lg font-bold text-eu">{formatEuro(currentYearPrice)}<span className="text-xs text-mist font-normal">/{locale === "tr" ? "yıl" : "year"}</span></p>
                {pricing.hasRenewalDiscount && subscriptionYear <= 1 && (
                  <p className="text-xs text-mist mt-0.5">{t("signup_renewal_note")}: {formatEuro(pricing.renewalPrice)}/{locale === "tr" ? "yıl" : "year"}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            ROL: FİRMA / STK — tam yetkili panel
        ═══════════════════════════════════════════════════ */}
        {canOwnProjects && (
          <>
            {/* Dijital Araçlarım */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-ink mb-1">{t("firma_dashboard_tools_title")}</h2>
              <p className="text-slate text-sm mb-4">{t("firma_dashboard_tools_sub")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {ALL_TOOLS.map((tool) => (
                  <Link key={tool.href} href={tool.href}
                    className="flex flex-col items-center gap-2 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all text-center group">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-eu-pale text-eu group-hover:bg-eu group-hover:text-white transition-colors">
                      <ToolIcon id={tool.iconId} className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-semibold text-ink leading-tight">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Gelen Konsorsiyum Talepleri */}
            {incomingRequests.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-ink mb-4">{t("firma_pending_title")}</h2>
                <div className="space-y-3">
                  {incomingRequests.map((r) => {
                    const project = ownedProjects.find((p) => p.id === r.projectId);
                    return (
                      <div key={r.id} className="bg-white border border-eu/30 rounded-xl p-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="text-xs text-mist mb-1">
                              {project ? <Link href={`/projeler/${project.id}`} className="text-eu hover:underline font-semibold">{project.title}</Link> : r.projectId}
                            </p>
                            <h3 className="font-bold text-ink">{r.subscriberName}</h3>
                            {r.note && <p className="text-sm text-slate mt-2 bg-surface rounded-lg p-3">{r.note}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => resolveRequest(r.id, "onaylandi")} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">{t("firma_approve")}</button>
                            <button onClick={() => resolveRequest(r.id, "reddedildi")} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">{t("firma_reject")}</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Yürüttüğüm Projeler */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-ink">{t("firma_owned_title")}</h2>
                <button onClick={openNewProjectForm} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">{t("firma_project_add")}</button>
              </div>
              <ProjectForm show={showProjectForm} form={projectForm} setForm={setProjectForm}
                locationsText={locationsText} setLocationsText={setLocationsText}
                sectors={sectors} donors={donors} onSave={saveProjectForm}
                onCancel={() => { setShowProjectForm(false); setProjectForm(null); }} t={t} locale={locale} />
              {ownedProjects.length === 0 ? (
                <p className="text-slate text-sm">{t("firma_owned_empty")}</p>
              ) : (
                <div className="space-y-3">
                  {ownedProjects.map((p) => (
                    <div key={p.id} className="bg-white border border-line rounded-xl p-5">
                      <Link href={`/projeler/${p.id}`} className="block">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <h3 className="font-bold text-ink">{p.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === "devam" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {p.status === "devam" ? t("status_ongoing") : t("status_completed")}
                          </span>
                        </div>
                        <p className="text-xs text-mist">{p.ipaPeriod} · {p.budget ?? "—"}</p>
                      </Link>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-line">
                        <button onClick={() => openEditProjectForm(p)} className="text-xs font-semibold text-eu hover:underline">{t("firma_project_edit")}</button>
                        <Link href="/araclar/dokuman" className="text-xs font-semibold text-slate hover:text-eu">{t("firma_project_tools_cta")} →</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Konsorsiyum üyesi olduğum projeler */}
            {memberProjects.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-ink mb-4">{t("firma_member_title")}</h2>
                <div className="space-y-3">
                  {memberProjects.map((p) => (
                    <Link key={p.id} href={`/projeler/${p.id}`} className="block bg-white border border-line rounded-xl p-5 hover:border-eu transition-all">
                      <h3 className="font-bold text-ink">{p.title}</h3>
                      <p className="text-xs text-mist mt-0.5">{t("firma_owner_label")}: {p.ownerSubscriberName ?? "—"}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* İlanlarım (iş + satınalma) */}
            <ListingsSection myListings={myListings} canTender={false}
              showForm={showListingForm} listingForm={listingForm}
              openForm={openListingForm} setListingForm={setListingForm}
              onSave={saveListing} onClose={() => setShowListingForm(false)}
              confirmDel={confirmDelListing} setConfirmDel={setConfirmDelListing}
              onDelete={removeListing} t={t} locale={locale} />

            {/* Kendi gönderdiğim talepler */}
            {myRequests.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-ink mb-4">{t("firma_sent_requests_title")}</h2>
                <div className="space-y-2">
                  {myRequests.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-white border border-line rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-ink">{allProjectsMap[r.projectId]?.title ?? r.projectId}</p>
                        <p className="text-xs text-mist mt-0.5">
                          {r.requestedRole === "yurutucu" ? t("firma_role_owner_requested") : t("firma_role_member_requested")}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.status === "onaylandi" ? "bg-green-100 text-green-700" : r.status === "reddedildi" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                        {r.status === "onaylandi" ? t("firma_status_approved") : r.status === "reddedildi" ? t("firma_status_rejected") : t("firma_status_pending")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════
            ROL: TEDARİKÇİ — uzman profili + doküman/eğitim araçları + satınalma ilanı
        ═══════════════════════════════════════════════════ */}
        {isSupplier && (
          <>
            {/* Uzman Profilim */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-ink mb-1">{t("panel_expert_profile_title")}</h2>
              <p className="text-slate text-sm mb-4">{t("panel_expert_profile_sub")}</p>
              {myExpertProfile ? (
                <div className="bg-white border border-line rounded-xl p-5">
                  <p className="font-semibold text-ink">{myExpertProfile.name}</p>
                  <p className="text-sm text-slate mt-1">{myExpertProfile.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {myExpertProfile.expertise.map((e) => <span key={e} className="text-xs bg-eu-pale text-eu px-2 py-0.5 rounded">{e}</span>)}
                  </div>
                </div>
              ) : (
                <div className="bg-surface rounded-xl p-5 text-center">
                  <p className="text-slate text-sm mb-3">Henüz uzman profili oluşturulmadı.</p>
                </div>
              )}
              <Link href="/uzmanlar" className="inline-block mt-3 px-4 py-2 border border-eu text-eu rounded-lg text-sm font-semibold hover:bg-eu-pale">
                {t("panel_expert_profile_cta")}
              </Link>
            </div>

            {/* Sınırlı dijital araçlar */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-ink mb-1">{t("firma_dashboard_tools_title")}</h2>
              <p className="text-xs text-mist mb-4">{t("panel_tools_limited_note")}</p>
              <div className="grid grid-cols-2 gap-3">
                {SUPPLIER_TOOLS.map((tool) => (
                  <Link key={tool.href} href={tool.href}
                    className="flex items-center gap-3 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all group">
                    <span className="w-9 h-9 flex items-center justify-center rounded-full bg-eu-pale text-eu group-hover:bg-eu group-hover:text-white transition-colors flex-shrink-0">
                      <ToolIcon id={tool.iconId} className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-semibold text-ink">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Satınalma ilanları */}
            <ListingsSection myListings={myListings.filter((l) => l.type === "satinalma")} canTender={false}
              showForm={showListingForm} listingForm={{ ...listingForm, type: "satinalma" }}
              openForm={() => openListingForm({ ...emptyListingForm(), type: "satinalma" })}
              setListingForm={setListingForm}
              onSave={saveListing} onClose={() => setShowListingForm(false)}
              confirmDel={confirmDelListing} setConfirmDel={setConfirmDelListing}
              onDelete={removeListing} t={t} locale={locale}
              title={locale === "tr" ? "Satınalma İlanlarım" : "My Procurement Listings"} />
          </>
        )}

        {/* ═══════════════════════════════════════════════════
            ROL: DELEGASYON / PROGRAM OTORİTESİ — ihale yönetimi + bülten/paydaş araçları
        ═══════════════════════════════════════════════════ */}
        {isAuthority && (
          <>
            {/* İhale Yönetimi */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-ink mb-1">{t("panel_tender_title")}</h2>
              <p className="text-slate text-sm mb-4">{t("panel_tender_sub")}</p>
              <ListingsSection myListings={myListings.filter((l) => l.type === "ihale")} canTender={true}
                showForm={showListingForm} listingForm={{ ...listingForm, type: "ihale" }}
                openForm={() => openListingForm({ ...emptyListingForm(), type: "ihale" })}
                setListingForm={setListingForm}
                onSave={saveListing} onClose={() => setShowListingForm(false)}
                confirmDel={confirmDelListing} setConfirmDel={setConfirmDelListing}
                onDelete={removeListing} t={t} locale={locale}
                title={locale === "tr" ? "İhale İlanlarım" : "My Tender Listings"} />
            </div>

            {/* İletişim araçları */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-ink mb-1">{t("firma_dashboard_tools_title")}</h2>
              <p className="text-xs text-mist mb-4">{t("panel_tools_limited_note")}</p>
              <div className="grid grid-cols-2 gap-3">
                {AUTHORITY_TOOLS.map((tool) => (
                  <Link key={tool.href} href={tool.href}
                    className="flex items-center gap-3 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all group">
                    <span className="w-9 h-9 flex items-center justify-center rounded-full bg-eu-pale text-eu group-hover:bg-eu group-hover:text-white transition-colors flex-shrink-0">
                      <ToolIcon id={tool.iconId} className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-semibold text-ink">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Herkese gösterilecek: platformdaki aktif ilanlarım (varsa) */}
        {!isAuthority && !isSupplier && canTender && (
          <ListingsSection myListings={myListings} canTender={canTender}
            showForm={showListingForm} listingForm={listingForm}
            openForm={openListingForm} setListingForm={setListingForm}
            onSave={saveListing} onClose={() => setShowListingForm(false)}
            confirmDel={confirmDelListing} setConfirmDel={setConfirmDelListing}
            onDelete={removeListing} t={t} locale={locale} />
        )}

        {confirmDelListing && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
              <h3 className="font-bold text-ink mb-4">{t("firma_listing_delete_confirm")}</h3>
              <div className="flex gap-2">
                <button onClick={() => removeListing(confirmDelListing)} className="px-4 py-2 bg-tr text-white rounded-lg text-sm font-semibold">{t("firma_listing_delete")}</button>
                <button onClick={() => setConfirmDelListing(null)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">{t("firma_listing_form_cancel")}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

// ─── Proje Formu bileşeni ─────────────────────────────────────
function ProjectForm({ show, form, setForm, locationsText, setLocationsText, sectors, donors, onSave, onCancel, t, locale }: {
  show: boolean; form: Project | null; setForm: (f: (p: Project | null) => Project | null) => void;
  locationsText: string; setLocationsText: (s: string) => void;
  sectors: Sector[]; donors: Donor[]; onSave: () => void; onCancel: () => void;
  t: (k: TranslationKey) => string; locale: string;
}) {
  if (!show || !form) return null;
  return (
    <div className="bg-eu-pale border border-eu/20 rounded-2xl p-5 mb-5">
      <h3 className="font-bold text-ink mb-3">{t("firma_project_form_title")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_title_label")}</label>
          <input value={form.title} onChange={(e) => setForm((f) => f && ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_summary_label")}</label>
          <textarea value={form.summary} onChange={(e) => setForm((f) => f && ({ ...f, summary: e.target.value }))}
            rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_sector_label")}</label>
          <select value={form.sectorId} onChange={(e) => setForm((f) => f && ({ ...f, sectorId: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
            {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_donor_label")}</label>
          <select value={form.donorId} onChange={(e) => setForm((f) => f && ({ ...f, donorId: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
            {donors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_period_label")}</label>
          <select value={form.ipaPeriod} onChange={(e) => setForm((f) => f && ({ ...f, ipaPeriod: e.target.value as IpaPeriod }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
            {(["IPA-I", "IPA-II", "IPA-III"] as IpaPeriod[]).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_status_label")}</label>
          <select value={form.status} onChange={(e) => setForm((f) => f && ({ ...f, status: e.target.value as Project["status"] }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
            <option value="devam">{locale === "tr" ? "Devam Ediyor" : "Ongoing"}</option>
            <option value="tamamlandi">{locale === "tr" ? "Tamamlandı" : "Completed"}</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_beneficiary_label")}</label>
          <input value={form.beneficiary} onChange={(e) => setForm((f) => f && ({ ...f, beneficiary: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_locations_label")}</label>
          <input value={locationsText} onChange={(e) => setLocationsText(e.target.value)} placeholder="Örn. Ankara, Konya, İzmir"
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_budget_label")}</label>
          <input value={form.budget ?? ""} onChange={(e) => setForm((f) => f && ({ ...f, budget: e.target.value }))} placeholder="€12.5M"
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_start_label")}</label>
            <input type="date" value={form.startDate ?? ""} onChange={(e) => setForm((f) => f && ({ ...f, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_end_label")}</label>
            <input type="date" value={form.endDate ?? ""} onChange={(e) => setForm((f) => f && ({ ...f, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">{t("firma_project_form_save")}</button>
        <button onClick={onCancel} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">{t("firma_project_form_cancel")}</button>
      </div>
    </div>
  );
}

// ─── İlan Yönetimi bileşeni ───────────────────────────────────
function ListingsSection({
  myListings, canTender, showForm, listingForm, openForm, setListingForm,
  onSave, onClose, confirmDel, setConfirmDel, onDelete, t, locale, title,
}: {
  myListings: Listing[]; canTender: boolean; showForm: boolean; listingForm: Listing;
  openForm: (l?: Listing) => void; setListingForm: React.Dispatch<React.SetStateAction<Listing>>;
  onSave: () => void; onClose: () => void; confirmDel: string | null;
  setConfirmDel: (id: string | null) => void; onDelete: (id: string) => void;
  t: (k: TranslationKey) => string; locale: string; title?: string;
}) {
  const TYPE_LABEL: Record<ListingType, string> = { is: locale === "tr" ? "İş İlanı" : "Job", satinalma: locale === "tr" ? "Satınalma" : "Procurement", ihale: locale === "tr" ? "İhale" : "Tender" };
  const TYPE_COLOR: Record<ListingType, string> = { is: "bg-blue-100 text-blue-700", satinalma: "bg-orange-100 text-orange-700", ihale: "bg-purple-100 text-purple-700" };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">{title ?? t("firma_listings_title")}</h2>
        <button onClick={() => openForm()} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">{t("firma_listings_add")}</button>
      </div>

      {showForm && (
        <div className="bg-eu-pale border border-eu/20 rounded-xl p-5 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">{t("firma_listing_form_title_label")}</label>
              <input value={listingForm.title} onChange={(e) => setListingForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">{t("firma_listing_form_type_label")}</label>
              <select value={listingForm.type} onChange={(e) => setListingForm((f) => ({ ...f, type: e.target.value as ListingType }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                {!canTender && <option value="is">{locale === "tr" ? "İş İlanı" : "Job"}</option>}
                {!canTender && <option value="satinalma">{locale === "tr" ? "Satınalma" : "Procurement"}</option>}
                {canTender && <option value="ihale">{locale === "tr" ? "İhale" : "Tender"}</option>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">{t("firma_listing_form_location_label")}</label>
              <input value={listingForm.location ?? ""} onChange={(e) => setListingForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">{t("firma_listing_form_deadline_label")}</label>
              <input type="date" value={listingForm.deadline ?? ""} onChange={(e) => setListingForm((f) => ({ ...f, deadline: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">{t("firma_listing_form_description_label")}</label>
              <textarea value={listingForm.description} onChange={(e) => setListingForm((f) => ({ ...f, description: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onSave} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">{t("firma_listing_form_save")}</button>
            <button onClick={onClose} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">{t("firma_listing_form_cancel")}</button>
          </div>
        </div>
      )}

      {myListings.length === 0 ? (
        <p className="text-slate text-sm">{t("firma_listings_empty")}</p>
      ) : (
        <div className="space-y-2">
          {myListings.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3 p-4 bg-white border border-line rounded-xl">
              <div>
                <p className="text-sm font-semibold text-ink">{l.title}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_COLOR[l.type]}`}>{TYPE_LABEL[l.type]}</span>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button onClick={() => openForm(l)} className="text-eu text-xs font-semibold hover:underline">{locale === "tr" ? "Düzenle" : "Edit"}</button>
                <button onClick={() => setConfirmDel(l.id)} className="text-mist text-xs hover:text-tr">{t("firma_listing_delete")}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
