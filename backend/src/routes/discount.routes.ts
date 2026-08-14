import { Router } from 'express';
import { verifyDiscountController, completeDiscountController } from '../controllers/discount.controller';
import { verifyTokenMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/v1/discount/verify
// Sadece giriş yapmış Esnaf (MERCHANT) rollerinin erişimine açıktır
router.post('/verify', verifyTokenMiddleware(['MERCHANT', 'ADMIN']), verifyDiscountController);

// POST /api/v1/discount/complete
// Esnaf işlemi onayladığında çağrılır
router.post('/complete', verifyTokenMiddleware(['MERCHANT', 'ADMIN']), completeDiscountController);

export default router;
