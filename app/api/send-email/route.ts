// ============================================================
// /api/send-email — Sunucu tarafı e-posta gönderimi.
//
// Bu route, e-posta servisini (Resend / SendGrid / SES) sunucu
// tarafında çağırır. API anahtarı .env.local'de tutulur,
// tarayıcıya asla sızmaz.
//
// CANLIYA ALMA:
//   1. Bir e-posta servisine kaydol (örn. resend.com).
//   2. .env.local'e EMAIL_API_KEY=... ekle.
//   3. Aşağıdaki TODO bloğunu servisin SDK'sıyla doldur.
//
// Servis ayarlı değilse 501 (Not Implemented) döner;
// araç bunu kullanıcıya "e-posta servisi henüz bağlı değil"
// olarak gösterir.
// ============================================================

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { recipients, subject, body } = await request.json();

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json({ error: "Alıcı listesi boş." }, { status: 400 });
  }

  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "E-posta servisi yapılandırılmamış (EMAIL_API_KEY eksik)." },
      { status: 501 }
    );
  }

  // TODO (canlıya alırken): e-posta servisi SDK'sı ile gönder.
  // Örnek (Resend):
  //   const { Resend } = await import("resend");
  //   const resend = new Resend(apiKey);
  //   await resend.emails.send({
  //     from: "bulten@euinturkiye.com",
  //     to: recipients,
  //     subject,
  //     text: body,
  //   });

  // Şimdilik servis SDK'sı eklenene kadar başarı simüle edilir:
  void subject; void body;
  return NextResponse.json({ delivered: recipients.length });
}
