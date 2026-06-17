// Demo verisine erişim kontrolü.
// Doğrulama yapılmadan site tamamen boş/iskelet görünür; doğrulama sonrası demo veri açılır.
// Gerçek SMS gönderimi henüz entegre değildir — arabirim hazır, kullanıcı kendi SMS sağlayıcısını
// (Twilio, Netgsm, vb.) bağladığında /api altında gerçek bir gönderim/kontrol uç noktası eklenmelidir.

const STORAGE_KEY = "eu_demo_verified";
const COOKIE_NAME = "eu_demo_verified";

export function isDemoVerified(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === "1") return true;
  } catch {
    // localStorage kullanılamıyorsa cookie'ye bak
  }
  if (typeof document !== "undefined") {
    return document.cookie.includes(`${COOKIE_NAME}=1`);
  }
  return false;
}

export function setDemoVerified(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // yoksay
  }
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_NAME}=${value ? "1" : "0"}; path=/; max-age=${value ? 2592000 : 0}`;
  }
}

/** 6 haneli sahte doğrulama kodu üretir (demo amaçlı — gerçek SMS gönderimi yok). */
export function generateDemoCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
