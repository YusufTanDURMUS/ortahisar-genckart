import { PrismaClient, Role, DiscountRequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ortahisar Gençkart Yeni Şema Veritabanı Tohumlama Başlatılıyor...');

  // 1. Admin Kullanıcı
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ortahisar.bel.tr' },
    update: {},
    create: {
      role: Role.ADMIN,
      email: 'admin@ortahisar.bel.tr',
      passwordHash: '$2b$10$AdminSuperSecretHashPass', // Admin Hash
      phoneNumber: '04620000000',
    },
  });

  // 2. Örnek Öğrenci Kullanıcıları
  const studentUser1 = await prisma.user.upsert({
    where: { email: 'yusuf@ogr.ktu.edu.tr' },
    update: {},
    create: {
      role: Role.STUDENT,
      email: 'yusuf@ogr.ktu.edu.tr',
      phoneNumber: '05321112233',
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
      birthYear: 2002,
      schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
      district: 'Ortahisar',
      isEligible: true,
      edevletRefCode: 'EDEVLET-REF-61001',
    },
  });

  // 3. Örnek Esnaflar Listesi (Ortahisar / Trabzon yerel işletmeleri)
  const esnaflarData = [
    {
      businessName: 'Trabzon Tarihi Kalkınma Fırını',
      category: 'Fırın & Tatlı',
      address: 'Kalkınma Mah. No:12 Ortahisar/Trabzon',
      taxNumber: '6100000001',
      defaultDiscountRate: 15.0,
      email: 'kalkinmafirini@gmail.com',
      phoneNumber: '04623250001',
    },
    {
      businessName: 'KTÜ Kampüs Kafe & Restoran',
      category: 'Restoran / Kafe',
      address: 'KTÜ Kanuni Kampüsü Ortahisar/Trabzon',
      taxNumber: '6100000002',
      defaultDiscountRate: 20.0,
      email: 'kampuskafe@gmail.com',
      phoneNumber: '04623250002',
    },
    {
      businessName: 'Bordo Mavi Kitap & Kırtasiye',
      category: 'Kırtasiye',
      address: 'Kalkınma Mah. Üniversite Cad. No:18 Ortahisar/Trabzon',
      taxNumber: '6100000003',
      defaultDiscountRate: 12.0,
      email: 'bordomavikitap@gmail.com',
      phoneNumber: '04623250003',
    },
  ];

  for (const item of esnaflarData) {
    const merchantUser = await prisma.user.upsert({
      where: { email: item.email },
      update: {},
      create: {
        role: Role.MERCHANT,
        email: item.email,
        passwordHash: '$2b$10$MerchantSecretHashPass',
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

    // İndirim Değişiklik Talebi
    await prisma.discountRequest.create({
      data: {
        merchantId: merchantProfile.id,
        currentRate: item.defaultDiscountRate,
        requestedRate: item.defaultDiscountRate + 5.0,
        status: DiscountRequestStatus.PENDING,
        adminNote: 'Öğrencilere daha yüksek indirim sağlama talebi.',
      },
    });

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

  console.log('✅ Yeni Ortahisar Gençkart Şeması Veritabanı Tohumlama Tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
