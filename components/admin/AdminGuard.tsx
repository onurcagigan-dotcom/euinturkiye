"use client";

// ============================================================
// AdminGuard — panel erişim koruması.
//
// Firebase auth AKTİF ve kullanıcı giriş yapmamışsa /giris'e yollar.
// Firebase YOKSA (demo modu) panel açık kalır — gösterim için.
// ============================================================

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, enabled } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (enabled && !loading && !user) {
      router.replace("/giris");
    }
  }, [enabled, loading, user, router]);

  // Auth aktifken yükleniyor ya da kullanıcı yoksa içeriği gösterme
  if (enabled && (loading || !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate text-sm">
        Yükleniyor…
      </div>
    );
  }

  return <>{children}</>;
}
