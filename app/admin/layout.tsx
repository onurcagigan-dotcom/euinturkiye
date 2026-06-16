// ============================================================
// Admin Layout — paneldeki tüm sayfaları sarar.
// Demo veriyi yükler, AdminProvider'a verir (tarayıcıda yönetilir).
//
// NOT (Faz 3): Buraya Firebase Auth kontrolü eklenecek.
// Giriş yapmamış kullanıcı /giris'e yönlendirilecek.
// Şimdilik panel doğrudan açılır.
// ============================================================

import { getDataProvider } from "@/lib/data";
import { AdminProvider } from "@/lib/admin/store";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = getDataProvider();
  const [projects, listings, events, blogPosts, sectors, donors] = await Promise.all([
    db.getProjects(),
    db.getListings(),
    db.getEvents(),
    db.getBlogPosts(),
    db.getSectors(),
    db.getDonors(),
  ]);

  return (
    <AdminGuard>
      <AdminProvider initial={{ projects, listings, events, blogPosts, sectors, donors }}>
        <div className="flex flex-col md:flex-row min-h-screen bg-[#f4f6fa]">
          <AdminSidebar />
          <main className="flex-1 p-5 md:p-8 max-w-5xl">{children}</main>
        </div>
      </AdminProvider>
    </AdminGuard>
  );
}
