// ============================================================
// Türkiye il koordinatları — harita için.
//
// Değerler 1000x420 viewBox'a göre normalize edilmiş yaklaşık
// konumlardır (gerçek coğrafi projeksiyon değil, görsel temsil).
// Proje verisindeki il adlarıyla eşleşir.
// ============================================================

export interface CityPoint {
  name: string;
  x: number;
  y: number;
}

export const CITY_POINTS: Record<string, { x: number; y: number }> = {
  "İstanbul": { x: 195, y: 95 },
  "Ankara": { x: 430, y: 175 },
  "İzmir": { x: 120, y: 235 },
  "Bursa": { x: 230, y: 135 },
  "Antalya": { x: 320, y: 305 },
  "Adana": { x: 540, y: 290 },
  "Konya": { x: 400, y: 255 },
  "Gaziantep": { x: 615, y: 290 },
  "Şanlıurfa": { x: 680, y: 290 },
  "Diyarbakır": { x: 730, y: 265 },
  "Kayseri": { x: 530, y: 220 },
  "Mersin": { x: 490, y: 305 },
  "Hatay": { x: 575, y: 320 },
  "Samsun": { x: 560, y: 110 },
  "Trabzon": { x: 700, y: 120 },
  "Eskişehir": { x: 320, y: 175 },
  "Denizli": { x: 210, y: 270 },
  "Aydın": { x: 140, y: 270 },
  "Kocaeli": { x: 245, y: 110 },
  "Erzurum": { x: 765, y: 175 },
  "Van": { x: 845, y: 230 },
  "Malatya": { x: 640, y: 235 },
  "Sivas": { x: 575, y: 190 },
  "Manisa": { x: 155, y: 225 },
  "Balıkesir": { x: 175, y: 175 },
};

/** Bir il adının koordinatı (yoksa null) */
export function cityPoint(name: string): { x: number; y: number } | null {
  return CITY_POINTS[name] ?? null;
}
