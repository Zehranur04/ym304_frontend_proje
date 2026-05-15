// Backend UnitType enum'una göre + butonu basıldığında eklenecek sabit "step" miktarları
// Birim seçili değilse veya basit (Evet/Hayır) takipte 1 kullanılır.
export const getStepForUnit = (unit) => {
  switch (parseInt(unit)) {
    case 1: return 1;     // Adet
    case 2: return 5;     // Sayfa
    case 3: return 0.25;  // Litre
    case 4: return 250;   // Mililitre  → +250ml
    case 5: return 1;     // Bardak
    case 6: return 1;     // Kilometre
    case 7: return 100;   // Metre
    case 8: return 5;     // Dakika
    case 9: return 0.5;   // Saat
    case 10: return 50;   // Kalori
    case 11: return 500;  // Adım       → +500 adım
    case 12: return 0.5;  // Kilogram
    case 13: return 100;  // Gram
    case 14: return 10;   // Para
    case 15: return 1;    // Bölüm
    case 16: return 1;    // Kere
    case 17: return 1;    // Gün
    default: return 1;
  }
};
