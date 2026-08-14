import { prisma } from '../utils/prisma';
import { QRUtil } from '../utils/qr.util';

export interface VerifyDiscountDTO {
  qrData: string;
  merchantUserId: string; // İşlemi yapan esnafın ID'si
  originalAmount: number; // İndirimsiz toplam tutar (Örn: 500 TL)
  integrationType: 'KEYBOARD_WEDGE' | 'PWA_SCAN' | 'STATIC_QR';
}

export class DiscountService {
  async verifyAndApplyDiscount(dto: VerifyDiscountDTO) {
    let student;

    // A. BARKOD (11 Haneli TC Kimlik) ile okutulduysa
    if (/^\d{11}$/.test(dto.qrData)) {
      student = await prisma.studentProfile.findUnique({
        where: { tcKn: dto.qrData }
      });
      if (!student) {
        throw new Error('Bu TC Kimlik numarasına ait Genç Kart bulunamadı.');
      }
    } 
    // B. QR KOD ile okutulduysa
    else {
      const qrValidation = QRUtil.parseAndValidateQR(dto.qrData);
      if (!qrValidation.isValid || !qrValidation.studentProfileId) {
        throw new Error(qrValidation.message || 'QR Kod doğrulanamadı.');
      }

      // Mobil app user.id gönderdiği için userId üzerinden arıyoruz
      student = await prisma.studentProfile.findUnique({
        where: { userId: qrValidation.studentProfileId }
      });
    }

    if (!student || !student.isEligible) {
      throw new Error('Öğrencinin Genç Kart hak sahipliği aktif değil veya bulunamadı.');
    }

    // 3. Esnafı ve aktif indirim oranını veritabanından çek (userId veya id ile)
    const merchant = await prisma.merchantProfile.findFirst({
      where: {
        OR: [
          { userId: dto.merchantUserId },
          { id: dto.merchantUserId }
        ]
      }
    });

    if (!merchant) {
      throw new Error('İşletme profili bulunamadı.');
    }

    const discountRate = merchant.defaultDiscountRate; // Örn: 15 (%15)
    
    // 4. İndirim Tutarlarını Hesapla
    const originalAmount = dto.originalAmount;
    const savedAmount = Number(((originalAmount * discountRate) / 100).toFixed(2));
    const discountedAmount = Number((originalAmount - savedAmount).toFixed(2));

    const verificationCode = `ONAY-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. İşlemi Veritabanına Log olarak kaydet (Transaction)
    const transaction = await prisma.transaction.create({
      data: {
        studentId: student.id,
        merchantId: merchant.id,
        originalAmount,
        discountRate,
        discountedAmount,
        savedAmount,
        integrationType: dto.integrationType,
        verificationCode,
        status: 'PENDING'
      }
    });

    return {
      status: 'APPROVED',
      verificationCode,
      student: {
        firstName: student.firstName,
        lastName: `${student.lastName[0]}.` // Soyadı gizleme (Gizlilik için: Ahmet Y.)
      },
      merchant: {
        businessName: merchant.businessName,
        discountRate: merchant.defaultDiscountRate
      },
      financials: {
        originalAmount,
        discountRate: `%${discountRate}`,
        savedAmount,
        discountedAmount
      },
      transactionId: transaction.id
    };
  }

  async completeTransaction(transactionId: string, merchantUserId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { merchant: true }
    });

    if (!transaction) {
      throw new Error('İşlem bulunamadı.');
    }

    if (transaction.merchant.userId !== merchantUserId && transaction.merchant.id !== merchantUserId) {
      throw new Error('Bu işlemi onaylama yetkiniz yok.');
    }

    if (transaction.status === 'COMPLETED') {
      throw new Error('İşlem zaten tamamlanmış.');
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'COMPLETED' }
    });

    return updatedTransaction;
  }
}

