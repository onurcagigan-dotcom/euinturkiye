# Firebase Canlıya Geçiş Rehberi

Şu an platform **demo modunda** çalışıyor (tüm veri tarayıcı hafızasında, kalıcı değil).
Firebase bağlandığında panelden eklediğiniz içerik kalıcı oluyor ve public sitede görünüyor.

---

## Adım 1 — Firebase Projesi Oluşturun

1. https://console.firebase.google.com adresine gidin
2. **"Proje oluştur"** butonuna tıklayın
3. Proje adı: `euinturkiye` (ya da istediğiniz bir ad)
4. Google Analytics: isteğe bağlı, kapatabilirsiniz
5. **Oluştur** → Proje hazır

---

## Adım 2 — Firebase Config Değerlerini Alın

1. Firebase Console'da sol üstteki ⚙️ (dişli) → **Proje Ayarları**
2. **"Genel"** sekmesi → aşağı kaydırın → **"Uygulamalarınız"**
3. **"Web uygulaması ekle"** (</> simgesi) → uygulama adı yazın → **Kaydet**
4. Ekranda şu değerleri göreceksiniz:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "euinturkiye.firebaseapp.com",
  projectId: "euinturkiye",
  storageBucket: "euinturkiye.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Adım 3 — Firestore Veritabanı Açın

1. Sol menüde **"Firestore Database"** → **"Veritabanı oluştur"**
2. **"Test modunda başla"** seçin (güvenlik kurallarını sonra ekleyeceğiz)
3. Bölge: **"europe-west1"** (en yakın Avrupa)
4. **Etkinleştir**

---

## Adım 4 — Güvenlik Kuralları

1. Firestore → **"Kurallar"** sekmesi
2. `firestore.rules` dosyasının içeriğini buraya yapıştırın
3. **"Yayınla"** butonuna basın

---

## Adım 5 — Firebase Auth Açın

1. Sol menüde **"Authentication"** → **"Başlayın"**
2. **"E-posta/Şifre"** sağlayıcısını etkinleştirin
3. **"Kullanıcılar"** sekmesi → **"Kullanıcı ekle"**
4. Admin e-posta ve şifrenizi girin

---

## Adım 6 — Vercel'e Ortam Değişkenlerini Girin

Vercel Dashboard → Projenizi seçin → **Settings → Environment Variables**

Her birini tek tek ekleyin:

| Değişken | Değer |
|---------|-------|
| `NEXT_PUBLIC_DATA_SOURCE` | `firebase` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Adım 2'den |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Adım 2'den |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Adım 2'den |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Adım 2'den |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Adım 2'den |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Adım 2'den |

Tüm değişkenleri ekledikten sonra **Deployments → Redeploy** ile sitenizi yeniden yayınlayın.

---

## Adım 7 — Demo Veriyi Yükleyin (İsteğe Bağlı)

Eğer mevcut demo projelerin/etkinliklerin Firebase'e yüklenmesini istiyorsanız,
bize söyleyin — `scripts/seed.mjs` betiğini hazırlayabiliriz.

---

## Sonuç

Firebase bağlandıktan sonra:
- `/admin` panelinden proje/ilan/etkinlik/blog ekleyebilirsiniz
- Değişiklikler anlık olarak public sitede görünür
- `/giris` sayfasından gerçek e-posta/şifre ile giriş yapabilirsiniz
- Birden fazla admin kullanıcısı ekleyebilirsiniz
