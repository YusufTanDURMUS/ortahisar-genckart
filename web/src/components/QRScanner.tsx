'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Tarayıcı kamerasını başlat
    const scanner = new Html5QrcodeScanner(
      'pwa-qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // Başarılı QR Okuma
        onScanSuccess(decodedText);
      },
      () => {
        // Okuma sırasındaki anlık hatalar (log basmıyoruz)
      }
    );

    scannerRef.current = scanner;

    return () => {
      // Sayfadan çıkıldığında kamerayı güvenle kapat
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error('Kamera kapatma hatası:', err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-sky-500/30 bg-slate-900 p-2 shadow-xl">
      <div 
        id="pwa-qr-reader" 
        className="w-full text-white [&_button]:bg-sky-600 [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-xl [&_button]:font-medium [&_button]:text-sm [&_select]:bg-slate-800 [&_select]:p-2 [&_select]:rounded-lg [&_select]:text-white" 
      />
    </div>
  );
}
