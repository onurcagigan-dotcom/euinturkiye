"use client";

import { useAdmin } from "@/lib/admin/store";
import { PageHeader, Button, Table, EmptyState } from "@/components/admin/ui";

const TYPE_LABEL: Record<string, string> = { is: "İş", satinalma: "Satınalma", ihale: "İhale" };

export default function AdminListings() {
  const { listings, deleteListing } = useAdmin();

  return (
    <>
      <PageHeader title="İlanlar" action={<Button href="/admin/ilanlar/yeni">+ Yeni İlan</Button>} />
      {listings.length === 0 ? (
        <EmptyState text="Henüz ilan yok." />
      ) : (
        <Table head={["Başlık", "Tür", "Kurum", "Kilitli", ""]}>
          {listings.map((l) => (
            <tr key={l.id} className="hover:bg-[#f9fafb]">
              <td className="px-4 py-3 font-medium text-ink">{l.title}</td>
              <td className="px-4 py-3 text-slate">{TYPE_LABEL[l.type]}</td>
              <td className="px-4 py-3 text-slate">{l.organization}</td>
              <td className="px-4 py-3 text-slate">{l.locked ? "🔒" : "—"}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Button href={`/admin/ilanlar/${l.id}`} variant="ghost">Düzenle</Button>{" "}
                <Button variant="danger" onClick={() => { if (confirm(`"${l.title}" silinsin mi?`)) deleteListing(l.id); }}>Sil</Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
