# 🌍 Esnaf & GIS Akıllı Mimari Sistemi

Bu proje; mobil, web, backend ve masaüstü ajan katmanlarını barındıran modern bir ekosistemdir.

---

## 🏗️ Mimari Yapı

* **Backend / API**: Node.js (TypeScript + Express) + Prisma ORM
* **Veritabanı**: PostgreSQL (Docker Compose, Supabase veya Render üzerinde)
* **Mobil Uygulama**: React Native (Expo) + Kamera & QR Kod Okuyucu
* **Web Panelleri**: Next.js (React) + Tailwind CSS (`/admin` ve `/esnaf` PWA rotaları)
* **Windows Esnaf Ajanı**: C# (.NET 8 WPF / Windows Forms) — Windows API & SendKeys Yazar Kasa Entegrasyonu

---

## 📥 Gerekli Dış Yazılımlar ve İndirme Rehberi

Projeyi kendi bilgisayarınızda geliştirmek ve tam fonksiyonel çalıştırmak için aşağıdaki araçları indirebilirsiniz:

### 1. Docker Desktop (Önerilen Lokal Veritabanı Ortamı)
PostgreSQL, PostGIS ve Redis veritabanlarını tek bir komutla başlatmak için gereklidir.
* 🔗 **İndirme Bağlantısı**: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
* **Kurulum Sonrası Başlatma**: `docker-compose up -d`

### 2. PostgreSQL & PgAdmin (Docker Olmadan Doğrudan Kurulum İstenirse)
Eğer Docker kullanmak istemiyorsanız veritabanını doğrudan Windows üzerine kurabilirsiniz.
* 🔗 **PostgreSQL İndirme**: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
* 🔗 **PgAdmin İndirme**: [https://www.pgadmin.org/download/pgadmin-4-windows/](https://www.pgadmin.org/download/pgadmin-4-windows/)

### 3. Bulut Veritabanı Alternatifleri (Ücretsiz / Kolay Kurulum)
* 🔗 **Supabase**: [https://supabase.com/](https://supabase.com/) (Ücretsiz bulut PostgreSQL sağlar, `DATABASE_URL` bilgisini `.env` dosyasına yapıştırmanız yeterlidir).
* 🔗 **Render**: [https://render.com/](https://render.com/) (Ücretsiz PostgreSQL veritabanı barındırma).

### 4. Expo Go (Mobil Testler İçin)
Fiziksel telefonunuzda uygulamayı anında test etmek için:
* 📱 **Android**: Google Play Store üzerinden **Expo Go** aratıp indirin.
* 📱 **iOS**: App Store üzerinden **Expo Go** aratıp indirin.

### 5. Önerilen VS Code Eklentileri
* **Prisma** (Prisma şema dosyası renklendirme ve otomasyon)
* **Tailwind CSS IntelliSense** (Otomatik sınıf tamamlama)
* **C# Dev Kit** (C# projelerini VS Code içinde derleme ve çalıştırma)

---

## 🚀 Projeleri Çalıştırma Adımları

### 1. Veritabanını Başlatma (Docker ile)
```bash
docker-compose up -d
```
> **PgAdmin Arayüzü**: `http://localhost:5050`  
> - **E-posta**: `admin@gis.com`  
> - **Şifre**: `admin123`

---

### 2. Backend (Node.js + Express + Prisma)
```bash
cd backend
npm install
npx prisma generate
npm run dev
```
> 📍 **Servis Adresi**: `http://localhost:3000`  
> 🏥 **Sağlık Kontrolü**: `http://localhost:3000/api/health`

---

### 3. Web Panelleri (Next.js + Tailwind CSS)
```bash
cd web
npm install
npm run dev
```
> 🌐 **Ana Portal**: `http://localhost:3000` (veya `http://localhost:3001`)  
> 🛡️ **Admin Paneli**: `http://localhost:3000/admin`  
> 🏪 **Esnaf PWA Paneli**: `http://localhost:3000/esnaf`

---

### 4. Mobil Uygulama (React Native Expo)
```bash
cd mobile
npm install
npx expo start
```
> 📱 Çıkan QR kodunu **Expo Go** uygulaması ile taratarak telefonunuzda çalıştırabilirsiniz.

---

### 5. Windows Esnaf Ajanı (C# .NET 8 WPF)
```bash
cd windows-agent
dotnet run
```
> 🖥️ Masaüstü arayüzü açılacak ve SendKeys ile yazar kasaya otomasyon testi yapmanıza olanak sağlayacaktır.

---

## 📁 Proje Klasör Yapısı

```
Staj/
├── backend/          # Node.js (TypeScript + Express) + Prisma ORM
├── web/              # Next.js + Tailwind CSS (/admin & /esnaf)
├── mobile/           # React Native (Expo) Kamera & QR scanner
├── windows-agent/    # C# (.NET 8 WPF) Windows API & SendKeys Ajanı
├── docker-compose.yml# PostgreSQL + PostGIS & Redis & PgAdmin
└── README.md         # İndirme rehberi ve mimari belgelendirme
```
