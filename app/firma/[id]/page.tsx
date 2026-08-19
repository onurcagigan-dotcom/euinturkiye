"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProjectProgressBar } from "@/components/ProjectProgressBar";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import type { Subscriber, Project, Listing, SubscriberProfileType } from "@/lib/types";

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

const SUPPLIER_SERVICE_CATS = [
  "İnşaat & Altyapı", "Bilişim & Yazılım", "Eğitim & Danışmanlık", "Tercüme & Çeviri",
  "Medya & İletişim", "Lojistik & Nakliye", "Araştırma & Analiz", "Hukuki Hizmetler",
  "Mali Hizmetler", "Yiyecek & İkram", "Ekipman & Malzeme", "Çevre & Enerji",
];

export default function FirmaProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLocale();
  const { current: firma } = useFirma();
  const [subscriber, setSubscriber] = useState<Subscriber | null | undefined>(undefined);
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  // Düzenleme state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    organization: "", shortBio: "", mission: "", foundedYear: "",
    employeeCount: "", servicesText: "", contactAddress: "", contactPhone: "",
    contactEmail: "", website: "", linkedin: "", twitter: "", instagram: "", facebook: "",
  });

  useEffect(() => {
    const db = getDataProvider();
    db.getSubscriber(id).then(async (s) => {
      setSubscriber(s);
      if (!s) return;
      // Formu subscriber verisiyle doldur
      setForm({
        organization: s.organization ?? "",
        shortBio: s.shortBio ?? "",
        mission: s.mission ?? "",
        foundedYear: s.foundedYear?.toString() ?? "",
        employeeCount: s.employeeCount ?? "",
        servicesText: (s.services ?? []).join(", "),
        contactAddress: s.contactAddress ?? "",
        contactPhone: s.contactPhone ?? "",
        contactEmail: s.contactEmail ?? "",
        website: s.socialLinks?.website ?? "",
        linkedin: s.socialLinks?.linkedin ?? "",
        twitter: s.socialLinks?.twitter ?? "",
        instagram: s.socialLinks?.instagram ?? "",
        facebook: s.socialLinks?.facebook ?? "",
      });
      const [allProjects, allListings] = await Promise.all([db.getProjects(), db.getListings()]);
      setOwnedProjects(allProjects.filter((p) => p.ownerSubscriberId === s.id));
      setMemberProjects(allProjects.filter((p) =>
        p.ownerSubscriberId !== s.id && p.consortiumMembers?.some((m) => m.subscriberId === s.id)
      ));
      setListings(allListings.filter((l) => l.publisherSubscriberId === s.id && l.isActive !== false));
    });
  }, [id]);

  const saveProfile = async () => {
    if (!subscriber) return;
    setSaving(true);
    const updated: Subscriber = {
      ...subscriber,
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
        website: form.website || undefined, linkedin: form.linkedin || undefined,
        twitter: form.twitter || undefined, instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
      },
    };
    await getDataProvider().saveSubscriber(updated);
    setSubscriber(updated);
    setSaving(false); setSaved(true); setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  if (subscriber === undefined) {
    return <PageShell><div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }
  if (!subscriber || subscriber.profilePublic === false) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-ink mb-2">{t("company_profile_not_found")}</h1>
          <Link href="/" className="text-eu hover:underline">{t("breadcrumb_home")}</Link>
        </div>
      </PageShell>
    );
  }

  const displayName = subscriber.organization || subscriber.name;
  const jobListings = listings.filter((l) => l.type === "is");
  const procurementListings = listings.filter((l) => l.type === "satinalma");
  const tenderListings = listings.filter((l) => l.type === "ihale");
  const isOrgProfile = ["firma", "stk"].includes(subscriber.profileType);
  const isOwner = firma?.id === subscriber.id;
  const isSupplier = subscriber.profileType === "tedarikci";
  const isStk = subscriber.profileType === "stk";

  const selectedServices = form.servicesText ? form.servicesText.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const toggleService = (cat: string) => {
    const set = new Set(selectedServices);
    set.has(cat) ? set.delete(cat) : set.add(cat);
    setForm((f) => ({ ...f, servicesText: Array.from(set).join(", ") }));
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: displayName }]} />

        {/* ── Profil kartı ── */}
        <div className="bg-white border border-line rounded-2xl mb-6 overflow-hidden">

          {/* Başlık satırı */}
          <div className="p-6">
            <div className="flex items-start gap-5">
              {subscriber.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={subscriber.logoUrl} alt={displayName} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-line" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-eu flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                  {displayName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-extrabold text-ink">{displayName}</h1>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ROLE_COLOR[subscriber.profileType]}`}>
                        {ROLE_LABEL[subscriber.profileType]}
                      </span>
                    </div>
                    {subscriber.shortBio && !editing && (
                      <p className="text-slate text-sm leading-relaxed mt-2">{subscriber.shortBio}</p>
                    )}
                    {subscriber.mission && !editing && (
                      <p className="text-slate text-sm leading-relaxed mt-1 italic">"{subscriber.mission}"</p>
                    )}
                  </div>
                  {/* Sahip ise aksiyon butonları */}
                  {isOwner && !editing && (
                    <div className="flex gap-2 flex-shrink-0">
                      {saved && <span className="text-green-600 text-xs font-semibold pt-1">✓ Kaydedildi</span>}
                      <button onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-eu text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                        Profili Düzenle
                      </button>
                      <Link href="/firma"
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-line text-slate rounded-lg text-xs font-semibold hover:border-eu hover:text-eu transition-colors">
                        Panelim →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Düzenleme formu — inline ── */}
            {isOwner && editing && (
              <div className="mt-5 pt-5 border-t border-line space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-mist mb-1">{isStk ? "Vakıf / Dernek Adı" : "Kuruluş Adı"}</label>
                    <input value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                      className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-mist mb-1">Hakkında</label>
                    <textarea value={form.shortBio} onChange={(e) => setForm((f) => ({ ...f, shortBio: e.target.value }))}
                      rows={3} className="w-full px-3 py-2 border border-line rounded-lg text-sm resize-none focus:outline-none focus:border-eu" />
                  </div>
                  {isStk && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-mist mb-1">Misyon</label>
                      <textarea value={form.mission} onChange={(e) => setForm((f) => ({ ...f, mission: e.target.value }))}
                        rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm resize-none focus:outline-none focus:border-eu" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-mist mb-1">Kuruluş Yılı</label>
                    <input type="number" value={form.foundedYear} onChange={(e) => setForm((f) => ({ ...f, foundedYear: e.target.value }))}
                      placeholder="2010" className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mist mb-1">Çalışan Sayısı</label>
                    <select value={form.employeeCount} onChange={(e) => setForm((f) => ({ ...f, employeeCount: e.target.value }))}
                      className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                      <option value="">— Seçin —</option>
                      {["1-10","11-50","51-200","201-500","500+"].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-mist mb-2">
                      {isSupplier ? "Sunduğunuz Hizmet Kategorileri" : isStk ? "Faaliyet Alanları" : "Hizmetler & Uzmanlık"}
                    </label>
                    {isSupplier ? (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {SUPPLIER_SERVICE_CATS.map((cat) => (
                            <button key={cat} type="button" onClick={() => toggleService(cat)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedServices.includes(cat) ? "bg-eu text-white border-eu" : "bg-white text-slate border-line hover:border-eu"}`}>
                              {cat}
                            </button>
                          ))}
                        </div>
                        <input value={form.servicesText} onChange={(e) => setForm((f) => ({ ...f, servicesText: e.target.value }))}
                          placeholder="Listede olmayanlar için virgülle ekleyin"
                          className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                      </div>
                    ) : (
                      <input value={form.servicesText} onChange={(e) => setForm((f) => ({ ...f, servicesText: e.target.value }))}
                        placeholder="Proje Yönetimi, Eğitim, Kapasite Geliştirme"
                        className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                    )}
                  </div>
                </div>

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
                      <label className="block text-xs font-semibold text-mist mb-1">E-posta</label>
                      <input type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-mist uppercase tracking-wide mb-3">Web & Sosyal</p>
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
                        <input value={(form as Record<string, string>)[key]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={saveProfile} disabled={saving}
                    className="px-5 py-2.5 bg-eu text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                    {saving ? "Kaydediliyor…" : "Kaydet"}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="px-5 py-2.5 border border-line text-slate rounded-lg text-sm">
                    İptal
                  </button>
                </div>
              </div>
            )}

            {/* Statik görünüm — düzenleme yoksa */}
            {!editing && (
              <>
                {/* Rozetler */}
                {(ownedProjects.length > 0 || memberProjects.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-line">
                    {ownedProjects.filter((p) => p.status === "devam").length > 0 && (
                      <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 text-xs font-semibold text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {ownedProjects.filter((p) => p.status === "devam").length} Aktif Proje
                      </span>
                    )}
                    {ownedProjects.filter((p) => p.status === "tamamlandi").length > 0 && (
                      <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600">
                        ✓ {ownedProjects.filter((p) => p.status === "tamamlandi").length} Tamamlanan
                      </span>
                    )}
                    {memberProjects.length > 0 && (
                      <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 text-xs font-semibold text-blue-700">
                        🤝 {memberProjects.length} Konsorsiyum Üyeliği
                      </span>
                    )}
                  </div>
                )}

                {/* Kuruluş bilgileri */}
                {(isOrgProfile || isSupplier) && (subscriber.foundedYear || subscriber.employeeCount) && (
                  <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-line text-sm text-slate">
                    {subscriber.foundedYear && <span>🗓️ <strong className="text-ink">{subscriber.foundedYear}</strong> yılında kuruldu</span>}
                    {subscriber.employeeCount && <span>👥 <strong className="text-ink">{subscriber.employeeCount}</strong> çalışan</span>}
                  </div>
                )}

                {/* Hizmetler */}
                {subscriber.services && subscriber.services.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-line">
                    <p className="text-xs font-bold text-mist uppercase tracking-wide mb-2">
                      {isStk ? "Faaliyet Alanları" : isSupplier ? "Sunulan Hizmetler" : "Hizmetler & Uzmanlık"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subscriber.services.map((s) => (
                        <span key={s} className="text-xs bg-eu-pale text-eu px-2.5 py-1 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* İletişim */}
                {(subscriber.contactAddress || subscriber.contactPhone || subscriber.contactEmail || subscriber.socialLinks) && (
                  <div className="mt-4 pt-4 border-t border-line">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate mb-3">
                      {subscriber.contactAddress && <span>📍 {subscriber.contactAddress}</span>}
                      {subscriber.contactPhone && <span>📞 {subscriber.contactPhone}</span>}
                      {subscriber.contactEmail && <a href={`mailto:${subscriber.contactEmail}`} className="text-eu hover:underline">✉️ {subscriber.contactEmail}</a>}
                    </div>
                    {subscriber.socialLinks && (
                      <div className="flex flex-wrap gap-3">
                        {subscriber.socialLinks.website && <a href={subscriber.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-eu text-sm font-medium hover:underline">🌐 Website</a>}
                        {subscriber.socialLinks.linkedin && <a href={subscriber.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-eu text-sm font-medium hover:underline">in LinkedIn</a>}
                        {subscriber.socialLinks.twitter && <a href={subscriber.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-eu text-sm font-medium hover:underline">𝕏 Twitter</a>}
                        {subscriber.socialLinks.instagram && <a href={subscriber.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-eu text-sm font-medium hover:underline">📷 Instagram</a>}
                        {subscriber.socialLinks.facebook && <a href={subscriber.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-eu text-sm font-medium hover:underline">Facebook</a>}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Projeler ── */}
        {!editing && (ownedProjects.length > 0 || memberProjects.length > 0) && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-ink mb-3">Projeler</h2>
            {ownedProjects.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-mist uppercase tracking-wide mb-2">{t("company_profile_projects_owner")}</p>
                <div className="space-y-2">
                  {ownedProjects.map((p) => (
                    <Link key={p.id} href={`/projeler/${p.id}`}
                      className="block p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="font-semibold text-ink text-sm">{p.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-mist">{p.ipaPeriod}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === "devam" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {p.status === "devam" ? t("status_ongoing") : t("status_completed")}
                          </span>
                        </div>
                      </div>
                      {p.startDate && p.endDate && (
                        <ProjectProgressBar project={p} variant="compact" labels={{
                          notStarted: t("progress_not_started"), completed: t("progress_completed"),
                          daysRemaining: t("progress_days_remaining"), needsUpdate: t("progress_needs_update"),
                        }} />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {memberProjects.length > 0 && (
              <div>
                <p className="text-xs font-bold text-mist uppercase tracking-wide mb-2">{t("company_profile_projects_member")}</p>
                <div className="space-y-2">
                  {memberProjects.map((p) => (
                    <Link key={p.id} href={`/projeler/${p.id}`}
                      className="flex items-center justify-between p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                      <span className="font-semibold text-ink text-sm">{p.title}</span>
                      <span className="text-xs text-mist">{p.ownerSubscriberName}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── İlanlar ── */}
        {!editing && listings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-ink mb-3">Aktif İlanlar</h2>
            {[
              { list: listings.filter((l) => l.type === "is"), label: "İş İlanları", color: "bg-blue-100 text-blue-700" },
              { list: listings.filter((l) => l.type === "satinalma"), label: "Satınalma İlanları", color: "bg-orange-100 text-orange-700" },
              { list: listings.filter((l) => l.type === "ihale"), label: "İhale İlanları", color: "bg-purple-100 text-purple-700" },
            ].filter(({ list }) => list.length > 0).map(({ list, label, color }) => (
              <div key={label} className="mb-4">
                <p className="text-xs font-bold text-mist uppercase tracking-wide mb-2">{label}</p>
                <div className="space-y-2">
                  {list.map((l) => (
                    <Link key={l.id} href={`/ilanlar/${l.id}`}
                      className="flex items-center justify-between gap-3 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                      <div className="min-w-0">
                        <span className="font-semibold text-ink text-sm block truncate">{l.title}</span>
                        {l.subject && <span className="text-xs text-mist">{l.subject}</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {l.budget && <span className="text-xs font-semibold text-eu">{l.budget}</span>}
                        {l.deadline && <span className="text-xs text-mist">Son: {new Date(l.deadline).toLocaleDateString("tr-TR")}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!editing && ownedProjects.length === 0 && memberProjects.length === 0 && listings.length === 0 && (
          <div className="bg-white border border-line rounded-2xl p-8 text-center text-mist text-sm">
            Henüz yayınlanmış proje veya ilan bulunmuyor.
          </div>
        )}
      </div>
    </PageShell>
  );
}
