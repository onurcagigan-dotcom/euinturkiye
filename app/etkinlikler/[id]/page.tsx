"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import type { EventItem, Project } from "@/lib/types";

export default function EtkinlikDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useLocale();
  const [event, setEvent] = useState<EventItem | null | undefined>(undefined);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const db = getDataProvider();
    db.getEvent(id).then(async (e) => {
      setEvent(e);
      if (e?.projectId) setProject(await db.getProject(e.projectId));
    });
  }, [id]);

  if (event === undefined) {
    return <PageShell><div className="max-w-3xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }

  if (event === null) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-ink mb-2">{t("notfound_title")}</h1>
          <Link href="/etkinlikler" className="text-eu hover:underline">{t("event_all_back")}</Link>
        </div>
      </PageShell>
    );
  }

  const d = new Date(event.date);
  const isPast = d < new Date();
  const dateLocale = locale === "tr" ? "tr" : "en";

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: t("breadcrumb_home"), href: "/" },
          { label: t("events_title"), href: "/etkinlikler" },
          { label: event.title },
        ]} />

        <div className="flex items-start gap-5">
          <div className="flex-shrink-0 text-center bg-eu-pale rounded-2xl p-4 w-20">
            <div className="text-3xl font-extrabold text-eu">{d.getDate()}</div>
            <div className="text-sm text-eu font-semibold uppercase">
              {d.toLocaleDateString(dateLocale, { month: "short" })}
            </div>
            <div className="text-xs text-mist">{d.getFullYear()}</div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              {event.isPublic ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{t("event_public")}</span>
              ) : (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">{t("event_invite")}</span>
              )}
              {isPast && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t("event_completed")}</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-ink leading-tight">{event.title}</h1>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface rounded-2xl p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-mist font-semibold">{t("event_date")}</p>
            <p className="text-ink font-medium mt-0.5 text-sm">
              {d.toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}
              {" — "}
              {d.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-mist font-semibold">{t("event_location")}</p>
            <p className="text-ink font-medium mt-0.5 text-sm">📍 {event.location}</p>
          </div>
          {event.capacity && (
            <div>
              <p className="text-xs uppercase tracking-wide text-mist font-semibold">{t("event_capacity")}</p>
              <p className="text-ink font-medium mt-0.5 text-sm">👥 {event.capacity}</p>
            </div>
          )}
        </div>

        {project && (
          <div className="mt-4 p-3 bg-eu-pale rounded-lg text-sm">
            <span className="text-mist">{t("listing_related_project")}: </span>
            <Link href={`/projeler/${project.id}`} className="text-eu font-semibold hover:underline">
              {project.title}
            </Link>
          </div>
        )}

        {event.description && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-ink mb-3">{t("event_about")}</h2>
            <p className="text-slate leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {event.agenda && event.agenda.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink mb-4">{t("event_agenda")}</h2>
            <div className="space-y-3">
              {event.agenda.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-white border border-line rounded-xl">
                  <div className="flex-shrink-0 w-16 text-center">
                    <span className="text-sm font-bold text-eu">{item.time}</span>
                    <p className="text-xs text-mist">{item.durationMin} dk</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink text-sm">{item.title}</p>
                    {item.presenter && <p className="text-xs text-mist mt-0.5">{item.presenter}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isPast && event.isPublic && (
          <div className="mt-10 bg-eu-pale border border-eu/20 rounded-xl p-6 text-center">
            <h3 className="font-bold text-ink text-lg mb-2">{t("event_join_title")}</h3>
            <p className="text-slate text-sm mb-4">
              {t("event_join_sub")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/giris" className="px-5 py-2.5 bg-eu text-white font-semibold text-sm rounded-lg hover:bg-blue-800 transition-colors">
                {t("event_login_signup")}
              </Link>
              <Link href="/kayit" className="px-5 py-2.5 border border-eu text-eu font-semibold text-sm rounded-lg hover:bg-eu-pale transition-colors">
                {t("event_free_signup")}
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link href="/etkinlikler" className="text-eu text-sm hover:underline">← {t("event_all_back")}</Link>
        </div>
      </div>
    </PageShell>
  );
}
