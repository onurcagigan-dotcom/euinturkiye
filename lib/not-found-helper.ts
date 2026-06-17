import { notFound } from "next/navigation";

/** TypeScript'in notFound()'u never olarak tanımaması sorununu çözer */
export function notFoundNever(): never {
  notFound();
  // Aşağıdaki satır çalışmaz ama TypeScript'i memnun eder
  throw new Error("notFound");
}
