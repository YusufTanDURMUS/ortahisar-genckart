import CryptoJS from 'crypto-js';

const QR_SECRET = 'ortahisar_genckart_qr_secret_key_2026';

export const generateStudentQRData = (studentProfileId: string): string => {
  const timestamp = Math.floor(Date.now() / 1000);
  const rawData = `${studentProfileId}:${timestamp}`;

  // HMAC-SHA256 ile imzalama
  const signature = CryptoJS.HmacSHA256(rawData, QR_SECRET)
    .toString(CryptoJS.enc.Hex)
    .slice(0, 10);

  return `ORT-GK-${studentProfileId}-${timestamp}-${signature}`;
};
