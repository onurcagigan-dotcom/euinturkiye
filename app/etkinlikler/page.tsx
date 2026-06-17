"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import type { EventItem } from "@/lib/types";

type ViewMode = "liste" | "takvim";

export default function EtkinliklerPage() {
  const { t, locale } = useLocale();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [view, setView] = useState<ViewMode>("liste");

  useEffect(() => {
    getDataProvider().getEvents().then(setEvents);
  }, []);

  const publicEvents = events
    .filter((e) => e.isPublic)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const now = new Date();
  const upcoming = publicEvents.filter((e) => new Date(e.date) >= now);
  const past = publicEvents.filter((e) => new Date(e.date) < now);

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("events_title") }]} />

        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <h1 className="text-3xl font-extrabold text-ink">{t("events_title")}</h1>
          <div className="flex items-center rounded-full border border-line overflow-hidden">
            <button onClick={() => setView("liste")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${view === "liste" ? "bg-eu text-white" : "text-slate hover:bg-surface"}`}>
              {locale === "tr" ? "Liste" : "List"}
            </button>
            <button onClick={() => setView("takvim")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${view === "takvim" ? "bg-eu text-white" : "text-slate hover:bg-surface"}`}>
              {locale === "tr" ? "Takvim" : "Calendar"}
            </button>
          </div>
        </div>

        {view === "takvim" ? (
          <CalendarView events={publicEvents} locale={locale} />
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mb-12">
                <h2 className="text-lg font-bold text-ink mb-4">{t("events_upcoming")}</h2>
                <div className="space-y-4">
                  {upcoming.map((e) => <EventCard key={e.id} event={e} locale={locale} />)}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-ink mb-4 text-mist">{t("events_past")}</h2>
                <div className="space-y-3 opacity-70">
                  {past.map((e) => <EventCard key={e.id} event={e} past locale={locale} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}

function EventCard({ event, past = false, locale }: { event: EventItem; past?: boolean; locale: string }) {
  const d = new Date(event.date);
  return (
    <Link href={`/etkinlikler/${event.id}`}
      className={`flex gap-4 p-5 border rounded-xl hover:shadow-md transition-all ${past ? "border-line bg-surface" : "border-line bg-white hover:border-eu"}`}>
      <div className="flex-shrink-0 text-center bg-eu-pale rounded-xl p-3 w-16">
        <div className="text-2xl font-extrabold text-eu">{d.getDate()}</div>
        <div className="text-xs text-eu font-semibold uppercase">
          {d.toLocaleDateString(locale === "tr" ? "tr" : "en", { month: "short" })}
        </div>
        <div className="text-xs text-mist">{d.getFullYear()}</div>
      </div>
      <div className="flex-1">
        <h2 className="font-bold text-ink mb-1 leading-tight">{event.title}</h2>
        <p className="text-sm text-mist">📍 {event.location}</p>
        {event.description && (
          <p className="text-sm text-slate mt-1 line-clamp-2">{event.description}</p>
        )}
        {event.capacity && (
          <p className="text-xs text-mist mt-1">👥 {event.capacity}</p>
        )}
      </div>
    </Link>
  );
}

function CalendarView({ events, locale }: { events: EventItem[]; locale: string }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const dateLocale = locale === "tr" ? "tr" : "en";

  const eventsByDay = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    events.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  // Pazartesi başlangıçlı hafta düzeni
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // 0=Pazartesi
  const daysInMonth = lastDayOfMonth.getDate();

  const cells: ({ day: number; key: string } | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: `${year}-${month}-${d}` });
  while (cells.length % 7 !== 0) cells.push(null);

  const weekDayLabels = locale === "tr"
    ? ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      {/* Ay navigasyonu */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="p-2 rounded-lg hover:bg-surface text-slate">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-ink">
          {cursor.toLocaleDateString(dateLocale, { month: "long", year: "numeric" })}
        </h2>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="p-2 rounded-lg hover:bg-surface text-slate">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Bugüne dön butonu */}
      <div className="mb-3">
        <button onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
          className="text-xs text-eu font-semibold hover:underline">
          {locale === "tr" ? "Bugün" : "Today"}
        </button>
      </div>

      {/* Hafta günleri başlığı */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDayLabels.map((w) => (
          <div key={w} className="text-center text-xs font-semibold text-mist py-2">{w}</div>
        ))}
      </div>

      {/* Gün hücreleri */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="min-h-[88px] rounded-lg bg-surface/30" />;
          const dayEvents = eventsByDay[cell.key] ?? [];
          return (
            <div key={i}
              className={`min-h-[88px] rounded-lg border p-1.5 ${isToday(cell.day) ? "border-eu bg-eu-pale" : "border-line bg-white"}`}>
              <div className={`text-xs font-semibold mb-1 ${isToday(cell.day) ? "text-eu" : "text-slate"}`}>
                {cell.day}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <Link key={e.id} href={`/etkinlikler/${e.id}`}
                    className="block text-[10px] leading-tight bg-eu text-white rounded px-1 py-0.5 truncate hover:bg-blue-800 transition-colors"
                    title={e.title}>
                    {e.title}
                  </Link>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-mist px-1">+{dayEvents.length - 3} {locale === "tr" ? "daha" : "more"}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
