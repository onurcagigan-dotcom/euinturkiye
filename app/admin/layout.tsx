"use client";
import { AdminProvider } from "@/lib/admin/store";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Genel Bakış", exact: true },
  { href: "/admin/projeler", label: "Projeler" },
  { href: "/admin/ilanlar", label: "İlanlar" },
  { href: "/admin/etkinlikler", label: "Etkinlikler" },
  { href: "/admin/blog", label: "Blog / Gündem" },
  { href: "/admin/konsorsiyum", label: "Konsorsiyum Talepleri" },
];

function AdminNav() {
  const path = usePathname();
  return (
    <aside className="w-52 flex-shrink-0 bg-ink text-white min-h-screen pt-6 pb-10 flex flex-col">
      <div className="px-5 mb-8">
        <Link href="/" className="text-white font-bold text-sm opacity-80 hover:opacity-100">← Siteye Dön</Link>
        <div className="text-white font-extrabold text-lg mt-3">Admin Paneli</div>
      </div>
      <nav className="flex-1">
        {NAV.map((n) => {
          const active = n.exact ? path === n.href : path.startsWith(n.href) && n.href !== "/admin";
          const isAdmin = path === "/admin" && n.href === "/admin";
          return (
            <Link key={n.href} href={n.href}
              className={`block px-5 py-3 text-sm font-medium transition-colors ${
                active || isAdmin ? "bg-eu text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 mt-6 text-xs text-gray-600">Demo Modu</div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-surface">
        <AdminNav />
        <main className="flex-1 overflow-x-auto">{children}</main>
      </div>
    </AdminProvider>
  );
}
