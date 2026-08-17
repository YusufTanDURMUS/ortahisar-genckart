import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Trabzon Ortahisar Belediyesi Genç Kart Veritabanı Tohumlanıyor...');

  // Ortak Test Şifresi: "admin123"
  const defaultPasswordHash = await bcrypt.hash('admin123', 10);

  // ═══════════════════════════════════════════════════════════
  // 1. SİSTEM YÖNETİCİLERİ (ADMIN)
  // ═══════════════════════════════════════════════════════════
  const adminUsersData = [
    {
      email: 'admin@ortahisar.bel.tr',
      phoneNumber: '04623330001',
      role: 'ADMIN',
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'superadmin@ortahisar.bel.tr',
      phoneNumber: '04623330002',
      role: 'ADMIN',
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const admin of adminUsersData) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: admin.email }, { phoneNumber: admin.phoneNumber }],
      },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          email: admin.email,
          phoneNumber: admin.phoneNumber,
          role: 'ADMIN',
          passwordHash: admin.passwordHash,
        },
      });
    } else {
      await prisma.user.create({ data: admin });
    }
  }
  console.log('✅ Admin hesapları oluşturuldu (Şifre: admin123).');

  // ═══════════════════════════════════════════════════════════
  // 2. ÖĞRENCİ KULLANICILARI (GENÇ KART)
  // ═══════════════════════════════════════════════════════════
  const studentAccounts = [
    {
      email: 'yusuf@ogr.ktu.edu.tr',
      phoneNumber: '05301111111',
      passwordHash: defaultPasswordHash,
      profile: {
        tcKn: '11111111110',
        firstName: 'Yusuf Tan',
        lastName: 'Durmuş',
        birthYear: 2004,
        schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
        district: 'Ortahisar',
        isEligible: true,
        statusReason: 'ACTIVE',
        revokedNote: null,
        edevletRefCode: 'EDEVLET-REF-61001',
      },
    },
    {
      email: 'ahmet@ogr.ktu.edu.tr',
      phoneNumber: '05302222222',
      passwordHash: defaultPasswordHash,
      profile: {
        tcKn: '22222222220',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        birthYear: 1995,
        schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
        district: 'Ortahisar',
        isEligible: false,
        statusReason: 'AGE_LIMIT_EXCEEDED',
        revokedNote: 'Yaş sınırını aştınız. (25 yaş üstü)',
        edevletRefCode: 'EDEVLET-REF-61002',
      },
    },
    {
      email: 'ayse@ogr.ktu.edu.tr',
      phoneNumber: '05303333333',
      passwordHash: defaultPasswordHash,
      profile: {
        tcKn: '33333333330',
        firstName: 'Ayşe',
        lastName: 'Kaya',
        birthYear: 2014,
        schoolName: 'Ortahisar Ortaokulu',
        district: 'Ortahisar',
        isEligible: false,
        statusReason: 'AGE_LIMIT_EXCEEDED',
        revokedNote: '15 yaş altı öğrenciler için Genç Kart programı aktif değildir.',
        edevletRefCode: 'EDEVLET-REF-61003',
      },
    },
    {
      email: 'mehmet@ogr.ktu.edu.tr',
      phoneNumber: '05304444444',
      passwordHash: defaultPasswordHash,
      profile: {
        tcKn: '44444444440',
        firstName: 'Mehmet',
        lastName: 'Çelik',
        birthYear: 2003,
        schoolName: 'Avrasya Üniversitesi',
        district: 'Ortahisar',
        isEligible: true,
        statusReason: 'ACTIVE',
        revokedNote: null,
        edevletRefCode: 'EDEVLET-REF-61004',
      },
    },
    {
      email: 'zeynep@ogr.ktu.edu.tr',
      phoneNumber: '05305555555',
      passwordHash: defaultPasswordHash,
      profile: {
        tcKn: '55555555550',
        firstName: 'Zeynep',
        lastName: 'Demir',
        birthYear: 2002,
        schoolName: 'Trabzon Üniversitesi',
        district: 'Ortahisar',
        isEligible: true,
        statusReason: 'ACTIVE',
        revokedNote: null,
        edevletRefCode: 'EDEVLET-REF-61005',
      },
    },
    {
      email: 'mustafa@ogr.ktu.edu.tr',
      phoneNumber: '05306666666',
      passwordHash: defaultPasswordHash,
      profile: {
        tcKn: '66666666660',
        firstName: 'Mustafa',
        lastName: 'Şahin',
        birthYear: 2005,
        schoolName: 'Ortahisar Anadolu Lisesi',
        district: 'Ortahisar',
        isEligible: true,
        statusReason: 'ACTIVE',
        revokedNote: null,
        edevletRefCode: 'EDEVLET-REF-61006',
      },
    },
    {
      email: 'elif@ogr.ktu.edu.tr',
      phoneNumber: '05307777777',
      passwordHash: defaultPasswordHash,
      profile: {
        tcKn: '77777777770',
        firstName: 'Elif',
        lastName: 'Öztürk',
        birthYear: 2001,
        schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
        district: 'Ortahisar',
        isEligible: true,
        statusReason: 'ACTIVE',
        revokedNote: null,
        edevletRefCode: 'EDEVLET-REF-61007',
      },
    },
    {
      email: 'can@ogr.ktu.edu.tr',
      phoneNumber: '05308888888',
      passwordHash: defaultPasswordHash,
      profile: {
        tcKn: '88888888880',
        firstName: 'Can',
        lastName: 'Yıldız',
        birthYear: 2003,
        schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
        district: 'Ortahisar',
        isEligible: true,
        statusReason: 'ACTIVE',
        revokedNote: null,
        edevletRefCode: 'EDEVLET-REF-61008',
      },
    },
    {
      email: 'merve@ogr.ktu.edu.tr',
      phoneNumber: '05309999999',
      passwordHash: defaultPasswordHash,
      profile: {
        tcKn: '99999999990',
        firstName: 'Merve',
        lastName: 'Aydın',
        birthYear: 2004,
        schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
        district: 'Ortahisar',
        isEligible: true,
        statusReason: 'ACTIVE',
        revokedNote: null,
        edevletRefCode: 'EDEVLET-REF-61009',
      },
    },
    {
      email: 'emre@ogr.ktu.edu.tr',
      phoneNumber: '05321234567',
      passwordHash: defaultPasswordHash,
      profile: {
        tcKn: '12345678901',
        firstName: 'Emre',
        lastName: 'Koç',
        birthYear: 2002,
        schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
        district: 'Ortahisar',
        isEligible: true,
        statusReason: 'ACTIVE',
        revokedNote: null,
        edevletRefCode: 'EDEVLET-REF-61010',
      },
    },
  ];

  const createdStudentProfiles: any[] = [];

  for (const acc of studentAccounts) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: acc.email },
          { phoneNumber: acc.phoneNumber },
          { studentProfile: { tcKn: acc.profile.tcKn } },
        ],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: acc.email,
          phoneNumber: acc.phoneNumber,
          passwordHash: acc.passwordHash,
          role: 'STUDENT',
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          role: 'STUDENT',
          email: acc.email,
          phoneNumber: acc.phoneNumber,
          passwordHash: acc.passwordHash,
        },
      });
    }

    let profile = await prisma.studentProfile.findFirst({
      where: {
        OR: [{ tcKn: acc.profile.tcKn }, { userId: user.id }],
      },
    });

    if (profile) {
      profile = await prisma.studentProfile.update({
        where: { id: profile.id },
        data: {
          userId: user.id,
          tcKn: acc.profile.tcKn,
          firstName: acc.profile.firstName,
          lastName: acc.profile.lastName,
          birthYear: acc.profile.birthYear,
          schoolName: acc.profile.schoolName,
          district: acc.profile.district,
          isEligible: acc.profile.isEligible,
          statusReason: acc.profile.statusReason,
          revokedNote: acc.profile.revokedNote,
        },
      });
    } else {
      profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          ...acc.profile,
        },
      });
    }

    createdStudentProfiles.push(profile);
  }
  console.log(`✅ ${createdStudentProfiles.length} Öğrenci profili oluşturuldu (Giriş: TC + admin123).`);

  // ═══════════════════════════════════════════════════════════
  // 3. ANLAŞMALI ESNAF HESAPLARI (İŞLETMELER)
  // ═══════════════════════════════════════════════════════════
  const merchantAccounts = [
    {
      email: 'esnaf@copycenter.com',
      phoneNumber: '04623210001',
      passwordHash: defaultPasswordHash,
      profile: {
        businessName: 'Trabzon Copy Center & Kırtasiye',
        category: 'Kırtasiye',
        address: 'Gazipaşa Cad. No:14 Ortahisar/Trabzon',
        taxNumber: '6100000001',
        symbol: '📚',
        defaultDiscountRate: 20.0,
      },
      branches: [
        { title: 'Merkez Şube (Gazipaşa)', address: 'Gazipaşa Cad. No:14 Ortahisar', symbol: '⭐', isMain: true, latitude: 41.0027, longitude: 39.7285 },
        { title: 'KTÜ Kampüs Şubesi', address: 'KTÜ Kanuni Kampüsü Öğrenci Meydanı', symbol: '🎓', isMain: false, latitude: 40.9958, longitude: 39.7712 },
      ],
    },
    {
      email: 'esnaf@gulkozmetik.com',
      phoneNumber: '04623210002',
      passwordHash: defaultPasswordHash,
      profile: {
        businessName: 'Gül Kozmetik & Kişisel Bakım',
        category: 'Kozmetik',
        address: 'Kahramanmaraş Cad. No:28 Ortahisar/Trabzon',
        taxNumber: '6100000002',
        symbol: '💄',
        defaultDiscountRate: 15.0,
      },
      branches: [
        { title: 'Maraş Caddesi Merkez', address: 'Kahramanmaraş Cad. No:28 Ortahisar', symbol: '⭐', isMain: true, latitude: 41.0035, longitude: 39.726 },
      ],
    },
    {
      email: 'esnaf@adrenalin.com',
      phoneNumber: '04623210003',
      passwordHash: defaultPasswordHash,
      profile: {
        businessName: 'Adrenalin Dünyası & Spor Salonu',
        category: 'Spor/Eğlence',
        address: 'Kunduracılar Cad. No:5 Ortahisar/Trabzon',
        taxNumber: '6100000003',
        symbol: '🏋️',
        defaultDiscountRate: 25.0,
      },
      branches: [
        { title: 'Kunduracılar Şubesi', address: 'Kunduracılar Cad. No:5 Ortahisar', symbol: '⭐', isMain: true, latitude: 41.0048, longitude: 39.7278 },
        { title: 'Meydan Fitness Center', address: 'Meydan Parkı Arkası No:12 Ortahisar', symbol: '📍', isMain: false, latitude: 41.006, longitude: 39.729 },
      ],
    },
    {
      email: 'esnaf@boztepekitap.com',
      phoneNumber: '04623210004',
      passwordHash: defaultPasswordHash,
      profile: {
        businessName: 'Boztepe Kitabevi & Kafe',
        category: 'Kırtasiye',
        address: 'Kalkınma Mah. No:19 Ortahisar/Trabzon',
        taxNumber: '6100000004',
        symbol: '☕',
        defaultDiscountRate: 15.0,
      },
      branches: [
        { title: 'Kalkınma Şubesi (KTÜ Kapısı)', address: 'Kalkınma Mah. No:19 Ortahisar', symbol: '⭐', isMain: true, latitude: 40.9982, longitude: 39.765 },
      ],
    },
    {
      email: 'esnaf@karadenizkafe.com',
      phoneNumber: '04623210005',
      passwordHash: defaultPasswordHash,
      profile: {
        businessName: 'Karadeniz Kafe & Bistro',
        category: 'Kafe/Restoran',
        address: 'Uzun Sokak No:42 Ortahisar/Trabzon',
        taxNumber: '6100000005',
        symbol: '🍕',
        defaultDiscountRate: 10.0,
      },
      branches: [
        { title: 'Uzun Sokak Şube', address: 'Uzun Sokak No:42 Ortahisar', symbol: '⭐', isMain: true, latitude: 41.0041, longitude: 39.7295 },
      ],
    },
    {
      email: 'esnaf@ortahisartekno.com',
      phoneNumber: '04623210006',
      passwordHash: defaultPasswordHash,
      profile: {
        businessName: 'Ortahisar Teknoloji Market',
        category: 'Teknoloji',
        address: 'Atatürk Alanı Meydan No:8 Ortahisar/Trabzon',
        taxNumber: '6100000006',
        symbol: '💻',
        defaultDiscountRate: 12.0,
      },
      branches: [
        { title: 'Meydan Mağazası', address: 'Atatürk Alanı Meydan No:8 Ortahisar', symbol: '⭐', isMain: true, latitude: 41.0055, longitude: 39.7288 },
      ],
    },
    {
      email: 'esnaf@karizmaberber.com',
      phoneNumber: '04623210007',
      passwordHash: defaultPasswordHash,
      profile: {
        businessName: 'Karizma Erkek Kuaförü & Berber',
        category: 'Kuaför/Berber',
        address: 'Çömlekçi Mah. No:3 Ortahisar/Trabzon',
        taxNumber: '6100000007',
        symbol: '✂️',
        defaultDiscountRate: 30.0,
      },
      branches: [
        { title: 'Çömlekçi Salonu', address: 'Çömlekçi Mah. No:3 Ortahisar', symbol: '⭐', isMain: true, latitude: 41.007, longitude: 39.734 },
      ],
    },
    {
      email: 'esnaf@trendgiyim.com',
      phoneNumber: '04623210008',
      passwordHash: defaultPasswordHash,
      profile: {
        businessName: 'Trend Giyim Butik',
        category: 'Giyim',
        address: 'Kemerkaya Mah. No:11 Ortahisar/Trabzon',
        taxNumber: '6100000008',
        symbol: '👗',
        defaultDiscountRate: 18.0,
      },
      branches: [
        { title: 'Kemerkaya Butik', address: 'Kemerkaya Mah. No:11 Ortahisar', symbol: '⭐', isMain: true, latitude: 41.005, longitude: 39.731 },
      ],
    },
  ];

  const createdMerchants: any[] = [];

  for (const m of merchantAccounts) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: m.email }, { phoneNumber: m.phoneNumber }],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: m.email,
          phoneNumber: m.phoneNumber,
          passwordHash: m.passwordHash,
          role: 'MERCHANT',
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          role: 'MERCHANT',
          email: m.email,
          phoneNumber: m.phoneNumber,
          passwordHash: m.passwordHash,
        },
      });
    }

    let merchantProfile = await prisma.merchantProfile.findFirst({
      where: {
        OR: [{ userId: user.id }, { taxNumber: m.profile.taxNumber }],
      },
    });

    if (merchantProfile) {
      merchantProfile = await prisma.merchantProfile.update({
        where: { id: merchantProfile.id },
        data: {
          userId: user.id,
          businessName: m.profile.businessName,
          category: m.profile.category,
          address: m.profile.address,
          taxNumber: m.profile.taxNumber,
          symbol: m.profile.symbol,
          defaultDiscountRate: m.profile.defaultDiscountRate,
        },
      });
    } else {
      merchantProfile = await prisma.merchantProfile.create({
        data: {
          userId: user.id,
          ...m.profile,
        },
      });
    }

    // Şubeleri ekle
    for (const b of m.branches) {
      const existingBranch = await prisma.storeLocation.findFirst({
        where: { merchantId: merchantProfile.id, title: b.title },
      });

      if (!existingBranch) {
        await prisma.storeLocation.create({
          data: {
            merchantId: merchantProfile.id,
            title: b.title,
            address: b.address,
            symbol: b.symbol,
            isMain: b.isMain,
            latitude: b.latitude,
            longitude: b.longitude,
          },
        });
      } else {
        await prisma.storeLocation.update({
          where: { id: existingBranch.id },
          data: {
            symbol: b.symbol,
            address: b.address,
            isMain: b.isMain,
          },
        });
      }
    }

    createdMerchants.push(merchantProfile);
  }
  console.log(`✅ ${createdMerchants.length} Anlaşmalı esnaf işletmesi ve şubeleri oluşturuldu (Giriş: E-posta + admin123).`);

  // ═══════════════════════════════════════════════════════════
  // 4. ÖRNEK İŞLEMLER (TRANSACTIONS)
  // ═══════════════════════════════════════════════════════════
  if (createdStudentProfiles.length > 0 && createdMerchants.length > 0) {
    const s1 = createdStudentProfiles[0];
    const s2 = createdStudentProfiles[1] || s1;
    const s3 = createdStudentProfiles[2] || s1;

    const sampleTransactions = [
      {
        studentId: s1.id,
        merchantId: createdMerchants[0].id, // Copy Center
        originalAmount: 350.0,
        discountRate: 20.0,
        discountedAmount: 280.0,
        savedAmount: 70.0,
        integrationType: 'PWA_SCAN',
        verificationCode: 'ORT-TX-9001',
        status: 'COMPLETED',
      },
      {
        studentId: s2.id,
        merchantId: createdMerchants[0].id, // Copy Center
        originalAmount: 180.0,
        discountRate: 20.0,
        discountedAmount: 144.0,
        savedAmount: 36.0,
        integrationType: 'PWA_SCAN',
        verificationCode: 'ORT-TX-9002',
        status: 'COMPLETED',
      },
      {
        studentId: s1.id,
        merchantId: createdMerchants[1].id, // Gül Kozmetik
        originalAmount: 520.0,
        discountRate: 15.0,
        discountedAmount: 442.0,
        savedAmount: 78.0,
        integrationType: 'KEYBOARD_WEDGE',
        verificationCode: 'ORT-TX-9003',
        status: 'COMPLETED',
      },
      {
        studentId: s3.id,
        merchantId: createdMerchants[2].id, // Adrenalin Dünyası
        originalAmount: 1200.0,
        discountRate: 25.0,
        discountedAmount: 900.0,
        savedAmount: 300.0,
        integrationType: 'PWA_SCAN',
        verificationCode: 'ORT-TX-9004',
        status: 'COMPLETED',
      },
      {
        studentId: s1.id,
        merchantId: createdMerchants[3].id, // Boztepe Kitap
        originalAmount: 420.0,
        discountRate: 15.0,
        discountedAmount: 357.0,
        savedAmount: 63.0,
        integrationType: 'PWA_SCAN',
        verificationCode: 'ORT-TX-9005',
        status: 'COMPLETED',
      },
      {
        studentId: s2.id,
        merchantId: createdMerchants[4].id, // Karadeniz Kafe
        originalAmount: 300.0,
        discountRate: 10.0,
        discountedAmount: 270.0,
        savedAmount: 30.0,
        integrationType: 'KEYBOARD_WEDGE',
        verificationCode: 'ORT-TX-9006',
        status: 'COMPLETED',
      },
      {
        studentId: s1.id,
        merchantId: createdMerchants[5].id, // Teknoloji Market
        originalAmount: 2400.0,
        discountRate: 12.0,
        discountedAmount: 2112.0,
        savedAmount: 288.0,
        integrationType: 'PWA_SCAN',
        verificationCode: 'ORT-TX-9007',
        status: 'COMPLETED',
      },
      {
        studentId: s3.id,
        merchantId: createdMerchants[6].id, // Karizma Berber
        originalAmount: 250.0,
        discountRate: 30.0,
        discountedAmount: 175.0,
        savedAmount: 75.0,
        integrationType: 'PWA_SCAN',
        verificationCode: 'ORT-TX-9008',
        status: 'COMPLETED',
      },
      {
        studentId: s2.id,
        merchantId: createdMerchants[7].id, // Trend Giyim
        originalAmount: 850.0,
        discountRate: 18.0,
        discountedAmount: 697.0,
        savedAmount: 153.0,
        integrationType: 'KEYBOARD_WEDGE',
        verificationCode: 'ORT-TX-9009',
        status: 'COMPLETED',
      },
    ];

    for (const tx of sampleTransactions) {
      const existingTx = await prisma.transaction.findFirst({
        where: { verificationCode: tx.verificationCode },
      });
      if (!existingTx) {
        await prisma.transaction.create({ data: tx });
      }
    }
    console.log(`✅ ${sampleTransactions.length} adet örnek indirimli işlem kaydı oluşturuldu/güncellendi.`);
  }

  // ═══════════════════════════════════════════════════════════
  // 5. BEKLEYEN ESNAF TALEPLERİ (REQUESTS)
  // ═══════════════════════════════════════════════════════════
  if (createdMerchants.length >= 2) {
    const copyCenter = createdMerchants[0];
    const boztepeKitap = createdMerchants[3];

    const existingReq1 = await prisma.merchantRequest.findFirst({
      where: { merchantId: copyCenter.id, type: 'DISCOUNT_UPDATE' },
    });
    if (!existingReq1) {
      await prisma.merchantRequest.create({
        data: {
          merchantId: copyCenter.id,
          type: 'DISCOUNT_UPDATE',
          status: 'PENDING',
          requestedDiscountRate: 25.0,
          payload: JSON.stringify({ note: 'Yeni eğitim-öğretim yılı başlangıcı için oran yükseltme.' }),
        },
      });
    }

    const existingReq2 = await prisma.merchantRequest.findFirst({
      where: { merchantId: boztepeKitap.id, type: 'NEW_LOCATION' },
    });
    if (!existingReq2) {
      await prisma.merchantRequest.create({
        data: {
          merchantId: boztepeKitap.id,
          type: 'NEW_LOCATION',
          status: 'PENDING',
          targetLocationTitle: 'Meydan 2. Şube',
          city: 'Trabzon',
          district: 'Ortahisar',
          neighborhood: 'İskenderpaşa',
          street: 'Gazi Mustafa Kemal Bulvarı',
          buildingNo: '4',
          fullAddress: 'İskenderpaşa Mah. Gazi Mustafa Kemal Bulv. No:4 Ortahisar/Trabzon',
          payload: JSON.stringify({ request: 'Yeni şube açılışı' }),
        },
      });
    }
    console.log('✅ Örnek esnaf onay talepleri kontrol edildi.');
  }

  console.log('\n🎉 Veritabanı tohumlama başarıyla tamamlandı!');
  console.log('───────────────────────────────────────────────────');
  console.log('👑 Admin Girişi: admin@ortahisar.bel.tr / admin123');
  console.log('👨‍🎓 Öğrenci Girişi (Mobil): TC: 11111111110 / admin123');
  console.log('🏪 Esnaf Girişi (Web): esnaf@copycenter.com / admin123');
  console.log('───────────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Tohumlama Hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
