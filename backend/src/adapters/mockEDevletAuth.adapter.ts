import { prisma } from '../prisma';

export interface EDevletVerifyInput {
  tckn: string;
  name: string;
  surname: string;
  birthYear: number;
}

export interface EDevletVerifyResult {
  isVerified: boolean;
  message: string;
  studentDetails?: {
    tckn: string;
    name: string;
    surname: string;
    university: string;
    department: string;
    studentNumber: string;
    birthYear: number;
    isActiveStudent: boolean;
  };
}

/**
 * Mock e-Devlet YÖK & Nüfus Vatandaşlık İdaresi Doğrulama Adaptörü
 * AUTH_MODE=MOCK iken sahte TC verileri ve KTÜ / Avrasya Üniv. öğrenci kayıtlarıyla simüle eder.
 */
export class MockEDevletAuthAdapter {
  private static mockStudentDatabase = [
    {
      tckn: '11111111110',
      name: 'YUSUF TAN',
      surname: 'DURMUŞ',
      birthYear: 2002,
      university: 'Karadeniz Teknik Üniversitesi (KTÜ)',
      department: 'Yazılım Mühendisliği',
      studentNumber: '394812',
      isActiveStudent: true,
    },
    {
      tckn: '61616161616',
      name: 'AHMET',
      surname: 'YILMAZ',
      birthYear: 2003,
      university: 'Karadeniz Teknik Üniversitesi (KTÜ)',
      department: 'Bilgisayar Mühendisliği',
      studentNumber: '61001',
      isActiveStudent: true,
    },
    {
      tckn: '12345678901',
      name: 'AYŞE',
      surname: 'DEMİR',
      birthYear: 2004,
      university: 'Avrasya Üniversitesi',
      department: 'İşletme',
      studentNumber: '61002',
      isActiveStudent: true,
    },
  ];

  /**
   * TCKN Algoritmik Format Kontrolü (11 Hane ve Sayısal)
   */
  private static validateTcknFormat(tckn: string): boolean {
    if (!/^[1-9][0-9]{10}$/.test(tckn)) {
      return false;
    }
    return true;
  }

  /**
   * e-Devlet Kimlik & Öğrenci Durumu Doğrulama Metodu
   */
  public static async verifyStudentIdentity(
    input: EDevletVerifyInput
  ): Promise<EDevletVerifyResult> {
    const authMode = process.env.AUTH_MODE || 'MOCK';
    const cleanTckn = input.tckn.trim();
    const cleanName = input.name.trim().toUpperCase();
    const cleanSurname = input.surname.trim().toUpperCase();

    // 1. TCKN Format Kontrolü
    if (!this.validateTcknFormat(cleanTckn)) {
      return {
        isVerified: false,
        message: 'Geçersiz TCKN formatı. TC Kimlik No 11 haneli sayısal değer olmalıdır.',
      };
    }

    let isVerified = false;
    let studentInfo: any = null;
    let message = '';

    if (authMode === 'MOCK') {
      // MOCK Modu: Verilen TCKN mock listede var mı bak, yoksa genel kabul simülasyonu çalıştır
      const foundInMock = this.mockStudentDatabase.find(
        (s) => s.tckn === cleanTckn
      );

      if (foundInMock) {
        isVerified = true;
        studentInfo = foundInMock;
        message = 'e-Devlet Nüfus & YÖK Öğrenci Doğrulaması Başarılı (Mock Veri)';
      } else {
        // Dinamik Mock: Herhangi geçerli 11 haneli TCKN için otomatik öğrenci kaydı simülasyonu
        isVerified = true;
        studentInfo = {
          tckn: cleanTckn,
          name: cleanName || 'ÖĞRENCİ',
          surname: cleanSurname || 'KULLANICI',
          birthYear: input.birthYear || 2002,
          university: 'Karadeniz Teknik Üniversitesi (KTÜ)',
          department: 'Öğrenci Lisans Programı',
          studentNumber: `KTU-${Math.floor(10000 + Math.random() * 90000)}`,
          isActiveStudent: true,
        };
        message = 'e-Devlet Dinamik Otomatik Öğrenci Doğrulaması Başarılı (MOCK Modu)';
      }
    } else {
      // CANLI Mod (İleride e-Devlet SOAP / REST API entegre edilecek alan)
      message = 'Canlı e-Devlet API entegrasyonu henüz konfigüre edilmedi (AUTH_MODE=LIVE).';
    }

    // 2. Doğrulama Logunu Veritabanına Kaydet (Auditing)
    try {
      await prisma.eDevletMockLog.create({
        data: {
          tckn: cleanTckn,
          name: cleanName,
          surname: cleanSurname,
          birthYear: input.birthYear,
          isVerified,
          university: studentInfo?.university || null,
        },
      });
    } catch (dbError) {
      console.warn('e-Devlet log kaydı veritabanına yazılamadı (Offline modda atlandı).');
    }

    return {
      isVerified,
      message,
      studentDetails: isVerified ? studentInfo : undefined,
    };
  }
}
