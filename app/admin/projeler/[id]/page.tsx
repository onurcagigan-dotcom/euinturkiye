"use client";

import { use } from "react";
import { useAdmin } from "@/lib/admin/store";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { projects } = useAdmin();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return <p className="text-slate">Proje bulunamadı.</p>;
  }
  return <ProjectForm existing={project} />;
}
