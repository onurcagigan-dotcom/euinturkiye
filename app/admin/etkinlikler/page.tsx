"use client";

import { useAdmin } from "@/lib/admin/store";
import { PageHeader, Button, Table, EmptyState } from "@/components/admin/ui";

export default function AdminEvents() {
  const { events, deleteEvent } = useAdmin();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <PageHeader title="Etkinlikler" action={<Button href="/admin/etkinlikler/yeni">+ Yeni Etkinlik</Button>} />
      {sorted.length === 0 ? (
        <EmptyState text="Henüz etkinlik yok." />
      ) : (
        <Table head={["Başlık", "Tarih", "Konum", "Erişim", ""]}>
          {sorted.map((e) => (
            <tr key={e.id} className="hover:bg-[#f9fafb]">
              <td className="px-4 py-3 font-medium text-ink">{e.title}</td>
              <td className="px-4 py-3 text-slate">{e.date}</td>
              <td className="px-4 py-3 text-slate">{e.location}</td>
              <td className="px-4 py-3 text-slate">{e.isPublic ? "Herkese açık" : "Özel"}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Button href={`/admin/etkinlikler/${e.id}`} variant="ghost">Düzenle</Button>{" "}
                <Button variant="danger" onClick={() => { if (confirm(`"${e.title}" silinsin mi?`)) deleteEvent(e.id); }}>Sil</Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
