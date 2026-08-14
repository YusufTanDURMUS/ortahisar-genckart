import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { getEdevletAdapter } from '../adapters';

export class AuthService {
  private authAdapter = getEdevletAdapter();

  async registerStudent(tcKn: string, birthYear: number, phoneNumber: string, password: string) {
    let isEligible = true;
    let statusReason = 'ACTIVE';
    let revokedNote = null;

    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    // 1. Adapter üzerinden e-Devlet/Belediye sorgusu yap
    const verification = await this.authAdapter.verifyStudentEligibility(tcKn, birthYear);

    if (age < 15 || age > 25) {
      isEligible = false;
      statusReason = 'AGE_LIMIT_EXCEEDED';
      revokedNote = `Yaş sınırını aştınız. (Yaşınız: ${age})`;
    } else if (!verification.isEligible) {
      isEligible = false;
      statusReason = 'RESIDENCE_MISMATCH'; // Veya STUDENT_STATUS_INACTIVE
      revokedNote = verification.message || 'Genç Kart sisteminde uygunluğunuz bulunamadı.';
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

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

    if (user) {
      throw new Error('Bu TC Kimlik Numarası veya Telefon ile zaten bir hesap oluşturulmuş.');
    }

    user = await prisma.user.create({
      data: {
        role: 'STUDENT',
        phoneNumber,
        passwordHash, // Şifre kaydedildi
        studentProfile: {
          create: {
            belediyeStudentId: verification.belediyeStudentId || `BEL-STUDENT-${tcKn.slice(-4)}`,
            tcKn,
            firstName: verification.firstName || 'Bilinmiyor',
            lastName: verification.lastName || 'Bilinmiyor',
            birthYear, // Doğum yılı kaydedildi
            isEligible,
            statusReason,
            revokedNote
          }
        }
      },
      include: { studentProfile: true }
    });

    // 3. Mobil Uygulama için JWT Token üret
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        studentProfileId: user.studentProfile?.id,
        belediyeStudentId: user.studentProfile?.belediyeStudentId,
        isEligible: user.studentProfile?.isEligible
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
        birthYear: user.studentProfile?.birthYear,
        schoolName: user.studentProfile?.schoolName,
        district: user.studentProfile?.district,
        isEligible: user.studentProfile?.isEligible,
        statusReason: user.studentProfile?.statusReason,
        revokedNote: user.studentProfile?.revokedNote
      }
    };
  }

  async loginStudent(identifier: string, password: string) {
    const bcrypt = require('bcryptjs');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: identifier },
          { studentProfile: { tcKn: identifier } }
        ]
      },
      include: { studentProfile: true }
    });

    if (!user || !user.passwordHash || user.role !== 'STUDENT') {
      throw new Error('Giriş bilgileri hatalı veya kayıt bulunamadı.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Giriş bilgileri hatalı veya kayıt bulunamadı.');
    }

    // Yaş limitini loginde de kontrol edelim (her giriş yaptıklarında pasife düşebilirler)
    const currentYear = new Date().getFullYear();
    const age = currentYear - (user.studentProfile?.birthYear || 2000);
    
    let isEligible = user.studentProfile?.isEligible;
    let statusReason = user.studentProfile?.statusReason;
    let revokedNote = user.studentProfile?.revokedNote;

    if (age > 25 && isEligible) {
      isEligible = false;
      statusReason = 'AGE_LIMIT_EXCEEDED';
      revokedNote = `Yaş sınırını aştınız. (Yaşınız: ${age})`;
      
      await prisma.studentProfile.update({
        where: { id: user.studentProfile!.id },
        data: { isEligible, statusReason, revokedNote }
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        studentProfileId: user.studentProfile?.id,
        belediyeStudentId: user.studentProfile?.belediyeStudentId,
        isEligible
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
        birthYear: user.studentProfile?.birthYear,
        schoolName: user.studentProfile?.schoolName,
        district: user.studentProfile?.district,
        isEligible,
        statusReason,
        revokedNote
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
