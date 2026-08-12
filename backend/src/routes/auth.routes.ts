import { Router } from 'express';
import { verifyEDevletStudent } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/edevlet-verify
router.post('/edevlet-verify', verifyEDevletStudent);

export default router;
