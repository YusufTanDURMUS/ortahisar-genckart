import { Router } from 'express';
import { studentLoginController, studentRegisterController, merchantLoginController, adminLoginController } from '../controllers/auth.controller';

const router = Router();

// POST /api/v1/auth/student-register & /api/v1/auth/student/register
router.post('/student-register', studentRegisterController);
router.post('/student/register', studentRegisterController);

// POST /api/v1/auth/student-login & /api/v1/auth/student/login
router.post('/student-login', studentLoginController);
router.post('/student/login', studentLoginController);

// POST /api/v1/auth/merchant-login
router.post('/merchant-login', merchantLoginController);

// POST /api/v1/auth/admin-login
router.post('/admin-login', adminLoginController);

export default router;
