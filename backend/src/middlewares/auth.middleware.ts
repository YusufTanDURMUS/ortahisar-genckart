import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string;
    id?: string;
    role: string;
    studentProfileId?: string;
    merchantProfileId?: string;
    tcKn?: string;
  };
}

export const verifyTokenMiddleware = (allowedRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'FAILED',
        message: 'Yetkisiz erişim: Bearer JWT token bulunamadı.',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'ortahisar_genc_kart_super_secret_jwt_key_2026'
      ) as any;
      (req as any).user = decoded;

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          status: 'FAILED',
          message: `Erişim engellendi. Yetkiniz bulunmamaktadır.`,
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        status: 'FAILED',
        message: 'Geçersiz veya süresi dolmuş token.',
      });
    }
  };
};

export const requireAuth = verifyTokenMiddleware();
export const requireRole = (...roles: string[]) => verifyTokenMiddleware(roles);
