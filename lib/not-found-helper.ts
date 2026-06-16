// notFound()'ı `never` dönüşüyle saran yardımcı.
// Next'in notFound() fonksiyonu zaten asla geri dönmez; bu sarmalayıcı
// TypeScript'e bunu açıkça bildirir (sandbox tip kontrolü için).
import { notFound } from "next/navigation";

export function notFoundNever(): never {
  notFound();
  // notFound() asla buraya ulaşmaz, ama tip güvenliği için:
  throw new Error("NEXT_NOT_FOUND");
}
