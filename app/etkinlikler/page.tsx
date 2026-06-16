import { getDataProvider } from "@/lib/data";
import { PageShell, PageBanner } from "@/components/PageShell";

const MONTHS = ["OCA","ŞUB","MAR","NIS","MAY","HAZ","TEM","AĞU","EYL","EKİ","KAS","ARA"];

export default async function EventsPage() {
  const db = getDataProvider();
  const events = await db.getEvents(); // tümü (geçmiş + gelecek)
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today);

  return (
    <PageShell>
      <PageBanner
        kicker="Takvim"
        title="Etkinlikler"
        desc="Projelere ait toplantı, çalıştay, fuar ve diğer etkinlikler."
      />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-lg font-bold text-ink mb-4">Yaklaşan Etkinlikler</h2>
        {upcoming.length === 0 ? (
          <p className="text-slate mb-10">Yaklaşan etkinlik bulunmuyor.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {upcoming.map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-ink mb-4">Geçmiş Etkinlikler</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
              {past.map((e) => <EventCard key={e.id} e={e} />)}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

function EventCard({ e }: { e: { id: string; title: string; date: string; location: string; isPublic: boolean } }) {
  const d = new Date(e.date);
  return (
    <article className="bg-white border border-line rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-center bg-eu-pale rounded-lg px-3 py-2">
          <div className="text-xl font-bold text-eu leading-none">{d.getDate()}</div>
          <div className="text-xs text-slate">{MONTHS[d.getMonth()]}</div>
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
}
