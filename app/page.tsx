import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";

export const revalidate = 60;

export default async function HomePage() {
  const db = getDataProvider();
  const [stats, events, listings, blogPosts, featuredProjects, sectors] = await Promise.all([
    db.getHomeStats(),
    db.getEvents(),
    db.getListings(),
    db.getBlogPosts(),
    db.getProjects({ featured: true }),
    db.getSectors(),
  ]);

  const upcoming = events
    .filter((e) => e.isPublic && new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentNews = blogPosts.slice(0, 4);

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-gradient-to-br from-eu to-blue-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Türkiye&apos;nin AB Proje Portalı
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            AB&apos;nin Türkiye&apos;deki Projelerini<br />
            <span className="text-yellow-300">Tek Yerden Keşfedin</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            IPA fonları, hibe programları, istihdam ilanları ve etkinlikler — hepsi burada.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/projeler" className="px-6 py-3 bg-white text-eu font-bold rounded-xl hover:bg-blue-50 transition-colors">
              Projeleri Keşfet
            </Link>
            <Link href="/kayit" className="px-6 py-3 bg-yellow-400 text-ink font-bold rounded-xl hover:bg-yellow-300 transition-colors">
              Kayıt Ol
            </Link>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="max-w-3xl mx-auto mt-14 grid grid-cols-3 gap-4">
          {[
            { label: "Proje", value: stats.projects.toLocaleString("tr") },
            { label: "Açık İlan", value: stats.openListings.toString() },
            { label: "Yaklaşan Etkinlik", value: stats.upcomingEvents.toString() },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-5 text-center">
              <div className="text-3xl font-extrabold">{s.value}</div>
              <div className="text-blue-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sektörler */}
      <section className="py-14 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-8">Sektörler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {sectors.map((s) => (
              <Link key={s.id} href={`/projeler?sektor=${s.id}`}
                className="bg-white rounded-xl border border-line p-4 text-center hover:border-eu hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full mx-auto mb-3" style={{ backgroundColor: s.color ?? "#003399" }} />
                <div className="text-sm font-semibold text-ink leading-tight">{s.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Öne Çıkan Projeler */}
      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-ink">Öne Çıkan Projeler</h2>
            <Link href="/projeler" className="text-eu text-sm font-semibold hover:underline">Tüm projeler →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.slice(0, 6).map((p) => (
              <Link key={p.id} href={`/projeler/${p.id}`}
                className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-eu" />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      p.status === "devam" ? "bg-green-100 text-green-700" :
                      p.status === "tamamlandi" ? "bg-gray-100 text-gray-600" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {p.status === "devam" ? "Devam Ediyor" : p.status === "tamamlandi" ? "Tamamlandı" : "Planlama"}
                    </span>
                    <span className="text-xs text-mist">{p.ipaPeriod}</span>
                  </div>
                  <h3 className="font-bold text-ink mb-2 leading-tight">{p.title}</h3>
                  <p className="text-slate text-sm leading-relaxed line-clamp-2">{p.summary}</p>
                  {p.budget && (
                    <div className="mt-3 text-xs text-eu font-semibold">{p.budget}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* İlanlar */}
      <section className="py-14 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-ink">Güncel İlanlar</h2>
            <Link href="/ilanlar" className="text-eu text-sm font-semibold hover:underline">Tüm ilanlar →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {listings.slice(0, 6).map((l) => (
              <Link key={l.id} href={`/ilanlar/${l.id}`}
                className="bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    l.type === "is" ? "bg-blue-100 text-blue-700" :
                    l.type === "satinalma" ? "bg-orange-100 text-orange-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {l.type === "is" ? "İş İlanı" : l.type === "satinalma" ? "Satınalma" : "İhale"}
                  </span>
                  {l.locked && <span className="text-mist">🔒</span>}
                </div>
                <h3 className="font-semibold text-ink text-sm leading-tight mb-1">{l.title}</h3>
                <p className="text-xs text-mist">{l.organization}</p>
                {l.deadline && <p className="text-xs text-tr mt-2">Son başvuru: {l.deadline}</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Etkinlikler */}
      {upcoming.length > 0 && (
        <section className="py-14 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-ink">Yaklaşan Etkinlikler</h2>
              <Link href="/etkinlikler" className="text-eu text-sm font-semibold hover:underline">Tüm etkinlikler →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcoming.map((e) => {
                const d = new Date(e.date);
                return (
                  <Link key={e.id} href={`/etkinlikler/${e.id}`}
                    className="bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-md transition-all flex gap-4">
                    <div className="flex-shrink-0 text-center bg-eu-pale rounded-xl p-3 w-16">
                      <div className="text-2xl font-extrabold text-eu">{d.getDate()}</div>
                      <div className="text-xs text-eu font-semibold uppercase">
                        {d.toLocaleDateString("tr", { month: "short" })}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink text-sm leading-tight mb-1">{e.title}</h3>
                      <p className="text-xs text-mist">📍 {e.location}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* AB-Türkiye Gündemi */}
      <section className="py-14 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-ink">AB-Türkiye Gündemi</h2>
            <Link href="/gundem" className="text-eu text-sm font-semibold hover:underline">Tüm haberler →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentNews.map((post) => (
              <Link key={post.id} href={`/gundem/${post.slug}`}
                className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-br from-eu to-blue-700 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-ink text-sm leading-tight mb-2">{post.title}</h3>
                  <p className="text-xs text-mist">{new Date(post.publishedAt).toLocaleDateString("tr")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dijital Araçlar */}
      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-2">Dijital Araçlar</h2>
          <p className="text-slate mb-8">Proje yöneticinizi kolaylaştıran entegre araçlar seti.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/araclar/etkinlik", title: "Etkinlik Yönetimi", desc: "RSVP takibi, gündem ve müsaitlik anketi.", color: "#0E7490" },
              { href: "/araclar/dokuman", title: "E-Doküman Yönetimi", desc: "Doküman kütüphanesi, erişim kontrolü, indirme sayacı.", color: "#1D7A5F" },
              { href: "/araclar/bulten", title: "Bülten Gönderimi", desc: "Hedefli e-posta kampanyaları ve istatistikler.", color: "#7C5710" },
              { href: "/araclar/paydas", title: "Paydaş İletişimi", desc: "Ekip, uzman ve tedarikçi yönetimi.", color: "#3730A3" },
              { href: "/araclar/rapor", title: "Raporlama", desc: "Portföy analizi ve Excel/CSV dışa aktarım.", color: "#0F766E" },
              { href: "/araclar/egitim", title: "E-Learning", desc: "Eğitim videoları ve proje ekibi öğrenim takibi.", color: "#7C3AED" },
              { href: "/araclar/harita", title: "Proje Haritası", desc: "İllere göre proje dağılımını görselleştirin.", color: "#B45309" },
              { href: "/kayit", title: "Uzman CV Havuzu", desc: "Uzman profillerini yönetin ve proje ekibi kurun.", color: "#0369A1" },
            ].map((t) => (
              <Link key={t.href} href={t.href}
                className="border border-line rounded-xl overflow-hidden hover:shadow-md transition-all group">
                <div className="h-20 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)` }}>
                  <span className="text-white text-2xl font-extrabold opacity-30 group-hover:opacity-50 transition-opacity">✦</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-ink text-sm mb-1">{t.title}</h3>
                  <p className="text-xs text-slate leading-relaxed">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-eu text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">Projenizi Portföye Ekleyin</h2>
          <p className="text-blue-200 mb-8">
            Türkiye&apos;de yürütülen AB projelerinizi platformumuza ekleyin, geniş kitlelere ulaşın.
          </p>
          <Link href="/kayit" className="inline-block px-8 py-3 bg-yellow-400 text-ink font-bold rounded-xl hover:bg-yellow-300 transition-colors">
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
