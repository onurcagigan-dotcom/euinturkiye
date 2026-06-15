import Link from "next/link";
import type {
  NewsItem, Sector, EventItem, Project, Listing, BlogPost,
} from "@/lib/types";

/* ---------- Ortak başlık ---------- */
function SectionHead({ kicker, title, moreHref, moreLabel }: {
  kicker: string; title: string; moreHref?: string; moreLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-10">
      <div>
        <p className="text-eu font-semibold tracking-widest text-xs uppercase">{kicker}</p>
        <h2 className="text-2xl md:text-3xl font-bold mt-2 text-ink">{title}</h2>
      </div>
      {moreHref && (
        <Link href={moreHref} className="text-eu font-semibold text-sm shrink-0">
          {moreLabel ?? "Tümü"} →
        </Link>
      )}
    </div>
  );
}

/* ---------- Gündem (haberler) ---------- */
export function NewsSection({ items }: { items: NewsItem[] }) {
  return (
    <section id="gundem" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead kicker="Gündem" title="Projelerden son haberler" moreHref="/gundem" moreLabel="Tüm haberler" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((n) => (
            <article key={n.id} className="bg-[#f9fafb] border border-line rounded-xl p-6">
              <span className="text-[11px] uppercase tracking-wide font-semibold text-eu">{n.kind}</span>
              <h3 className="font-bold text-[15px] mt-2 text-ink leading-snug">{n.title}</h3>
              <p className="text-sm text-slate mt-2 leading-relaxed line-clamp-3">{n.excerpt}</p>
              <p className="text-xs text-mist mt-3">{n.source}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Sektörler (Portföy) ---------- */
export function SectorsSection({ sectors }: { sectors: Sector[] }) {
  return (
    <section id="portfoy" className="py-20 bg-eu-pale">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead kicker="Portföy" title="10 Sektörde AB Projeleri" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {sectors.map((s) => (
            <Link
              key={s.id}
              href={`/projeler?sektor=${s.id}`}
              className="bg-white border border-line rounded-xl p-6 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition"
            >
              <div className="w-16 h-16 rounded-full bg-eu-pale flex items-center justify-center mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.icon} alt={s.name} className="w-9 h-9 object-contain" />
              </div>
              <h3 className="font-semibold text-sm text-ink min-h-[40px] flex items-center">{s.name}</h3>
              <p className="text-eu font-bold text-sm mt-2">{s.projectCount} proje</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Takvim (etkinlikler) ---------- */
export function EventsSection({ events }: { events: EventItem[] }) {
  const months = ["OCA","ŞUB","MAR","NIS","MAY","HAZ","TEM","AĞU","EYL","EKİ","KAS","ARA"];
  return (
    <section id="takvim" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead kicker="Takvim" title="Yaklaşan Etkinlikler" moreHref="/etkinlikler" moreLabel="Tüm takvim" />
        {events.length === 0 ? (
          <p className="text-slate">Yaklaşan etkinlik bulunmuyor.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((e) => {
              const d = new Date(e.date);
              return (
                <article key={e.id} className="bg-[#f9fafb] border border-line rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-eu leading-none">{d.getDate()}</div>
                      <div className="text-xs text-slate">{months[d.getMonth()]}</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-[15px] text-ink leading-snug">{e.title}</h3>
                  <p className="text-xs text-slate mt-1">{e.location}</p>
                  {e.isPublic && (
                    <span className="inline-block mt-3 text-[10px] font-semibold tracking-wide text-eu bg-eu-pale px-2 py-1 rounded">
                      HERKESE AÇIK
                    </span>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Vitrin (öne çıkan projeler) ---------- */
export function FeaturedProjects({ projects, sectorNames }: {
  projects: Project[]; sectorNames: Record<string, string>;
}) {
  return (
    <section id="vitrin" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead kicker="Vitrin" title="Öne Çıkan Projeler" moreHref="/projeler" moreLabel="Tüm projeler" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((p) => (
            <article key={p.id} className="bg-[#f9fafb] border border-line rounded-xl p-6">
              <span className="inline-block text-xs font-semibold text-eu bg-eu-pale px-3 py-1.5 rounded-full mb-3">
                {sectorNames[p.sectorId] ?? p.sectorId}
              </span>
              <h3 className="font-bold text-[15px] text-ink leading-snug">{p.title}</h3>
              <p className="text-xs text-slate mt-2">{p.beneficiary} · {p.locations.join(", ")}</p>
              <Link href={`/projeler/${p.id}`} className="inline-block mt-3 text-eu font-semibold text-sm">
                Proje Detayı →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- İlanlar ---------- */
export function ListingsSection({ listings }: { listings: Listing[] }) {
  const groups: { type: Listing["type"]; title: string; icon: string }[] = [
    { type: "is", title: "İş İlanları", icon: "📋" },
    { type: "satinalma", title: "Satınalma", icon: "🛒" },
    { type: "ihale", title: "İhale", icon: "🏛" },
  ];
  return (
    <section id="ilanlar" className="py-20 bg-eu-pale">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead kicker="Açık İlanlar" title="İş, Satınalma ve İhale" />
        <div className="grid md:grid-cols-3 gap-6">
          {groups.map((g) => {
            const items = listings.filter((l) => l.type === g.type);
            return (
              <div key={g.type} className="bg-white border border-line rounded-xl p-6">
                <h3 className="font-bold text-ink mb-4">{g.icon} {g.title}</h3>
                <ul className="space-y-3">
                  {items.length === 0 && <li className="text-sm text-slate">İlan yok.</li>}
                  {items.map((l) => (
                    <li key={l.id} className="border-b border-line pb-3 last:border-0">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-ink">{l.title}</span>
                        {l.locked && <span title="Abonelik gerekli">🔒</span>}
                      </div>
                      <p className="text-xs text-slate mt-0.5">{l.organization}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Blog / Gündem yazıları ---------- */
export function BlogSection({ posts }: { posts: BlogPost[] }) {
  return (
    <section id="blog" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead kicker="Gündemi" title="AB - Türkiye Gündemi" moreHref="/gundem" moreLabel="Tüm haberler" />
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((b) => (
            <Link key={b.id} href={`/gundem/${b.slug}`} className="bg-[#f9fafb] border border-line rounded-xl overflow-hidden block hover:shadow-lg transition">
              <div className="p-6">
                <span className="text-xs font-semibold text-eu">{b.category}</span>
                <h3 className="font-bold text-[15px] mt-2 text-ink leading-snug">{b.title}</h3>
                <p className="text-sm text-slate mt-2 line-clamp-2">{b.excerpt}</p>
                <p className="text-xs text-mist mt-3">{b.readMinutes} dk okuma</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Dijital Araçlar ---------- */
const TOOLS = [
  { img: "gorunurluk-ciktilari", title: "Görünürlük Çıktıları", desc: "Antetli kağıt, raporlar ve sunum şablonları ile AB standartlarında görünürlük materyalleri hazırlayın." },
  { img: "etkinlik-yonetimi", title: "Etkinlik Yönetimi", desc: "Etkinlik takvimini yönetin, katılımcı listesini kaydedin ve RSVP takibi yapın." },
  { img: "e-dokuman-yonetimi", title: "E-Doküman Yönetimi", desc: "Proje belgelerinizi kategorize edin, erişim izinlerini tanımlayın ve indirmeleri takip edin." },
  { img: "proje-websitesi", title: "Proje Web Sitesi", desc: "Üç tasarım şablonundan birini seçin, proje verileriniz otomatik yüklensin, siteniz hemen aktif olsun." },
  { img: "bulten-gonderimi", title: "Bülten Gönderimi", desc: "Hedef kitlenizi filtreleyin, toplu e-posta gönderin ve okuma istatistiklerini görüntüleyin." },
  { img: "e-learning", title: "E-Learning", desc: "Eğitim materyallerini yönetin, katılımcı ilerlemesini takip edin ve sertifikalar verin." },
  { img: "paydas-iletisimi", title: "Paydaş İletişimi", desc: "Proje ekibinizi, uzmanlarınızı ve tedarikçilerinizi yönetin, roller ve yetkiler tanımlayın." },
  { img: "raporlama", title: "Raporlama", desc: "Proje portföyü, ilan analizi ve etkinlik istatistikleri raporlarını oluşturun ve dışa aktarın." },
];

export function ToolsSection() {
  return (
    <section id="araclar" className="py-20 bg-gradient-to-br from-eu-pale to-[#F5F0FF]">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead kicker="Araçlar" title="Projeleriniz için Hazır Çözümler" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS.map((t) => (
            <div key={t.img} className="bg-white border border-line rounded-xl overflow-hidden">
              <div
                className="w-full h-40 bg-cover bg-center"
                style={{ backgroundImage: `url('/images/homepage/tools/${t.img}.png')` }}
              />
              <div className="p-6">
                <h3 className="font-bold text-[15px] text-ink">{t.title}</h3>
                <p className="text-sm text-slate mt-2 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
export function Footer() {
  return (
    <footer className="bg-eu-deep text-white pt-16 pb-6">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
        <div>
          <p className="font-medium text-lg mb-4">
            eu<span className="font-normal">in</span>
            <span className="text-tr">turkiye</span>
            <span className="font-normal">.com</span>
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            Türkiye&apos;deki AB faaliyetleri ve çok-donörlü proje portföyü platformu, dijital araçlar seti.
          </p>
        </div>
        <FooterCol title="Platform" links={["Projeler", "Gündemi", "İş İlanları", "Etkinlikler", "Araçlar"]} />
        <FooterCol title="Hukuki" links={["Gizlilik Politikası", "Kullanım Koşulları", "KVKK", "İçerik Yayın Onayı"]} />
        <FooterCol title="Bağlantılar" links={["Diğer Donör Projeleri", "AB Delegasyonu", "Destekler", "İletişim"]} />
      </div>
      <div className="border-t border-white/10 pt-6 text-center text-xs text-white/60">
        © 2026 euinturkiye.com · Bir Design for Good LLC projesidir.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-bold text-sm mb-4">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l}><a href="#" className="text-sm text-white/70 hover:text-white">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}
