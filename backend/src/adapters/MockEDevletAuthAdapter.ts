import {
  IEdevletAuthAdapter,
  EDevletVerifyInput,
  EDevletVerifyResult,
} from './IEdevletAuthAdapter';

/**
 * Sahte (Mock) e-Devlet Doğrulama Servisi
 * AUTH_MODE="MOCK" iken sahte TCKN verileri ve KTÜ / Avrasya Üniv. kayıtlarıyla çalışır.
 */
export class MockEDevletAuthAdapter implements IEdevletAuthAdapter {
  private mockDatabase = [
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

  private validateTcKnFormat(tcKn: string): boolean {
    return /^[1-9][0-9]{10}$/.test(tcKn);
  }

  public async verifyStudentIdentity(
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

    const refCode = `EDEVLET-MOCK-REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const found = this.mockDatabase.find((s) => s.tcKn === cleanTcKn);

    if (found) {
      return {
        isVerified: true,
        message: 'e-Devlet Nüfus & YÖK Doğrulaması Başarılı (Mock Kayıt)',
        refCode,
        studentDetails: found,
      };
    }

    // Dinamik Mock: Herhangi geçerli 11 haneli TCKN için otomatik onay
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
