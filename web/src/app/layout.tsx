import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Esnaf & GIS Yönetim Panelleri',
  description: 'Next.js + Tailwind CSS Admin ve Esnaf PWA Arayüzleri',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
