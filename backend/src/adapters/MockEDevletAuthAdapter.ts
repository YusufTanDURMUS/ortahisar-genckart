import { IEdevletAuthAdapter, StudentAuthCheckResult } from './IEdevletAuthAdapter';

export class MockEDevletAuthAdapter implements IEdevletAuthAdapter {
  async verifyStudentEligibility(tcKn: string, birthYear: number): Promise<StudentAuthCheckResult> {
    // Kural 1: 99 ile başlayan TC'ler test için "Sistemde Kayıtlı Değil / Şartları Sağlamıyor" olsun.
    if (tcKn.startsWith('99')) {
      return {
        isEligible: false,
        tcKn,
        message: 'Ortahisar Belediyesi Genç Kart sisteminde onaylı kaydınız bulunamadı.'
      };
    }

    // Kural 2: Diğer tüm durumlarda belediye DB'sinden onaylı öğrenci gibi davran.
    return {
      isEligible: true,
      belediyeStudentId: `BEL-STUDENT-${tcKn.slice(-4)}`, // Belediyenin sistemindeki ID
      tcKn,
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      message: 'Öğrenci aktif ve şartları karşılıyor.'
    };
  }
}
