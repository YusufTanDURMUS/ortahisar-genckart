import { PrismaClient, UserRole, RequestStatus, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ortahisar Gençkart Veritabanı Tohumlama (Seeding) Başlatılıyor...');

  // 1. Admin Kullanıcı
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ortahisar.bel.tr' },
    update: {},
    create: {
      tckn: '10000000000',
      name: 'Belediye',
      surname: 'Yöneticisi',
      email: 'admin@ortahisar.bel.tr',
      role: UserRole.ADMIN,
    },
  });

  // 2. Örnek Öğrenciler
  const student1 = await prisma.user.upsert({
    where: { email: 'yusuf@ogr.ktu.edu.tr' },
    update: {},
    create: {
      tckn: '11111111110',
      name: 'Yusuf Tan',
      surname: 'Durmuş',
      email: 'yusuf@ogr.ktu.edu.tr',
      role: UserRole.STUDENT,
      university: 'Karadeniz Teknik Üniversitesi (KTÜ)',
      department: 'Yazılım Mühendisliği',
      studentNumber: '394812',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'ahmet@ogr.ktu.edu.tr' },
    update: {},
    create: {
      tckn: '61616161616',
      name: 'Ahmet',
      surname: 'Yılmaz',
      email: 'ahmet@ogr.ktu.edu.tr',
      role: UserRole.STUDENT,
      university: 'Karadeniz Teknik Üniversitesi (KTÜ)',
      department: 'Bilgisayar Mühendisliği',
      studentNumber: '61001',
    },
  });

  // 3. Örnek Esnaflar Listesi (Ortahisar / Trabzon yerel işletmeleri)
  const esnaflarData = [
    {
      shopName: 'Trabzon Tarihi Kalkınma Fırını',
      ownerName: 'Mustafa Usta',
      taxNumber: '6100000001',
      category: 'Fırın & Tatlı',
      address: 'Kalkınma Mah. No:12 Ortahisar/Trabzon',
      phone: '0462 325 0001',
      discountRate: 15.0,
      email: 'kalkinmafirini@gmail.com',
    },
    {
      shopName: 'KTÜ Kampüs Kafe & Restoran',
      ownerName: 'Mehmet Ali Bey',
      taxNumber: '6100000002',
      category: 'Restoran / Kafe',
      address: 'KTÜ Kanuni Kampüsü Ortahisar/Trabzon',
      phone: '0462 325 0002',
      discountRate: 20.0,
      email: 'kampuskafe@gmail.com',
    },
    {
      shopName: 'Akçaabat Köftecisi Trabzon Şubesi',
      ownerName: 'Süleyman Usta',
      taxNumber: '6100000003',
      category: 'Restoran',
      address: 'Meydan Parkı Yanı No:4 Ortahisar/Trabzon',
      phone: '0462 325 0003',
      discountRate: 10.0,
      email: 'kofteci61@gmail.com',
    },
    {
      shopName: 'Bordo Mavi Kitap & Kırtasiye',
      ownerName: 'Emine Hanım',
      taxNumber: '6100000004',
      category: 'Kırtasiye',
      address: 'Kalkınma Mah. Üniversite Cad. No:18 Ortahisar/Trabzon',
      phone: '0462 325 0004',
      discountRate: 12.0,
      email: 'bordomavikitap@gmail.com',
    },
  ];

  for (const item of esnaflarData) {
    const merchantUser = await prisma.user.upsert({
      where: { email: item.email },
      update: {},
      create: {
        tckn: item.taxNumber + '0',
        name: item.ownerName,
        surname: 'Esnaf',
        email: item.email,
        role: UserRole.MERCHANT,
      },
    });

    const merchant = await prisma.merchant.upsert({
      where: { taxNumber: item.taxNumber },
      update: {},
      create: {
        shopName: item.shopName,
        ownerName: item.ownerName,
        taxNumber: item.taxNumber,
        category: item.category,
        address: item.address,
        phone: item.phone,
        discountRate: item.discountRate,
        userId: merchantUser.id,
      },
    });

    // Örnek indirim talebi oluştur
    await prisma.discountRequest.create({
      data: {
        merchantId: merchant.id,
        currentRate: item.discountRate,
        requestedRate: item.discountRate + 5,
        reason: 'Öğrencilere yeni eğitim döneminde daha yüksek destek sağlama talebi.',
        status: RequestStatus.PENDING,
      },
    });

    // Örnek işlem geçmişi ekle
    await prisma.transaction.create({
      data: {
        transactionCode: `TX-61-${Math.floor(100000 + Math.random() * 900000)}`,
        originalAmount: 200.0,
        discountRate: item.discountRate,
        discountAmount: (200.0 * item.discountRate) / 100,
        finalAmount: 200.0 - (200.0 * item.discountRate) / 100,
        status: TransactionStatus.COMPLETED,
        studentId: student1.id,
        merchantId: merchant.id,
        deviceSource: 'MOBILE_APP',
      },
    });
  }

  console.log('✅ Ortahisar Gençkart Veritabanı Seeding Tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
