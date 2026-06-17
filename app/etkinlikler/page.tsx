"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import type { EventItem } from "@/lib/types";

export default function EtkinliklerPage() {
  const { t, locale } = useLocale();
  const [events, setEvents] = useState<EventItem[]>([]);

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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("events_title") }]} />
        <h1 className="text-3xl font-extrabold text-ink mb-8">{t("events_title")}</h1>

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
