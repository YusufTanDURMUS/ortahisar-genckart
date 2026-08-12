import { Router } from 'express';
import {
  verifyEDevletStudent,
  login,
  getMe,
} from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/auth/edevlet-verify
router.post('/edevlet-verify', verifyEDevletStudent);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me
router.get('/me', requireAuth, getMe);

export default router;
