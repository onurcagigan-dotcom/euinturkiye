import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-eu-deep sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="font-medium text-[18px] text-white shrink-0">
          eu<span className="font-normal">in</span>
          <span className="text-tr">turkiye</span>
          <span className="font-normal">.com</span>
        </Link>

        <div className="hidden md:flex gap-7 text-sm text-white/90">
          <Link href="/projeler" className="hover:text-white">Projeler</Link>
          <Link href="/#gundem" className="hover:text-white">Gündem</Link>
          <Link href="/#takvim" className="hover:text-white">Takvim</Link>
          <Link href="/#araclar" className="hover:text-white">Araçlar</Link>
          <Link href="/#diger" className="hover:text-white">Diğer Donörler</Link>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="hidden sm:inline-flex px-3 py-2 rounded-lg border border-white/40 text-white text-xs">
            TR / EN
          </button>
          <Link href="/giris" className="text-white text-sm hover:text-white/80">Giriş</Link>
          <Link
            href="/kayit"
            className="px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold hover:bg-eu/90"
          >
            Kayıt Ol
          </Link>
        </div>
      </div>
    </nav>
  );
}
