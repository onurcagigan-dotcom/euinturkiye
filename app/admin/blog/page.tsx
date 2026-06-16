"use client";

import { useAdmin } from "@/lib/admin/store";
import { PageHeader, Button, Table, EmptyState } from "@/components/admin/ui";

export default function AdminBlog() {
  const { blogPosts, deleteBlogPost } = useAdmin();
  const sorted = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <>
      <PageHeader title="Blog / Gündem" action={<Button href="/admin/blog/yeni">+ Yeni Yazı</Button>} />
      {sorted.length === 0 ? (
        <EmptyState text="Henüz yazı yok." />
      ) : (
        <Table head={["Başlık", "Kategori", "Tarih", ""]}>
          {sorted.map((b) => (
            <tr key={b.id} className="hover:bg-[#f9fafb]">
              <td className="px-4 py-3 font-medium text-ink">{b.title}</td>
              <td className="px-4 py-3 text-slate">{b.category}</td>
              <td className="px-4 py-3 text-slate">{b.publishedAt}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Button href={`/admin/blog/${b.id}`} variant="ghost">Düzenle</Button>{" "}
                <Button variant="danger" onClick={() => { if (confirm(`"${b.title}" silinsin mi?`)) deleteBlogPost(b.id); }}>Sil</Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
