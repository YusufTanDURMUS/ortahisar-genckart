import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ortahisar Gençkart SQLite Veritabanı Tohumlama Başlatılıyor...');

  // 1. Admin Kullanıcı
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ortahisar.bel.tr' },
    update: {},
    create: {
      role: 'ADMIN',
      email: 'admin@ortahisar.bel.tr',
      passwordHash: '$2a$10$yMCQcqvPiOD5YAYHy6cWc.omGq4aIqbvTZN2HjkzkHDZYcSdDKJBa', // admin123
      phoneNumber: '04620000000',
    },
  });

  // 2. Örnek Öğrenci Kullanıcısı
  const studentUser1 = await prisma.user.upsert({
    where: { email: 'yusuf@ogr.ktu.edu.tr' },
    update: {},
    create: {
      role: 'STUDENT',
      email: 'yusuf@ogr.ktu.edu.tr',
      phoneNumber: '05301111111',
      passwordHash: '$2a$10$yMCQcqvPiOD5YAYHy6cWc.omGq4aIqbvTZN2HjkzkHDZYcSdDKJBa', // admin123
    },
  });

  // Senaryo 2: Yaş Sınırını Aşmış (25 Yaş Üstü)
  const studentUser2 = await prisma.user.upsert({
    where: { email: 'yasli@ogr.ktu.edu.tr' },
    update: {},
    create: {
      role: 'STUDENT',
      email: 'yasli@ogr.ktu.edu.tr',
      phoneNumber: '05302222222',
      passwordHash: '$2a$10$yMCQcqvPiOD5YAYHy6cWc.omGq4aIqbvTZN2HjkzkHDZYcSdDKJBa', // admin123
    },
  });

  // Senaryo 3: Yaşı Tutmayan (15 Yaş Altı)
  const studentUser3 = await prisma.user.upsert({
    where: { email: 'kucuk@ogr.ktu.edu.tr' },
    update: {},
    create: {
      role: 'STUDENT',
      email: 'kucuk@ogr.ktu.edu.tr',
      phoneNumber: '05303333333',
      passwordHash: '$2a$10$yMCQcqvPiOD5YAYHy6cWc.omGq4aIqbvTZN2HjkzkHDZYcSdDKJBa', // admin123
    },
  });

  // Senaryo 4: Ortahisar İkametgahı Yok veya Öğrenci Değil
  const studentUser4 = await prisma.user.upsert({
    where: { email: 'ikametiyok@ogr.ktu.edu.tr' },
    update: {},
    create: {
      role: 'STUDENT',
      email: 'ikametiyok@ogr.ktu.edu.tr',
      phoneNumber: '05304444444',
      passwordHash: '$2a$10$yMCQcqvPiOD5YAYHy6cWc.omGq4aIqbvTZN2HjkzkHDZYcSdDKJBa', // admin123
    },
  });

  // Senaryo 5: Hem Yaşı Tutmuyor Hem İkameti/Öğrenciliği Yok
  const studentUser5 = await prisma.user.upsert({
    where: { email: 'hicbiri@ogr.ktu.edu.tr' },
    update: {},
    create: {
      role: 'STUDENT',
      email: 'hicbiri@ogr.ktu.edu.tr',
      phoneNumber: '05305555555',
      passwordHash: '$2a$10$yMCQcqvPiOD5YAYHy6cWc.omGq4aIqbvTZN2HjkzkHDZYcSdDKJBa', // admin123
    },
  });

  const studentProfile1 = await prisma.studentProfile.upsert({
    where: { tcKn: '11111111110' },
    update: {},
    create: {
      userId: studentUser1.id,
      tcKn: '11111111110',
      firstName: 'Yusuf Tan',
      lastName: 'Durmuş',
      birthYear: 2004,
      schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
      district: 'Ortahisar',
      isEligible: true,
      statusReason: 'ACTIVE',
      edevletRefCode: 'EDEVLET-REF-61001',
    },
  });

  const studentProfile2 = await prisma.studentProfile.upsert({
    where: { tcKn: '22222222220' },
    update: {},
    create: {
      userId: studentUser2.id,
      tcKn: '22222222220',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      birthYear: 1995,
      schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
      district: 'Ortahisar',
      isEligible: false,
      statusReason: 'AGE_LIMIT_EXCEEDED',
      revokedNote: 'Yaş sınırını aştınız. (Yaşınız: 31)',
    },
  });

  const studentProfile3 = await prisma.studentProfile.upsert({
    where: { tcKn: '33333333330' },
    update: {},
    create: {
      userId: studentUser3.id,
      tcKn: '33333333330',
      firstName: 'Ayşe',
      lastName: 'Kaya',
      birthYear: 2014,
      schoolName: 'Ortahisar Lisesi',
      district: 'Ortahisar',
      isEligible: false,
      statusReason: 'AGE_LIMIT_EXCEEDED',
      revokedNote: 'Yaş sınırını aştınız. (Yaşınız: 12)',
    },
  });

  const studentProfile4 = await prisma.studentProfile.upsert({
    where: { tcKn: '99111111110' },
    update: {},
    create: {
      userId: studentUser4.id,
      tcKn: '99111111110',
      firstName: 'Mehmet',
      lastName: 'Çelik',
      birthYear: 2005,
      schoolName: 'Belirtilmedi',
      district: 'Akçaabat',
      isEligible: false,
      statusReason: 'RESIDENCE_MISMATCH',
      revokedNote: 'Ortahisar Belediyesi Genç Kart sisteminde onaylı kaydınız bulunamadı.',
    },
  });

  const studentProfile5 = await prisma.studentProfile.upsert({
    where: { tcKn: '99222222220' },
    update: {},
    create: {
      userId: studentUser5.id,
      tcKn: '99222222220',
      firstName: 'Ali',
      lastName: 'Veli',
      birthYear: 1990,
      schoolName: 'Belirtilmedi',
      district: 'Araklı',
      isEligible: false,
      statusReason: 'AGE_LIMIT_EXCEEDED',
      revokedNote: 'Yaş sınırını aştınız. (Yaşınız: 36)',
    },
  });

  // 3. Örnek Esnaflar Listesi (Ortahisar / Trabzon yerel işletmeleri)
  const esnaflarData = [
    {
      businessName: 'Akbuz Kitabevi',
      category: 'Kırtasiye',
      address: 'Kalkınma Mah. Farabi Caddesi No:12 Ortahisar/Trabzon',
      taxNumber: '6100000001',
      defaultDiscountRate: 15.0,
      email: 'akbuz@gmail.com',
      phoneNumber: '04623250001',
      branches: [
        { title: 'Kalkınma Şubesi (Merkez)', address: 'Kalkınma Mah. Farabi Caddesi No:12 Ortahisar/Trabzon', isMain: true },
        { title: 'Meydan Şubesi', address: 'İskenderpaşa Mah. Uzun Sokak No:45 Ortahisar/Trabzon', isMain: false }
      ]
    },
    {
      businessName: 'KTÜ Kampüs Kafe',
      category: 'Kafe/Restoran',
      address: 'Üniversite Mah. KTÜ Kampüs İçi Ortahisar/Trabzon',
      taxNumber: '6100000002',
      defaultDiscountRate: 20.0,
      email: 'kampuskafe@gmail.com',
      phoneNumber: '04623250002',
      branches: [
        { title: 'Merkez Şube', address: 'Üniversite Mah. KTÜ Kampüs İçi Ortahisar/Trabzon', isMain: true }
      ]
    },
    {
      businessName: 'Trabzon Süpermarket',
      category: 'Market',
      address: 'Boztepe Mah. İran Caddesi No:5 Ortahisar/Trabzon',
      taxNumber: '6100000003',
      defaultDiscountRate: 10.0,
      email: 'supermarket@gmail.com',
      phoneNumber: '04623250003',
      branches: [
        { title: 'Boztepe Şubesi', address: 'Boztepe Mah. İran Caddesi No:5 Ortahisar/Trabzon', isMain: true },
        { title: 'Erdoğdu Şubesi', address: '2 Nolu Erdoğdu Mah. Çamlık Sokak No:12 Ortahisar/Trabzon', isMain: false }
      ]
    },
    {
      businessName: 'Genç Giyim Mağazası',
      category: 'Giyim',
      address: 'Kemerkaya Mah. Kunduracılar Caddesi No:22 Ortahisar/Trabzon',
      taxNumber: '6100000004',
      defaultDiscountRate: 25.0,
      email: 'gencgiyim@gmail.com',
      phoneNumber: '04623250004',
      branches: [
         { title: 'Merkez Şube', address: 'Kemerkaya Mah. Kunduracılar Caddesi No:22 Ortahisar/Trabzon', isMain: true },
         { title: 'Forum Şubesi', address: 'Kalkınma Mah. Forum Trabzon AVM Ortahisar/Trabzon', isMain: false }
      ]
    },
    {
      businessName: 'Teknoloji Dünyası',
      category: 'Teknoloji',
      address: 'Çarşı Mah. Kahramanmaraş Caddesi No:10 Ortahisar/Trabzon',
      taxNumber: '6100000005',
      defaultDiscountRate: 5.0,
      email: 'tekno@gmail.com',
      phoneNumber: '04623250005',
      branches: [
        { title: 'Merkez Şube', address: 'Çarşı Mah. Kahramanmaraş Caddesi No:10 Ortahisar/Trabzon', isMain: true }
      ]
    },
    {
      businessName: 'VIP Erkek Kuaförü',
      category: 'Kuaför/Berber',
      address: 'Pelitli Mah. Havaalanı Yolu No:3 Ortahisar/Trabzon',
      taxNumber: '6100000006',
      defaultDiscountRate: 15.0,
      email: 'vipkuafor@gmail.com',
      phoneNumber: '04623250006',
      branches: [
        { title: 'Merkez Şube', address: 'Pelitli Mah. Havaalanı Yolu No:3 Ortahisar/Trabzon', isMain: true }
      ]
    },
    {
      businessName: 'Adrenalin Spor Salonu',
      category: 'Spor/Eğlence',
      address: 'Yalıncak Mah. Rize Caddesi No:40 Ortahisar/Trabzon',
      taxNumber: '6100000007',
      defaultDiscountRate: 30.0,
      email: 'adrenalin@gmail.com',
      phoneNumber: '04623250007',
      branches: [
        { title: 'Merkez Şube', address: 'Yalıncak Mah. Rize Caddesi No:40 Ortahisar/Trabzon', isMain: true }
      ]
    },
    {
      businessName: 'Gül Kozmetik',
      category: 'Kozmetik',
      address: 'İskenderpaşa Mah. Gazipaşa Caddesi No:8 Ortahisar/Trabzon',
      taxNumber: '6100000008',
      defaultDiscountRate: 10.0,
      email: 'gulkozmetik@gmail.com',
      phoneNumber: '04623250008',
      branches: [
        { title: 'Merkez Şube', address: 'İskenderpaşa Mah. Gazipaşa Caddesi No:8 Ortahisar/Trabzon', isMain: true }
      ]
    },
    {
      businessName: 'Trabzon Copy Center',
      category: 'Diğer',
      address: 'Kalkınma Mah. Üniversite Caddesi No:4 Ortahisar/Trabzon',
      taxNumber: '6100000009',
      defaultDiscountRate: 10.0,
      email: 'copycenter@gmail.com',
      phoneNumber: '04623250009',
      branches: [
        { title: 'Merkez Şube', address: 'Kalkınma Mah. Üniversite Caddesi No:4 Ortahisar/Trabzon', isMain: true }
      ]
    }
  ];

  for (const item of esnaflarData) {
    const merchantUser = await prisma.user.upsert({
      where: { email: item.email },
      update: {},
      create: {
        role: 'MERCHANT',
        email: item.email,
        passwordHash: '$2a$10$4rXbrt.Azj5oQ3dBHTbshuJBSAJ8M.AQYnCbbmebj83xq3VjoYPTG', // esnaf123
        phoneNumber: item.phoneNumber,
      },
    });

    const merchantProfile = await prisma.merchantProfile.upsert({
      where: { userId: merchantUser.id },
      update: {},
      create: {
        userId: merchantUser.id,
        businessName: item.businessName,
        category: item.category,
        address: item.address,
        taxNumber: item.taxNumber,
        defaultDiscountRate: item.defaultDiscountRate,
      },
    });

    // İndirim Değişiklik Talebi (Yeni MerchantRequest yapısı)
    await prisma.merchantRequest.create({
      data: {
        merchantId: merchantProfile.id,
        type: 'DISCOUNT',
        status: 'PENDING',
        payload: JSON.stringify({ newDiscount: item.defaultDiscountRate + 5.0 }),
      },
    });

    // Şubeleri ekleyelim
    for (const branch of item.branches) {
      await prisma.storeLocation.create({
        data: {
          merchantId: merchantProfile.id,
          title: branch.title,
          address: branch.address,
          isMain: branch.isMain,
        },
      });
    }

    // Örnek İşlem Kaydı
    await prisma.transaction.create({
      data: {
        studentId: studentProfile1.id,
        merchantId: merchantProfile.id,
        originalAmount: 200.0,
        discountRate: item.defaultDiscountRate,
        discountedAmount: 200.0 * (1 - item.defaultDiscountRate / 100),
        savedAmount: 200.0 * (item.defaultDiscountRate / 100),
        integrationType: 'KEYBOARD_WEDGE',
        verificationCode: `GK-CONFIRM-${Math.floor(100000 + Math.random() * 900000)}`,
      },
    });
  }

  console.log('✅ Ortahisar Gençkart SQLite Veritabanı Tohumlama Tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
