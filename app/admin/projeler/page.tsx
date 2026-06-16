"use client";

import { useAdmin } from "@/lib/admin/store";
import { PageHeader, Button, Table, EmptyState } from "@/components/admin/ui";

export default function AdminProjects() {
  const { projects, sectors, deleteProject } = useAdmin();
  const sectorName = (id: string) => sectors.find((s) => s.id === id)?.name ?? id;

  return (
    <>
      <PageHeader
        title="Projeler"
        action={<Button href="/admin/projeler/yeni">+ Yeni Proje</Button>}
      />

      {projects.length === 0 ? (
        <EmptyState text="Henüz proje yok." />
      ) : (
        <Table head={["Başlık", "Sektör", "Durum", "Öne Çıkan", ""]}>
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-[#f9fafb]">
              <td className="px-4 py-3 font-medium text-ink">{p.title}</td>
              <td className="px-4 py-3 text-slate">{sectorName(p.sectorId)}</td>
              <td className="px-4 py-3">
                <span className="text-xs px-2 py-1 rounded bg-eu-pale text-eu">{p.status}</span>
              </td>
              <td className="px-4 py-3 text-slate">{p.featured ? "Evet" : "—"}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Button href={`/admin/projeler/${p.id}`} variant="ghost">Düzenle</Button>{" "}
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm(`"${p.title}" silinsin mi?`)) deleteProject(p.id);
                  }}
                >
                  Sil
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
