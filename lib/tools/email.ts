// ============================================================
// E-posta gönderimi.
//
// Demo modunda: gerçek e-posta gitmez, simüle edilir (başarılı sayılır).
// Canlıda: /api/send-email route'una POST atar; o route sunucu
//   tarafında e-posta servisini (örn. Resend, SendGrid) çağırır.
//
// E-posta servis anahtarı ASLA tarayıcıya konmaz; sunucuda kalır.
// ============================================================

import { isFirebaseConfigured } from "@/lib/firebase/init";

export interface SendResult {
  ok: boolean;
  delivered: number;
  simulated: boolean;   // demo modunda true
}

function liveEmail(): boolean {
  // Canlı e-posta yalnızca firebase modunda + servis ayarlıysa
  return (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "demo") === "firebase" && isFirebaseConfigured();
}

/** Toplu e-posta gönderir. Demo'da simüle, canlıda gerçek API. */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  body: string
): Promise<SendResult> {
  if (!liveEmail()) {
    // Demo: simülasyon — kısa bir gecikme ile başarılı say
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true, delivered: recipients.length, simulated: true };
  }

  // Canlı: sunucu route'una gönder
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipients, subject, body }),
    });
    const data = await res.json();
    return { ok: res.ok, delivered: data.delivered ?? 0, simulated: false };
  } catch {
    return { ok: false, delivered: 0, simulated: false };
  }
}
