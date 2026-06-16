"use client";

import { useState } from "react";
import Link from "next/link";
import { ProjectsMap } from "@/components/ProjectsMap";
import { projectProgress } from "@/lib/project-progress";
import type { Project, Sector, Donor } from "@/lib/types";

export function ProjectsView({
  projects, sectors, donors, lockedSector,
}: {
  projects: Project[]; sectors: Sector[]; donors: Donor[]; lockedSector?: string;
}) {
  const [view, setView] = useState<"liste" | "harita">("liste");
  const sectorName = (id: string) => sectors.find((s) => s.id === id)?.name ?? id;

  return (
    <div>
      {/* Görünüm geçişi */}
      <div className="flex gap-1 mb-6 bg-white border border-line rounded-lg p-1 w-fit">
        <button onClick={() => setView("liste")}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${view === "liste" ? "bg-eu text-white" : "text-slate hover:bg-line/40"}`}>
          Liste
        </button>
        <button onClick={() => setView("harita")}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${view === "harita" ? "bg-eu text-white" : "text-slate hover:bg-line/40"}`}>
          Harita
        </button>
      </div>

      {view === "harita" ? (
        <ProjectsMap projects={projects} sectors={sectors} donors={donors} embedded lockedSector={lockedSector} />
      ) : projects.length === 0 ? (
        <p className="text-slate py-12 text-center">Bu sektörde proje bulunamadı.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link key={p.id} href={`/projeler/${p.id}`}
              className="bg-white border border-line rounded-xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition block">
              <span className="inline-block text-xs font-semibold text-eu bg-eu-pale px-3 py-1.5 rounded-full mb-3">
                {sectorName(p.sectorId)}
              </span>
              <h3 className="font-bold text-[15px] text-ink leading-snug">{p.title}</h3>
              <p className="text-sm text-slate mt-2 line-clamp-2">{p.summary}</p>
              <p className="text-xs text-mist mt-3">{p.beneficiary} · {p.locations.join(", ")}</p>
              {(() => {
                const prog = projectProgress(p);
                return (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate">{prog.label}</span>
                      <span className="font-semibold text-eu">%{prog.percent}</span>
                    </div>
                    <div className="w-full bg-eu-pale rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${prog.percent >= 100 ? "bg-green-500" : "bg-eu"}`} style={{ width: `${prog.percent}%` }} />
                    </div>
                  </div>
                );
              })()}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
