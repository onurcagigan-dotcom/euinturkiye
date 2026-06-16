import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections";

/** Public alt sayfalar için ortak çerçeve: Navbar + içerik + Footer */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-[60vh]">{children}</div>
      <Footer />
    </>
  );
}

/** Sayfa başlığı bandı */
export function PageBanner({ kicker, title, desc }: {
  kicker: string; title: string; desc?: string;
}) {
  return (
    <div className="bg-eu-deep text-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <p className="text-[#FFCC00] font-semibold tracking-widest text-xs uppercase">{kicker}</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-2">{title}</h1>
        {desc && <p className="text-white/80 mt-3 max-w-2xl">{desc}</p>}
      </div>
    </div>
  );
}
