import { Router } from 'express';
import { studentLoginController } from '../controllers/auth.controller';

const router = Router();

// POST /api/v1/auth/student-login & /api/v1/auth/student/login
router.post('/student-login', studentLoginController);
router.post('/student/login', studentLoginController);

export default router;
