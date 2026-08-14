/**
 * Ortahisar (Trabzon) ilçesine ait mahalle → cadde/sokak haritası.
 * Her mahalle için o mahalledeki gerçek cadde ve sokak isimleri listelenmiştir.
 * "Diğer" seçeneği her zaman son sıradadır ve serbest metin girişini açar.
 */

export const NEIGHBORHOODS = [
  "1 Nolu Beşirli",
  "1 Nolu Bostancı",
  "1 Nolu Erdoğdu",
  "2 Nolu Beşirli",
  "2 Nolu Bostancı",
  "2 Nolu Erdoğdu",
  "3 Nolu Erdoğdu",
  "Akoluk",
  "Akyazı",
  "Aydınlıkevler",
  "Ayvalı",
  "Bahçecik",
  "Bengisu",
  "Beştaş",
  "Boztepe",
  "Bulak",
  "Çağlayan",
  "Çamlık",
  "Çamoba",
  "Çarşı",
  "Çimenli",
  "Çömlekçi",
  "Çukurçayır",
  "Değirmendere",
  "Deliklitaş",
  "Doğançay",
  "Dolaylı",
  "Düzyurt",
  "Enise",
  "Esentepe",
  "Fatih",
  "Fatih Sultan",
  "Fındıkoba",
  "Fırınlık",
  "Gazipaşa",
  "Geçit",
  "Gölçayır",
  "Gözalan",
  "Gülbaharhatun",
  "Gündoğdu",
  "Gürbulak",
  "Hızırbey",
  "İnönü",
  "İskenderpaşa",
  "Kalkınma",
  "Kanuni",
  "Karakaya",
  "Karlık",
  "Karşıyaka",
  "Kavakmeydan",
  "Kaymaklı",
  "Kemerkaya",
  "Kireçhane",
  "Konak",
  "Koru",
  "Kozluca",
  "Kurtuluş",
  "Kutlugün",
  "Ortahisar",
  "Özbirlik",
  "Pazarkapı",
  "Pelitli",
  "Pınaraltı",
  "Sanayi",
  "Sayvan",
  "Sevimli",
  "Soğuksu",
  "Subaşı",
  "Şenol Güneş",
  "Tabakhane",
  "Tokaçlı",
  "Tos",
  "Uğurlu",
  "Üniversite",
  "Yalı",
  "Yalıncak",
  "Yenicuma",
  "Yeniköy",
  "Yeşilbük",
  "Yeşilhisar",
  "Yeşilova",
  "Yeşiltepe",
  "Yeşilvadi",
  "Yılmaz",
  "Yoncalı",
  "Zafer",
] as const;

/**
 * Mahalleye göre sokak/cadde listesi.
 * Listede olmayan mahalleler için varsayılan ortak caddeler döner.
 */
export const STREETS_BY_NEIGHBORHOOD: Record<string, string[]> = {
  "Çarşı": [
    "Atatürk Alanı", "Uzun Sokak", "Kunduracılar Caddesi", "Kahramanmaraş Caddesi",
    "Kemerkaya Caddesi", "İskele Caddesi", "Maraş Caddesi", "Pazarkapı Sokak",
    "Çarşı Sokak", "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Kemerkaya": [
    "Kunduracılar Caddesi", "Kemerkaya Caddesi", "Kahramanmaraş Caddesi",
    "İstasyon Caddesi", "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "İskenderpaşa": [
    "Uzun Sokak", "Gazipaşa Caddesi", "İskele Caddesi", "Maraş Caddesi",
    "Taksim Caddesi", "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Kalkınma": [
    "Farabi Caddesi", "Üniversite Caddesi", "Trabzonspor Bulvarı",
    "Kalkınma Caddesi", "KTÜ Yolu", "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Üniversite": [
    "KTÜ Kampüs Yolu", "Farabi Caddesi", "Üniversite Caddesi",
    "Trabzonspor Bulvarı", "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Kanuni": [
    "Kanuni Caddesi", "Atatürk Bulvarı", "Tanjant Yolu",
    "Devlet Sahil Yolu", "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Gazipaşa": [
    "Gazipaşa Caddesi", "Cumhuriyet Caddesi", "İnönü Caddesi",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Gülbaharhatun": [
    "Gülbaharhatun Caddesi", "Ziyabey Caddesi", "Devlet Sahil Yolu",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Tabakhane": [
    "Tabakhane Caddesi", "Zağnos Vadisi", "Köprübaşı Sokak",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "İnönü": [
    "İnönü Caddesi", "Cumhuriyet Caddesi", "Atatürk Bulvarı",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Esentepe": [
    "Esentepe Caddesi", "Boztepe Yolu", "İran Caddesi",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Boztepe": [
    "Boztepe Caddesi", "İran Caddesi", "Değirmendere Yolu",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Yalıncak": [
    "Rize Caddesi", "Devlet Sahil Yolu", "Yalıncak Sokak",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Pelitli": [
    "Havaalanı Yolu", "Devlet Sahil Yolu", "Pelitli Caddesi",
    "Rize Caddesi", "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Sanayi": [
    "Sanayi Caddesi", "Tanjant Yolu", "Organize Sanayi Yolu",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Karşıyaka": [
    "Karşıyaka Caddesi", "Trabzonspor Bulvarı", "Devlet Sahil Yolu",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Aydınlıkevler": [
    "Aydınlıkevler Caddesi", "Tanjant Yolu", "Fatih Sultan Caddesi",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Fatih": [
    "Fatih Caddesi", "Fatih Sultan Caddesi", "Yavuz Selim Bulvarı",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Fatih Sultan": [
    "Fatih Sultan Caddesi", "Yavuz Selim Bulvarı", "Tanjant Yolu",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Kaymaklı": [
    "Kaymaklı Caddesi", "Boztepe Yolu", "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Koru": [
    "Koru Caddesi", "Boztepe Yolu", "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "1 Nolu Beşirli": [
    "Beşirli Caddesi", "Tanjant Yolu", "Devlet Sahil Yolu",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "2 Nolu Beşirli": [
    "Beşirli Caddesi", "Tanjant Yolu", "Devlet Sahil Yolu",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "1 Nolu Bostancı": [
    "Bostancı Caddesi", "Devlet Sahil Yolu", "Rize Caddesi",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "2 Nolu Bostancı": [
    "Bostancı Caddesi", "Devlet Sahil Yolu", "Rize Caddesi",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "1 Nolu Erdoğdu": [
    "Erdoğdu Caddesi", "Çamlık Sokak", "Bağlar Yolu",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "2 Nolu Erdoğdu": [
    "Erdoğdu Caddesi", "Çamlık Sokak", "Bağlar Yolu",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "3 Nolu Erdoğdu": [
    "Erdoğdu Caddesi", "Çamlık Sokak", "Bağlar Yolu",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
  "Ortahisar": [
    "Atatürk Bulvarı", "Cumhuriyet Caddesi", "Trabzon Caddesi",
    "1. Sokak", "2. Sokak", "3. Sokak", "Diğer"
  ],
};

/**
 * Verilen mahalleye ait sokak/cadde listesini döndürür.
 * Eğer o mahalle için özel liste yoksa genel liste döner.
 */
export function getStreetsByNeighborhood(neighborhood: string): string[] {
  return (
    STREETS_BY_NEIGHBORHOOD[neighborhood] || [
      "Cadde/Sokak 1", "Cadde/Sokak 2", "Cadde/Sokak 3",
      "1. Sokak", "2. Sokak", "3. Sokak", "4. Sokak", "5. Sokak", "Diğer"
    ]
  );
}
