import Link from "next/link";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-line sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-eu font-bold text-lg tracking-tight">EU in Türkiye</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/projeler" className="text-slate hover:text-eu transition-colors">Projeler</Link>
            <Link href="/ilanlar" className="text-slate hover:text-eu transition-colors">İlanlar</Link>
            <Link href="/etkinlikler" className="text-slate hover:text-eu transition-colors">Etkinlikler</Link>
            <Link href="/gundem" className="text-slate hover:text-eu transition-colors">AB-Türkiye Gündemi</Link>
            <Link href="/araclar" className="text-slate hover:text-eu transition-colors">Araçlar</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/giris" className="text-sm text-slate hover:text-eu">Giriş</Link>
            <Link href="/kayit" className="text-sm px-4 py-2 bg-eu text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-ink text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-lg mb-2">EU in Türkiye</div>
            <p className="text-mist text-sm leading-relaxed">
              Türkiye&apos;deki AB faaliyetleri ve çok-donörlü proje portföyü platformu, dijital araçlar seti.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-3 text-sm uppercase tracking-wide text-mist">Platform</div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/projeler" className="hover:text-white">Projeler</Link></li>
              <li><Link href="/ilanlar" className="hover:text-white">İlanlar</Link></li>
              <li><Link href="/etkinlikler" className="hover:text-white">Etkinlikler</Link></li>
              <li><Link href="/gundem" className="hover:text-white">Gündem</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3 text-sm uppercase tracking-wide text-mist">Araçlar</div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/araclar/etkinlik" className="hover:text-white">Etkinlik Yönetimi</Link></li>
              <li><Link href="/araclar/dokuman" className="hover:text-white">E-Doküman</Link></li>
              <li><Link href="/araclar/bulten" className="hover:text-white">Bülten</Link></li>
              <li><Link href="/araclar/paydas" className="hover:text-white">Paydaş İletişimi</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3 text-sm uppercase tracking-wide text-mist">Hesap</div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/kayit" className="hover:text-white">Kayıt Ol</Link></li>
              <li><Link href="/giris" className="hover:text-white">Giriş Yap</Link></li>
              <li><Link href="/admin" className="hover:text-white">Yönetim Paneli</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 py-4">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <span>© 2026 Design for Good LLC. Tüm hakları saklıdır.</span>
            <span>euinturkiye.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
