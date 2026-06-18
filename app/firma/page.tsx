"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { useLocale } from "@/lib/i18n/context";
import { getDataProvider } from "@/lib/data";
import { PLAN_PRICING, getSubscriptionYear, getCurrentYearPrice, formatEuro } from "@/lib/pricing";
import { canPostTender } from "@/lib/types";
import type { Project, OwnershipRequest, Listing, ListingType, Sector, Donor, IpaPeriod } from "@/lib/types";

const PERIODS: IpaPeriod[] = ["IPA-I", "IPA-II", "IPA-III"];

const DIGITAL_TOOLS = [
  { href: "/araclar/etkinlik", icon: "📅", labelKey: "Etkinlik Yönetimi" },
  { href: "/araclar/dokuman", icon: "📁", labelKey: "E-Doküman Yönetimi" },
  { href: "/araclar/bulten", icon: "📧", labelKey: "Bülten Gönderimi" },
  { href: "/araclar/paydas", icon: "🤝", labelKey: "Paydaş İletişimi" },
  { href: "/araclar/egitim", icon: "🎓", labelKey: "Eğitim Materyalleri" },
] as const;

export default function FirmaPanelPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { current, loading, logout } = useFirma();
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<OwnershipRequest[]>([]);
  const [myRequests, setMyRequests] = useState<OwnershipRequest[]>([]);
  const [allProjectsMap, setAllProjectsMap] = useState<Record<string, Project>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [showListingForm, setShowListingForm] = useState(false);
  const [confirmDelListing, setConfirmDelListing] = useState<string | null>(null);
  const emptyListingForm = (): Listing => ({
    id: `ilan-${Date.now()}`, type: "is", title: "", organization: current?.organization ?? current?.name ?? "",
    location: "", deadline: "", locked: false, description: "", publisherSubscriberId: current?.id,
  });
  const [listingForm, setListingForm] = useState<Listing>(emptyListingForm());

  // Proje ekleme/düzenleme
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState<Project | null>(null);
  const [locationsText, setLocationsText] = useState("");

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
    ]).then(([allProjects, incoming, mine, allListings, allSectors, allDonors]) => {
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
      setDataLoading(false);
    });
  }, [current, loading, router]);

  const resolveRequest = async (id: string, status: "onaylandi" | "reddedildi") => {
    const db = getDataProvider();
    await db.resolveOwnershipRequest(id, status);
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
    setActionMsg(status === "onaylandi" ? t("firma_action_success_approved") : t("firma_action_success_rejected"));
    if (current) {
      const allProjects = await db.getProjects();
      setOwnedProjects(allProjects.filter((p) => p.ownerSubscriberId === current.id));
    }
  };

  if (loading || (current && dataLoading)) {
    return <PageShell><div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }

  if (!current) return null;

  const canTender = canPostTender(current.profileType);

  const openNewListingForm = () => {
    setListingForm({
      id: `ilan-${Date.now()}`, type: "is", title: "", organization: current.organization ?? current.name,
      location: "", deadline: "", locked: false, description: "", publisherSubscriberId: current.id,
    });
    setShowListingForm(true);
  };

  const saveListing = async () => {
    if (!listingForm.title) return;
    const db = getDataProvider();
    await db.saveListing(listingForm);
    setMyListings((prev) => {
      const i = prev.findIndex((x) => x.id === listingForm.id);
      return i !== -1 ? prev.map((x, j) => (j === i ? listingForm : x)) : [listingForm, ...prev];
    });
    setShowListingForm(false);
  };

  const removeListing = async (id: string) => {
    const db = getDataProvider();
    await db.removeListing(id);
    setMyListings((prev) => prev.filter((l) => l.id !== id));
    setConfirmDelListing(null);
  };

  const emptyProjectForm = (): Project => ({
    id: `prj-${Date.now()}`, title: "", summary: "", sectorId: sectors[0]?.id ?? "tarim", donorId: donors[0]?.id ?? "eu",
    ipaPeriod: "IPA-III", beneficiary: "", locations: [], status: "devam", featured: false,
    ownerSubscriberId: current.id, ownerSubscriberName: current.organization ?? current.name,
  });

  const openNewProjectForm = () => {
    setProjectForm(emptyProjectForm());
    setLocationsText("");
    setShowProjectForm(true);
  };

  const openEditProjectForm = (p: Project) => {
    setProjectForm(p);
    setLocationsText(p.locations.join(", "));
    setShowProjectForm(true);
  };

  const saveProjectForm = async () => {
    if (!projectForm || !projectForm.title || !projectForm.summary) return;
    const updated: Project = {
      ...projectForm,
      locations: locationsText.split(",").map((l) => l.trim()).filter(Boolean),
    };
    await getDataProvider().saveProject(updated);
    setOwnedProjects((prev) => {
      const i = prev.findIndex((p) => p.id === updated.id);
      return i !== -1 ? prev.map((p, j) => (j === i ? updated : p)) : [updated, ...prev];
    });
    setAllProjectsMap((prev) => ({ ...prev, [updated.id]: updated }));
    setShowProjectForm(false);
    setProjectForm(null);
  };

  const pricing = PLAN_PRICING[current.plan];
  const subscriptionYear = getSubscriptionYear(current.createdAt);
  const currentYearPrice = getCurrentYearPrice(current.plan, current.createdAt);

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("firma_panel_title") }]} />

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">{current.organization ?? current.name}</h1>
            <p className="text-slate text-sm mt-0.5">
              {current.accountType === "sirket" ? t("firma_account_type_sirket") : t("firma_account_type_stk")} {t("firma_account_label")} · {current.name}
            </p>
          </div>
          <button onClick={() => { logout(); router.push("/"); }}
            className="text-sm px-4 py-2 border border-line text-slate rounded-lg hover:bg-surface">
            {t("firma_logout")}
          </button>
        </div>

        {/* Üyelik bilgisi */}
        <div className="bg-white border border-line rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
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

        {actionMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-6">
            {actionMsg}
          </div>
        )}

        {/* Dijital Araçlarım */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-ink mb-1">{t("firma_dashboard_tools_title")}</h2>
          <p className="text-slate text-sm mb-4">{t("firma_dashboard_tools_sub")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {DIGITAL_TOOLS.map((tool) => (
              <Link key={tool.href} href={tool.href}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all text-center">
                <span className="text-2xl">{tool.icon}</span>
                <span className="text-xs font-semibold text-ink leading-tight">{tool.labelKey}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Onay bekleyen gelen talepler */}
        {incomingRequests.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-ink mb-1">{t("firma_pending_title")}</h2>
            <p className="text-slate text-sm mb-4">
              {t("firma_pending_sub")}
            </p>
            <div className="space-y-3">
              {incomingRequests.map((r) => {
                const project = [...ownedProjects].find((p) => p.id === r.projectId);
                return (
                  <div key={r.id} className="bg-white border border-eu/30 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-xs text-mist mb-1">
                          {project ? <Link href={`/projeler/${project.id}`} className="text-eu hover:underline font-semibold">{project.title}</Link> : r.projectId}
                        </p>
                        <h3 className="font-bold text-ink">{r.subscriberName}</h3>
                        <p className="text-xs text-mist mt-0.5">{t("firma_requested_role_member")}</p>
                        {r.note && <p className="text-sm text-slate mt-2 bg-surface rounded-lg p-3">{r.note}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => resolveRequest(r.id, "onaylandi")}
                          className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
                          {t("firma_approve")}
                        </button>
                        <button onClick={() => resolveRequest(r.id, "reddedildi")}
                          className="px-4 py-2 border border-line text-slate rounded-lg text-sm">
                          {t("firma_reject")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Yürütücüsü olunan projeler */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink">{t("firma_owned_title")}</h2>
            <button onClick={openNewProjectForm} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
              {t("firma_project_add")}
            </button>
          </div>

          {showProjectForm && projectForm && (
            <div className="bg-eu-pale border border-eu/20 rounded-2xl p-5 mb-5">
              <h3 className="font-bold text-ink mb-3">{t("firma_project_form_title")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_title_label")}</label>
                  <input value={projectForm.title} onChange={(e) => setProjectForm((f) => f && ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_summary_label")}</label>
                  <textarea value={projectForm.summary} onChange={(e) => setProjectForm((f) => f && ({ ...f, summary: e.target.value }))}
                    rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_sector_label")}</label>
                  <select value={projectForm.sectorId} onChange={(e) => setProjectForm((f) => f && ({ ...f, sectorId: e.target.value }))}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                    {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_donor_label")}</label>
                  <select value={projectForm.donorId} onChange={(e) => setProjectForm((f) => f && ({ ...f, donorId: e.target.value }))}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                    {donors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_period_label")}</label>
                  <select value={projectForm.ipaPeriod} onChange={(e) => setProjectForm((f) => f && ({ ...f, ipaPeriod: e.target.value as IpaPeriod }))}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                    {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_status_label")}</label>
                  <select value={projectForm.status} onChange={(e) => setProjectForm((f) => f && ({ ...f, status: e.target.value as Project["status"] }))}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                    <option value="devam">{locale === "tr" ? "Devam Ediyor" : "Ongoing"}</option>
                    <option value="tamamlandi">{locale === "tr" ? "Tamamlandı" : "Completed"}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_beneficiary_label")}</label>
                  <input value={projectForm.beneficiary} onChange={(e) => setProjectForm((f) => f && ({ ...f, beneficiary: e.target.value }))}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_locations_label")}</label>
                  <input value={locationsText} onChange={(e) => setLocationsText(e.target.value)} placeholder="Örn. Ankara, Konya, İzmir"
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_budget_label")}</label>
                  <input value={projectForm.budget ?? ""} onChange={(e) => setProjectForm((f) => f && ({ ...f, budget: e.target.value }))} placeholder="€12.5M"
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_start_label")}</label>
                    <input type="date" value={projectForm.startDate ?? ""} onChange={(e) => setProjectForm((f) => f && ({ ...f, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mist mb-1">{t("firma_project_form_end_label")}</label>
                    <input type="date" value={projectForm.endDate ?? ""} onChange={(e) => setProjectForm((f) => f && ({ ...f, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveProjectForm} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">{t("firma_project_form_save")}</button>
                <button onClick={() => { setShowProjectForm(false); setProjectForm(null); }} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">{t("firma_project_form_cancel")}</button>
              </div>
            </div>
          )}

          {ownedProjects.length === 0 ? (
            <p className="text-slate text-sm">{t("firma_owned_empty")}</p>
          ) : (
            <div className="space-y-3">
              {ownedProjects.map((p) => (
                <div key={p.id} className="bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-sm transition-all">
                  <Link href={`/projeler/${p.id}`} className="block">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-ink">{p.title}</h3>
                        <p className="text-xs text-mist mt-0.5">{p.ipaPeriod} · {p.budget ?? "—"}</p>
                      </div>
                      <span className="text-xs bg-eu-pale text-eu px-2 py-1 rounded-full font-semibold flex-shrink-0">{t("firma_owner_badge")}</span>
                    </div>
                    {p.consortiumMembers && p.consortiumMembers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-line">
                        <p className="text-xs text-mist mb-1.5">{t("firma_members_count")} ({p.consortiumMembers.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.consortiumMembers.map((m) => (
                            <span key={m.subscriberId} className="text-xs bg-surface text-slate px-2 py-0.5 rounded-full">
                              {m.subscriberName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Link>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-line">
                    <button onClick={() => openEditProjectForm(p)} className="text-xs font-semibold text-eu hover:underline">
                      {t("firma_project_edit")}
                    </button>
                    <Link href="/araclar" className="text-xs font-semibold text-slate hover:text-eu">
                      {t("firma_project_tools_cta")} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Konsorsiyum üyesi olunan projeler */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-ink mb-4">{t("firma_member_title")}</h2>
          {memberProjects.length === 0 ? (
            <p className="text-slate text-sm">{t("firma_member_empty")}</p>
          ) : (
            <div className="space-y-3">
              {memberProjects.map((p) => (
                <Link key={p.id} href={`/projeler/${p.id}`}
                  className="block bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-sm transition-all">
                  <h3 className="font-bold text-ink">{p.title}</h3>
                  <p className="text-xs text-mist mt-0.5">
                    {t("firma_owner_label")}: {p.ownerSubscriberName ?? "—"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* İlanlarım */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink">{t("firma_listings_title")}</h2>
            <button onClick={openNewListingForm} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
              {t("firma_listings_add")}
            </button>
          </div>

          {showListingForm && (
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
                    <option value="is">{t("listings_jobs")}</option>
                    <option value="satinalma">{t("listings_procurement")}</option>
                    {canTender && <option value="ihale">{t("listings_tender")}</option>}
                  </select>
                  {!canTender && (
                    <p className="text-xs text-mist mt-1">{t("firma_listing_tender_restricted")}</p>
                  )}
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
                    rows={3} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveListing} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">{t("firma_listing_form_save")}</button>
                <button onClick={() => setShowListingForm(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">{t("firma_listing_form_cancel")}</button>
              </div>
            </div>
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

          {myListings.length === 0 ? (
            <p className="text-slate text-sm">{t("firma_listings_empty")}</p>
          ) : (
            <div className="space-y-2">
              {myListings.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 p-4 bg-white border border-line rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-ink">{l.title}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                      l.type === "is" ? "bg-blue-100 text-blue-700" : l.type === "satinalma" ? "bg-orange-100 text-orange-700" : "bg-purple-100 text-purple-700"
                    }`}>
                      {l.type === "is" ? t("listings_jobs") : l.type === "satinalma" ? t("listings_procurement") : t("listings_tender")}
                    </span>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button onClick={() => { setListingForm(l); setShowListingForm(true); }} className="text-eu text-xs font-semibold hover:underline">
                      {locale === "tr" ? "Düzenle" : "Edit"}
                    </button>
                    <button onClick={() => setConfirmDelListing(l.id)} className="text-mist text-xs hover:text-tr">
                      {t("firma_listing_delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kendi gönderdiğiniz talepler */}
        <div>
          <h2 className="text-lg font-bold text-ink mb-4">{t("firma_sent_requests_title")}</h2>
          {myRequests.length === 0 ? (
            <p className="text-slate text-sm">{t("firma_sent_requests_empty")}</p>
          ) : (
            <div className="space-y-2">
              {myRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-white border border-line rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-ink">{allProjectsMap[r.projectId]?.title ?? r.projectId}</p>
                    <p className="text-xs text-mist mt-0.5">
                      {r.requestedRole === "yurutucu" ? t("firma_role_owner_requested") : t("firma_role_member_requested")}
                      {" · "}
                      {r.approverType === "admin" ? t("firma_approver_admin") : t("firma_approver_owner")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    r.status === "onaylandi" ? "bg-green-100 text-green-700" :
                    r.status === "reddedildi" ? "bg-red-100 text-red-600" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {r.status === "onaylandi" ? t("firma_status_approved") : r.status === "reddedildi" ? t("firma_status_rejected") : t("firma_status_pending")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
