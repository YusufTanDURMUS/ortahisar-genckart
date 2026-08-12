import { Router } from 'express';
import { generateQR, verifyAndProcessQR } from '../controllers/qr.controller';

const router = Router();

router.post('/generate', generateQR);
router.post('/process', verifyAndProcessQR);

export default router;
