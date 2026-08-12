import crypto from 'crypto';

const QR_SECRET = process.env.QR_SECRET || 'ortahisar_genckart_qr_secret_key_2026';
const QR_VALIDITY_SECONDS = 60; // QR kodun ömrü: 60 saniye

export interface QRPayload {
  studentProfileId: string;
  timestamp: number;
}

export class QRUtil {
  // Mobil uygulamanın QR oluştururken kullanacağı mantık (Backend/Mobil ortak algoritma)
  static generateQRData(studentProfileId: string): { qrData: string; expiresAt: number } {
    const timestamp = Math.floor(Date.now() / 1000);
    const rawData = `${studentProfileId}:${timestamp}`;
    
    // HMAC-SHA256 ile imzalama (Sahteciliğe karşı)
    const signature = crypto
      .createHmac('sha256', QR_SECRET)
      .update(rawData)
      .digest('hex')
      .slice(0, 10); // İlk 10 karakter yeterli

    const qrData = `ORT-GK-${studentProfileId}-${timestamp}-${signature}`;
    const expiresAt = timestamp + QR_VALIDITY_SECONDS;

    return { qrData, expiresAt };
  }

  // Backend'e gelen QR metnini ayrıştıran ve doğrulayan metod
  static parseAndValidateQR(qrString: string): { isValid: boolean; studentProfileId?: string; message?: string } {
    // Örn QR: ORT-GK-uuid-1723500000-a1b2c3d4e5
    const parts = qrString.split('-');
    
    if (parts.length < 5 || parts[0] !== 'ORT' || parts[1] !== 'GK') {
      return { isValid: false, message: 'Geçersiz QR/Barkod formatı.' };
    }

    // Format: ORT-GK-{studentProfileId}-{timestamp}-{signature}
    const signature = parts.pop()!;
    const timestampStr = parts.pop()!;
    const studentProfileId = parts.slice(2).join('-'); // UUID tire içerebileceği için birleştiriyoruz
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) {
      return { isValid: false, message: 'Geçersiz zaman damgası.' };
    }

    // 1. Süre Kontrolü (60 saniye)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDiff = currentTimestamp - timestamp;

    if (timeDiff > QR_VALIDITY_SECONDS) {
      return { isValid: false, message: 'QR kodun süresi doldu (60 sn). Lütfen ekranı yenileyin.' };
    }

    if (timeDiff < -5) { // 5 saniye toleranslı saat kayması kontrolü
      return { isValid: false, message: 'Cihaz saati uyumsuz.' };
    }

    // 2. İmza Doğrulama (HMAC Kontrolü)
    const rawData = `${studentProfileId}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', QR_SECRET)
      .update(rawData)
      .digest('hex')
      .slice(0, 10);

    if (signature !== expectedSignature) {
      return { isValid: false, message: 'Güvenlik imzası geçersiz! Sahte QR kod.' };
    }

    return { isValid: true, studentProfileId };
  }
}
