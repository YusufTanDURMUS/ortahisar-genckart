import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { verifyTokenMiddleware } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';

const router = Router();

// Sadece ADMIN rollerinin erişebileceği middleware koruması
router.use(verifyTokenMiddleware(['ADMIN']));

// ──────────────────────────────────────────────
// 1. Tüm Esnafları Listele
// GET /api/v1/admin/merchants
// ──────────────────────────────────────────────
router.get('/merchants', async (req: Request, res: Response) => {
  try {
    const merchants = await prisma.merchantProfile.findMany({
      include: { user: { select: { id: true, email: true, phoneNumber: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'SUCCESS', data: merchants });
  } catch (error: any) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// ──────────────────────────────────────────────
// 2. Yeni Esnaf Kaydı Oluştur
// POST /api/v1/admin/merchants
// ──────────────────────────────────────────────
router.post('/merchants', async (req: Request, res: Response) => {
  try {
    const { businessName, category, address, taxNumber, defaultDiscountRate, email, password } = req.body;

    if (!businessName || !category || !email || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'İşletme adı, kategori, e-posta ve şifre zorunludur.'
      });
    }

    // E-posta tekrarlama kontrolü
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: 'ERROR',
        message: 'Bu e-posta adresi zaten kayıtlı.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        role: 'MERCHANT',
        email,
        passwordHash: hashedPassword,
        merchantProfile: {
          create: {
            businessName,
            category,
            address: address || null,
            taxNumber: taxNumber || null,
            defaultDiscountRate: Number(defaultDiscountRate) || 10.0
          }
        }
      },
      include: { merchantProfile: true }
    });

    res.status(201).json({ status: 'SUCCESS', data: newUser.merchantProfile });
  } catch (error: any) {
    res.status(400).json({ status: 'FAILED', message: error.message });
  }
});

// ──────────────────────────────────────────────
// 3. Esnaf Sil
// DELETE /api/v1/admin/merchants/:id
// ──────────────────────────────────────────────
router.delete('/merchants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const merchant = await prisma.merchantProfile.findUnique({ where: { id } });
    if (!merchant) {
      return res.status(404).json({ status: 'ERROR', message: 'Esnaf bulunamadı.' });
    }

    // User'ı silince cascade ile merchantProfile da silinir
    await prisma.user.delete({ where: { id: merchant.userId } });

    res.json({ status: 'SUCCESS', message: 'Esnaf başarıyla silindi.' });
  } catch (error: any) {
    res.status(400).json({ status: 'FAILED', message: error.message });
  }
});

// ──────────────────────────────────────────────
// 4. Bekleyen İndirim Oranı Taleplerini Listele
// GET /api/v1/admin/discount-requests
// ──────────────────────────────────────────────
router.get('/discount-requests', async (req: Request, res: Response) => {
  try {
    const requests = await prisma.discountRequest.findMany({
      where: { status: 'PENDING' },
      include: { merchant: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'SUCCESS', data: requests });
  } catch (error: any) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// ──────────────────────────────────────────────
// 5. İndirim Talebini Onayla veya Reddet
// POST /api/v1/admin/discount-requests/:id/review
// ──────────────────────────────────────────────
router.post('/discount-requests/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, adminNote } = req.body; // 'APPROVED' veya 'REJECTED'

    if (!action || !['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({
        status: 'ERROR',
        message: "action alanı 'APPROVED' veya 'REJECTED' olmalıdır."
      });
    }

    const request = await prisma.discountRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ status: 'ERROR', message: 'Talep bulunamadı.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Bu talep zaten işlenmiş.'
      });
    }

    // Talebi güncelle
    const updatedRequest = await prisma.discountRequest.update({
      where: { id },
      data: {
        status: action,
        adminNote: adminNote || null
      }
    });

    // Eğer onaylandıysa, esnafın ana indirim oranını güncelle
    if (action === 'APPROVED') {
      await prisma.merchantProfile.update({
        where: { id: request.merchantId },
        data: { defaultDiscountRate: request.requestedRate }
      });
    }

    res.json({ status: 'SUCCESS', data: updatedRequest });
  } catch (error: any) {
    res.status(400).json({ status: 'FAILED', message: error.message });
  }
});

// ──────────────────────────────────────────────
// 6. Dashboard İstatistikleri
// GET /api/v1/admin/stats
// ──────────────────────────────────────────────
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalMerchants,
      pendingRequests,
      totalTransactions,
      totalStudents
    ] = await Promise.all([
      prisma.merchantProfile.count(),
      prisma.discountRequest.count({ where: { status: 'PENDING' } }),
      prisma.transaction.count(),
      prisma.studentProfile.count()
    ]);

    // Toplam tasarruf miktarını hesapla
    const savingsAgg = await prisma.transaction.aggregate({
      _sum: { savedAmount: true, discountedAmount: true, originalAmount: true }
    });

    res.json({
      status: 'SUCCESS',
      data: {
        totalMerchants,
        pendingRequests,
        totalTransactions,
        totalStudents,
        totalSaved: savingsAgg._sum.savedAmount || 0,
        totalRevenue: savingsAgg._sum.originalAmount || 0,
        totalDiscounted: savingsAgg._sum.discountedAmount || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

export default router;
