"use client";
import { getProjectProgress } from "@/lib/project-progress";
import type { Project } from "@/lib/types";

interface Props {
  project: Project;
  /** "compact" kart içinde küçük gösterim, "full" detay sayfasında büyük gösterim */
  variant?: "compact" | "full";
  labels: {
    notStarted: string;
    completed: string;
    daysRemaining: string;
    needsUpdate: string;
  };
}

export function ProjectProgressBar({ project, variant = "compact", labels }: Props) {
  const progress = getProjectProgress(project);

  const barColor = project.status === "tamamlandi"
    ? "#94A3B8"
    : progress.overdue
      ? "#CA8A04"
      : "#16A34A";

  if (variant === "compact") {
    return (
      <div className="mt-2">
        <div className="h-1.5 bg-line rounded-full overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${progress.percent}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-mist font-semibold">
          {project.status === "tamamlandi" ? labels.completed : `${progress.percent}%`}
        </span>
        {progress.overdue && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-yellow-100 text-yellow-700">
            {labels.needsUpdate}
          </span>
        )}
        {!progress.overdue && progress.notStarted && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
            {labels.notStarted}
          </span>
        )}
        {!progress.overdue && !progress.notStarted && project.status === "devam" && progress.daysRemaining !== null && (
          <span className="text-xs text-mist">
            {progress.daysRemaining} {labels.daysRemaining}
          </span>
        )}
      </div>
      <div className="h-3 bg-line rounded-full overflow-hidden">
        <div
          className="h-3 rounded-full transition-all"
          style={{ width: `${progress.percent}%`, backgroundColor: barColor }}
        />
      </div>
      {project.startDate && project.endDate && (
        <div className="flex items-center justify-between mt-2 text-xs text-mist">
          <span>{new Date(project.startDate).toLocaleDateString("tr-TR")}</span>
          <span>{new Date(project.endDate).toLocaleDateString("tr-TR")}</span>
        </div>
      )}
    </div>
  );
}
