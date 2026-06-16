"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";

const NAV = [
  { href: "/admin", label: "Genel Bakış", exact: true },
  { href: "/admin/projeler", label: "Projeler" },
  { href: "/admin/ilanlar", label: "İlanlar" },
  { href: "/admin/etkinlikler", label: "Etkinlikler" },
  { href: "/admin/blog", label: "Blog / Gündem" },
  { href: "/admin/talepler", label: "Sahiplik Talepleri" },
  { href: "/admin/sektorler", label: "Sektörler" },
  { href: "/admin/donorler", label: "Donörler" },
];

export function AdminSidebar() {
  const path = usePathname();
  const { user, enabled, logout } = useAuth();

  return (
    <aside className="w-full md:w-60 shrink-0 bg-eu-deep text-white md:min-h-screen p-5">
      <Link href="/" className="font-medium text-lg block mb-4 md:mb-8">
        eu<span className="font-normal">in</span>
        <span className="text-tr">turkiye</span>
      </Link>

      <p className="text-[10px] uppercase tracking-widest text-white/50 mb-3 hidden md:block">Yönetim</p>
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {NAV.map((n) => {
          const active = n.exact ? path === n.href : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`block px-3 py-2 rounded-lg text-sm transition whitespace-nowrap ${
                active ? "bg-white/15 font-semibold" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 pt-5 border-t border-white/10 space-y-3 hidden md:block">
        <Link href="/" className="block text-sm text-white/70 hover:text-white">
          ← Siteyi görüntüle
        </Link>
        {enabled && user && (
          <div>
            <p className="text-xs text-white/50 mb-2 truncate">{user.email}</p>
            <button onClick={() => logout()} className="text-sm text-white/70 hover:text-white">
              Çıkış yap
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
