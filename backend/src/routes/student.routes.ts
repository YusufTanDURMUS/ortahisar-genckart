import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { verifyTokenMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// ──────────────────────────────────────────────
// 1. Esnafları (Merchants) Listele ve Filtrele — Herkese Açık (Mobil Keşfet)
// GET /api/v1/student/merchants
// ──────────────────────────────────────────────
router.get('/merchants', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    const whereClause: any = {};

    if (category && category !== 'TÜMÜ' && category !== 'ALL') {
      whereClause.category = {
        equals: String(category)
      };
    }

    if (search) {
      const searchStr = String(search);
      whereClause.OR = [
        { businessName: { contains: searchStr } },
        { address: { contains: searchStr } }
      ];
    }

    // Esnaf profillerini ve şube lokasyonlarını getir
    const merchants = await prisma.merchantProfile.findMany({
      where: whereClause,
      include: {
        storeLocations: {
          orderBy: { isMain: 'desc' }
        }
      },
      orderBy: { businessName: 'asc' }
    });

    res.json({ status: 'SUCCESS', data: merchants });
  } catch (error: any) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// Aşağıdaki endpoint'ler sadece STUDENT rolüne açık
router.use(verifyTokenMiddleware(['STUDENT']));

export default router;
