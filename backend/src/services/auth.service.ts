import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { getEdevletAdapter } from '../adapters';

export class AuthService {
  private authAdapter = getEdevletAdapter();

  async loginOrRegisterStudent(tcKn: string, birthYear: number, phoneNumber: string) {
    // 1. Adapter üzerinden e-Devlet/Belediye sorgusu yap
    const verification = await this.authAdapter.verifyStudentEligibility(tcKn, birthYear);

    if (!verification.isEligible) {
      throw new Error(verification.message || 'Genç Kart sisteminde kaydınız bulunamadı.');
    }

    // 2. Kendi DB'mizde kullanıcı var mı kontrol et, yoksa oluştur (Sync)
    let user = await prisma.user.findFirst({
      where: { studentProfile: { tcKn } },
      include: { studentProfile: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          role: 'STUDENT',
          phoneNumber,
          studentProfile: {
            create: {
              belediyeStudentId: verification.belediyeStudentId!,
              tcKn,
              firstName: verification.firstName!,
              lastName: verification.lastName!,
              isEligible: true
            }
          }
        },
        include: { studentProfile: true }
      });
    }

    // 3. Mobil Uygulama için JWT Token üret
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        studentProfileId: user.studentProfile?.id,
        belediyeStudentId: user.studentProfile?.belediyeStudentId
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' } // Mobilde sık sık giriş istenmemesi için 30 gün
    );

    return {
      token,
      user: {
        id: user.id,
        firstName: user.studentProfile?.firstName,
        lastName: user.studentProfile?.lastName,
        tcKn: user.studentProfile?.tcKn,
        isEligible: user.studentProfile?.isEligible
      }
    };
  }
}
