import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { notFoundNever } from "@/lib/not-found-helper";

export const revalidate = 60;

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDataProvider();
  const [project, sectors, donors] = await Promise.all([
    db.getProject(id),
    db.getSectors(),
    db.getDonors(),
  ]);

  if (!project) notFoundNever();

  const sector = sectors.find((s) => s.id === project.sectorId);
  const donor = donors.find((d) => d.id === project.donorId);

  // Projeden haberler
  const allPosts = await db.getBlogPosts();
  const relatedPosts = allPosts.filter((p) => p.projectId === project.id).slice(0, 3);

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Projeler", href: "/projeler" },
          { label: project.title },
        ]} />

        {/* Başlık */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            project.status === "devam" ? "bg-green-100 text-green-700" :
            project.status === "tamamlandi" ? "bg-gray-100 text-gray-600" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            {project.status === "devam" ? "Devam Ediyor" : project.status === "tamamlandi" ? "Tamamlandı" : "Planlama"}
          </span>
          <span className="text-xs text-mist">{project.ipaPeriod}</span>
          {sector && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sector.color}20`, color: sector.color }}>
              {sector.name}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-ink leading-tight mb-4">{project.title}</h1>
        <p className="text-slate text-lg leading-relaxed mb-8">{project.summary}</p>

        {/* Künyesi */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface rounded-2xl p-6 mb-10">
          <Info label="Donör" value={donor?.name ?? project.donorId} />
          <Info label="Yararlanıcı" value={project.beneficiary} />
          {project.budget && <Info label="Bütçe" value={project.budget} />}
          {project.startDate && <Info label="Başlangıç" value={project.startDate} />}
          {project.endDate && <Info label="Bitiş" value={project.endDate} />}
          {project.locations.length > 0 && (
            <Info label="Uygulama Bölgesi" value={project.locations.join(", ")} />
          )}
        </div>

        {/* Proje amaç / çıktı / faaliyet */}
        {project.objective && (
          <Section title="Amaç ve Hedefler" content={project.objective} />
        )}
        {project.expectedOutputs && (
          <Section title="Beklenen Çıktılar" content={project.expectedOutputs} />
        )}
        {project.activities && (
          <Section title="Faaliyetler" content={project.activities} />
        )}

        {/* Projeden haberler */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-ink mb-5">Projeden Haberler</h2>
            <div className="space-y-3">
              {relatedPosts.map((post) => (
                <Link key={post.id} href={`/gundem/${post.slug}`}
                  className="flex items-start gap-4 p-4 border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                  <div className="flex-shrink-0 text-xs text-eu font-semibold bg-eu-pale px-2 py-1 rounded">
                    {post.category}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink text-sm">{post.title}</h3>
                    <p className="text-xs text-mist mt-1">{new Date(post.publishedAt).toLocaleDateString("tr")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bu projeyi siz mi yürüttünüz? */}
        <div className="mt-12 bg-eu-pale border border-eu/20 rounded-xl p-6 flex items-start gap-4">
          <div className="text-3xl">🏢</div>
          <div>
            <h3 className="font-bold text-ink mb-1">Bu projeyi siz mi yürüttünüz?</h3>
            <p className="text-slate text-sm mb-3">Portföyünüze eklemek ve ekibinizle paylaşmak için hesap açın.</p>
            <Link href="/kayit" className="inline-block px-4 py-2 bg-eu text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors">
              Kayıt Ol ve Talep Et
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-mist font-semibold">{label}</p>
      <p className="text-ink font-medium mt-0.5 text-sm">{value}</p>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-ink mb-3">{title}</h2>
      <p className="text-slate leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}
