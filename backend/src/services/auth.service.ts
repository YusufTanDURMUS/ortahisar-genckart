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

    // 2. Kendi DB'mizde kullanıcı var mı kontrol et (TCKN veya Telefon ile)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { studentProfile: { tcKn } },
          { phoneNumber }
        ]
      },
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
    } else if (!user.studentProfile) {
      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          belediyeStudentId: verification.belediyeStudentId!,
          tcKn,
          firstName: verification.firstName!,
          lastName: verification.lastName!,
          isEligible: true
        }
      });
      user.studentProfile = profile;
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
      { expiresIn: '30d' }
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

  // ──────────────────────────────────────────────
  // E-posta + Şifre ile Giriş (Esnaf & Admin)
  // ──────────────────────────────────────────────
  static async loginWithPassword(email: string, password: string) {
    const bcrypt = require('bcryptjs');

    const user = await prisma.user.findUnique({
      where: { email },
      include: { merchantProfile: true }
    });

    if (!user || !user.passwordHash) {
      throw new Error('E-posta veya şifre hatalı.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('E-posta veya şifre hatalı.');
    }

    // JWT Token üret (role bilgisi dahil)
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        merchantProfileId: user.merchantProfile?.id || null
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    return { token, user };
  }
}
