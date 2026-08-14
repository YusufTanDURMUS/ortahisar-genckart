import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { verifyTokenMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Sadece MERCHANT (Esnaf) rollerinin erişebileceği middleware
router.use(verifyTokenMiddleware(['MERCHANT']));

// ──────────────────────────────────────────────
// 1. Esnafın Kendi Taleplerini Listelemesi
// GET /api/v1/merchant/requests
// ──────────────────────────────────────────────
router.get('/requests', async (req: Request, res: Response) => {
  try {
    // verifyTokenMiddleware içinde user payload'ına eklenmiş olmalı
    const userId = (req as any).user?.userId;
    
    // User üzerinden merchantProfile'ı bul
    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { userId }
    });

    if (!merchantProfile) {
      return res.status(404).json({ status: 'ERROR', message: 'Esnaf profili bulunamadı.' });
    }

    const requests = await prisma.merchantRequest.findMany({
      where: { merchantId: merchantProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ status: 'SUCCESS', data: requests });
  } catch (error: any) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// ──────────────────────────────────────────────
// 2. Yeni Talep Oluştur (İndirim, Adres, Şube vb.)
// POST /api/v1/merchant/requests
// ──────────────────────────────────────────────
router.post('/requests', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { 
      type, 
      payload,
      requestedDiscountRate,
      categoryDiscounts,
      targetLocationId,
      targetLocationTitle,
      city,
      district,
      neighborhood,
      street,
      buildingNo,
      apartmentNo,
      fullAddress,
      latitude,
      longitude
    } = req.body;

    if (!type || !['DISCOUNT_UPDATE', 'LOCATION_UPDATE', 'NEW_LOCATION'].includes(type)) {
      return res.status(400).json({ 
        status: 'ERROR', 
        message: "Geçerli bir 'type' belirtmelisiniz (DISCOUNT_UPDATE, LOCATION_UPDATE, NEW_LOCATION)." 
      });
    }

    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { userId }
    });

    if (!merchantProfile) {
      return res.status(404).json({ status: 'ERROR', message: 'Esnaf profili bulunamadı.' });
    }

    // JSON payload'ı geriye dönük uyumluluk veya ekstra data için
    const payloadString = typeof payload === 'object' ? JSON.stringify(payload) : (payload || '{}');
    
    // categoryDiscounts nesne ise string'e çevir
    const categoryStr = typeof categoryDiscounts === 'object' ? JSON.stringify(categoryDiscounts) : categoryDiscounts;

    const newRequest = await prisma.merchantRequest.create({
      data: {
        merchantId: merchantProfile.id,
        type,
        status: 'PENDING',
        payload: payloadString,
        requestedDiscountRate: requestedDiscountRate ? Number(requestedDiscountRate) : null,
        categoryDiscounts: categoryStr || null,
        targetLocationId: targetLocationId || null,
        targetLocationTitle: targetLocationTitle || null,
        city: city || null,
        district: district || null,
        neighborhood: neighborhood || null,
        street: street || null,
        buildingNo: buildingNo || null,
        apartmentNo: apartmentNo || null,
        fullAddress: fullAddress || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      }
    });

    res.status(201).json({ status: 'SUCCESS', data: newRequest });
  } catch (error: any) {
    res.status(400).json({ status: 'FAILED', message: error.message });
  }
});

// ──────────────────────────────────────────────
// 3. Esnafın Şubelerini (Lokasyonlarını) Listelemesi
// GET /api/v1/merchant/locations
// ──────────────────────────────────────────────
router.get('/locations', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { userId }
    });

    if (!merchantProfile) {
      return res.status(404).json({ status: 'ERROR', message: 'Esnaf profili bulunamadı.' });
    }

    const locations = await prisma.storeLocation.findMany({
      where: { merchantId: merchantProfile.id },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ status: 'SUCCESS', data: locations });
  } catch (error: any) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

export default router;
