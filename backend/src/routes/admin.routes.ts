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
// 2. Yeni Esnaf Kaydı Oluştur veya Mevcut Kullanıcıya Bağla
// POST /api/v1/admin/merchants
// ──────────────────────────────────────────────
router.post('/merchants', async (req: Request, res: Response) => {
  try {
    const { businessName, category, address, taxNumber, defaultDiscountRate, email, password, phoneNumber } = req.body;

    if (!businessName || !category || !email) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'İşletme adı, kategori ve e-posta zorunludur.'
      });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { merchantProfile: true }
    });

    let merchantProfile;

    if (user) {
      // Mevcut kullanıcıyı güncelle veya profili bağla
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword, role: 'MERCHANT', ...(phoneNumber ? { phoneNumber } : {}) }
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'MERCHANT', ...(phoneNumber ? { phoneNumber } : {}) }
        });
      }

      if (user.merchantProfile) {
        merchantProfile = await prisma.merchantProfile.update({
          where: { id: user.merchantProfile.id },
          data: {
            businessName,
            category,
            address: address || user.merchantProfile.address,
            taxNumber: taxNumber || user.merchantProfile.taxNumber,
            defaultDiscountRate: Number(defaultDiscountRate) || user.merchantProfile.defaultDiscountRate
          }
        });
      } else {
        merchantProfile = await prisma.merchantProfile.create({
          data: {
            userId: user.id,
            businessName,
            category,
            address: address || null,
            taxNumber: taxNumber || null,
            defaultDiscountRate: Number(defaultDiscountRate) || 15.0
          }
        });
      }
    } else {
      // Yeni kullanıcı oluştur
      if (!password) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Yeni esnaf hesabı için şifre zorunludur.'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          role: 'MERCHANT',
          email,
          phoneNumber: phoneNumber || null,
          passwordHash: hashedPassword,
          merchantProfile: {
            create: {
              businessName,
              category,
              address: address || null,
              taxNumber: taxNumber || null,
              defaultDiscountRate: Number(defaultDiscountRate) || 15.0
            }
          }
        },
        include: { merchantProfile: true }
      });

      merchantProfile = newUser.merchantProfile!;
    }

    // Ana şubeyi de oluştur
    if (address && merchantProfile) {
      const existingLoc = await prisma.storeLocation.findFirst({
        where: { merchantId: merchantProfile.id, isMain: true }
      });
      if (existingLoc) {
        await prisma.storeLocation.update({
          where: { id: existingLoc.id },
          data: { address, title: `${businessName} (Merkez)` }
        });
      } else {
        await prisma.storeLocation.create({
          data: {
            merchantId: merchantProfile.id,
            title: `${businessName} (Merkez)`,
            address,
            isMain: true
          }
        });
      }
    }

    res.status(201).json({ status: 'SUCCESS', data: merchantProfile });
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

// ──────────────────────────────────────────────
// 7. Tüm Kullanıcıları Listele (Öğrenci, Esnaf, Admin)
// GET /api/v1/admin/users
// ──────────────────────────────────────────────
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        studentProfile: true,
        merchantProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      role: u.role,
      email: u.email,
      phoneNumber: u.phoneNumber,
      createdAt: u.createdAt,
      displayName:
        u.role === 'STUDENT'
          ? `${u.studentProfile?.firstName || ''} ${u.studentProfile?.lastName || ''}`.trim() || 'İsimsiz Öğrenci'
          : u.role === 'MERCHANT'
          ? u.merchantProfile?.businessName || 'İşletme'
          : 'Sistem Yöneticisi',
      tcKn: u.studentProfile?.tcKn || null,
      birthYear: u.studentProfile?.birthYear || null,
      schoolName: u.studentProfile?.schoolName || null,
      district: u.studentProfile?.district || null,
      isEligible: u.studentProfile?.isEligible ?? true,
      statusReason: u.studentProfile?.statusReason || null,
      businessName: u.merchantProfile?.businessName || null,
      category: u.merchantProfile?.category || null,
      discountRate: u.merchantProfile?.defaultDiscountRate || null,
      taxNumber: u.merchantProfile?.taxNumber || null,
      address: u.merchantProfile?.address || null,
    }));

    res.json({ status: 'SUCCESS', data: formattedUsers });
  } catch (error: any) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

export default router;

