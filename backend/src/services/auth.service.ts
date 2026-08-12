import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { config } from '../config/env';
import { getEdevletAuthAdapter, EDevletVerifyInput } from '../adapters';

export class AuthService {
  /**
   * e-Devlet ile Öğrenci Kimlik Doğrulama & Kayıt / Giriş İşlemi
   */
  public static async verifyAndRegisterStudent(input: EDevletVerifyInput) {
    const adapter = getEdevletAuthAdapter();
    const result = await adapter.verifyStudentIdentity(input);

    if (!result.isVerified || !result.studentDetails) {
      throw new Error(result.message || 'e-Devlet Nüfus & YÖK doğrulaması başarısız.');
    }

    const details = result.studentDetails;

    // Veritabanında öğrenciyi bul veya oluştur
    let studentProfile = await prisma.studentProfile.findUnique({
      where: { tcKn: details.tcKn },
      include: { user: true },
    });

    if (!studentProfile) {
      const user = await prisma.user.create({
        data: {
          role: 'STUDENT',
          email: `${details.tcKn}@genckart.ortahisar.bel.tr`,
        },
      });

      studentProfile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          tcKn: details.tcKn,
          firstName: details.firstName,
          lastName: details.lastName,
          birthYear: details.birthYear,
          schoolName: details.schoolName,
          district: details.district,
          isEligible: details.isEligible,
          edevletRefCode: result.refCode,
        },
        include: { user: true },
      });
    }

    // JWT Token Üret
    const token = this.generateJwtToken({
      id: studentProfile.user.id,
      role: 'STUDENT',
      studentProfileId: studentProfile.id,
      tcKn: studentProfile.tcKn,
    });

    return {
      token,
      user: {
        id: studentProfile.user.id,
        role: 'STUDENT',
        tcKn: studentProfile.tcKn,
        firstName: studentProfile.firstName,
        lastName: studentProfile.lastName,
        schoolName: studentProfile.schoolName,
        district: studentProfile.district,
        isEligible: studentProfile.isEligible,
      },
    };
  }

  /**
   * Esnaf veya Belediye Admin Girişi (Email + Password)
   */
  public static async loginWithPassword(email: string, passwordHash: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { merchantProfile: true, studentProfile: true },
    });

    if (!user || !user.passwordHash) {
      throw new Error('E-posta adresi veya şifre hatalı.');
    }

    const isMatch = await bcrypt.compare(passwordHash, user.passwordHash).catch(() => {
      // hash kıyaslama fallback
      return passwordHash === user.passwordHash;
    });

    if (!isMatch) {
      throw new Error('E-posta adresi veya şifre hatalı.');
    }

    const token = this.generateJwtToken({
      id: user.id,
      role: user.role,
      merchantProfileId: user.merchantProfile?.id,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        merchantProfile: user.merchantProfile,
      },
    };
  }

  /**
   * JWT İmzala
   */
  public static generateJwtToken(payload: object): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }
}
