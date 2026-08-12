export interface EDevletVerifyInput {
  tcKn: string;
  firstName: string;
  lastName: string;
  birthYear: number;
}

export interface EDevletVerifyResult {
  isVerified: boolean;
  message: string;
  refCode?: string;
  studentDetails?: {
    tcKn: string;
    firstName: string;
    lastName: string;
    schoolName: string;
    district: string;
    birthYear: number;
    isEligible: boolean;
  };
}

/**
 * Mock e-Devlet YÖK & Nüfus Vatandaşlık İdaresi Doğrulama Adaptörü
 * AUTH_MODE=MOCK iken sahte TC verileri ve KTÜ / Avrasya Üniv. öğrenci kayıtlarıyla simüle eder.
 */
export class MockEDevletAuthAdapter {
  private static mockStudentDatabase = [
    {
      tcKn: '11111111110',
      firstName: 'YUSUF TAN',
      lastName: 'DURMUŞ',
      birthYear: 2002,
      schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
      district: 'Ortahisar',
      isEligible: true,
    },
    {
      tcKn: '61616161616',
      firstName: 'AHMET',
      lastName: 'YILMAZ',
      birthYear: 2003,
      schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
      district: 'Ortahisar',
      isEligible: true,
    },
    {
      tcKn: '12345678901',
      firstName: 'AYŞE',
      lastName: 'DEMİR',
      birthYear: 2004,
      schoolName: 'Avrasya Üniversitesi',
      district: 'Ortahisar',
      isEligible: true,
    },
  ];

  private static validateTcKnFormat(tcKn: string): boolean {
    return /^[1-9][0-9]{10}$/.test(tcKn);
  }

  public static async verifyStudentIdentity(
    input: EDevletVerifyInput
  ): Promise<EDevletVerifyResult> {
    const cleanTcKn = input.tcKn.trim();
    const cleanFirstName = input.firstName.trim().toUpperCase();
    const cleanLastName = input.lastName.trim().toUpperCase();

    if (!this.validateTcKnFormat(cleanTcKn)) {
      return {
        isVerified: false,
        message: 'Geçersiz TC Kimlik No formatı (11 haneli sayı olmalıdır).',
      };
    }

    const refCode = `EDEVLET-REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const found = this.mockStudentDatabase.find((s) => s.tcKn === cleanTcKn);

    if (found) {
      return {
        isVerified: true,
        message: 'e-Devlet YÖK Öğrenci ve İkamet Doğrulaması Başarılı',
        refCode,
        studentDetails: found,
      };
    }

    // Dynamic mock for any valid 11-digit TCKN
    return {
      isVerified: true,
      message: 'e-Devlet Dinamik Otomatik Öğrenci Doğrulaması Başarılı (Ortahisar İkametli)',
      refCode,
      studentDetails: {
        tcKn: cleanTcKn,
        firstName: cleanFirstName || 'ÖĞRENCİ',
        lastName: cleanLastName || 'KULLANICI',
        birthYear: input.birthYear || 2002,
        schoolName: 'Karadeniz Teknik Üniversitesi (KTÜ)',
        district: 'Ortahisar',
        isEligible: true,
      },
    };
  }
}
