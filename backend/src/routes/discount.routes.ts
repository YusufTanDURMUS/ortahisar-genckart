import { Router } from 'express';
import { verifyDiscountController } from '../controllers/discount.controller';
import { verifyTokenMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/v1/discount/verify
// Sadece giriş yapmış Esnaf (MERCHANT) rollerinin erişimine açıktır
router.post('/verify', verifyTokenMiddleware(['MERCHANT', 'ADMIN']), verifyDiscountController);

export default router;
