import { Router } from 'express';
import { studentLoginController, merchantLoginController } from '../controllers/auth.controller';

const router = Router();

// POST /api/v1/auth/student-login & /api/v1/auth/student/login
router.post('/student-login', studentLoginController);
router.post('/student/login', studentLoginController);

// POST /api/v1/auth/merchant-login
router.post('/merchant-login', merchantLoginController);

export default router;
