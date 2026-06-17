"use client";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";

export default function SorumlulukReddiPage() {
  const { t, locale } = useLocale();
  const isEn = locale === "en";

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("disclaimer_title") }]} />

        <h1 className="text-3xl font-extrabold text-ink mb-6">{t("disclaimer_title")}</h1>

        <div className="space-y-5 text-slate leading-relaxed">
          <p>
            {isEn
              ? "euinturkiye.com is an independent commercial platform developed and operated by Design for Good LLC."
              : "euinturkiye.com, Design for Good LLC tarafından geliştirilen ve işletilen bağımsız, ticari bir platformdur."}
          </p>
          <p>
            {isEn
              ? "This platform has no affiliation with, endorsement from, or formal relationship to the Delegation of the European Union to Türkiye, the European Union, or any EU institution. \"EU in Türkiye\" is used descriptively to refer to the subject matter of the platform's content, not as an official designation."
              : "Bu platform, Avrupa Birliği Türkiye Delegasyonu, Avrupa Birliği veya herhangi bir AB kurumu ile bağlantılı değildir, onlar tarafından desteklenmemektedir veya onlarla resmi bir ilişkisi bulunmamaktadır. \"EU in Türkiye\" ifadesi platformun içerik konusunu tanımlayıcı amaçla kullanılmaktadır, resmi bir unvan değildir."}
          </p>
          <p>
            {isEn
              ? "Similarly, this platform has no affiliation with, endorsement from, or formal relationship to any Turkish public institution, ministry, or government body referenced in project listings or content. References to public institutions are made solely for informational and descriptive purposes regarding publicly available project information."
              : "Aynı şekilde, bu platform proje listelerinde veya içeriklerde adı geçen herhangi bir Türk kamu kurumu, bakanlık veya devlet organı ile bağlantılı değildir, onlar tarafından desteklenmemektedir veya onlarla resmi bir ilişkisi bulunmamaktadır. Kamu kurumlarına yapılan atıflar, kamuya açık proje bilgileriyle ilgili olarak yalnızca bilgilendirme ve tanımlama amacıyla yapılmaktadır."}
          </p>
          <p>
            {isEn
              ? "Content on this platform — including project listings, news, and statistics — is compiled from publicly available sources and may include illustrative or demonstrative data. Users should independently verify any information before relying on it for decision-making."
              : "Bu platformdaki içerikler — proje listeleri, haberler ve istatistikler dahil — kamuya açık kaynaklardan derlenmektedir ve gösterim amaçlı örnek veriler içerebilir. Kullanıcılar, karar verme amacıyla kullanmadan önce her bilgiyi bağımsız olarak doğrulamalıdır."}
          </p>
          <p>
            {isEn
              ? "For questions about this disclaimer, please contact Design for Good LLC."
              : "Bu sorumluluk reddi hakkında sorularınız için Design for Good LLC ile iletişime geçebilirsiniz."}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
