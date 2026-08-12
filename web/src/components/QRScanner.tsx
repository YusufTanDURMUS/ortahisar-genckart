'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Sayfa mount olduğunda tarayıcı kamerasını başlat
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
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
        // Başarılı okuma
        onScanSuccess(decodedText);
      },
      (error) => {
        // Sürekli kamera tarama hatası
      }
    );

    scannerRef.current = scanner;

    return () => {
      // Bileşen kapandığında kamerayı güvenle kapat
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error('Clear error', err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-sky-500/30 bg-slate-900/50 p-2 shadow-xl">
      <div id="qr-reader" className="w-full text-white [&_button]:bg-sky-600 [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-lg [&_button]:font-medium [&_button]:text-sm [&_select]:bg-slate-800 [&_select]:p-2 [&_select]:rounded-md" />
    </div>
  );
}
