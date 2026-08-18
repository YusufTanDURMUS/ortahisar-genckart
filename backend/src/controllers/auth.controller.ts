import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const studentRegisterController = async (req: Request, res: Response) => {
  try {
    const { tcKn, birthYear, phoneNumber, password } = req.body;

    if (!tcKn || !birthYear || !phoneNumber || !password) {
      return res.status(400).json({ status: 'ERROR', message: 'Eksik parametre gönderildi.' });
    }

    const result = await authService.registerStudent(tcKn, Number(birthYear), phoneNumber, password);
    return res.status(200).json({ status: 'SUCCESS', data: result });
  } catch (error: any) {
    return res.status(400).json({ status: 'FAILED', message: error.message });
  }
};

export const studentLoginController = async (req: Request, res: Response) => {
  try {
    const identifier = req.body.identifier || req.body.tcKn || req.body.phoneNumber;
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ status: 'ERROR', message: 'TC Kimlik Numarası ve Şifre zorunludur.' });
    }

    const result = await authService.loginStudent(identifier, password);
    return res.status(200).json({
      status: 'SUCCESS',
      data: {
        token: result.token,
        user: result.user,
        student: result.user,
      }
    });
  } catch (error: any) {
    return res.status(401).json({ status: 'FAILED', message: error.message });
  }
};

export const merchantLoginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'ERROR', message: 'E-posta ve şifre zorunludur.' });
    }

    const result = await AuthService.loginWithPassword(email, password);
    
    if (result.user.role !== 'MERCHANT') {
      return res.status(401).json({ status: 'FAILED', message: 'Yetkisiz giriş.' });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Giriş başarılı.',
      data: {
        token: result.token,
        user: {
          id: result.user.id,
          role: result.user.role,
          email: result.user.email,
          businessName: result.user.merchantProfile?.businessName,
        },
        merchant: {
          businessName: result.user.merchantProfile?.businessName || 'Akbuz Sahaf & Kitabevi',
          category: result.user.merchantProfile?.category || 'Kitap & Kırtasiye',
        }
      },
    });
  } catch (error: any) {
    return res.status(401).json({ status: 'FAILED', message: error.message || 'Giriş başarısız.' });
  }
};

export const adminLoginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'ERROR', message: 'E-posta ve şifre zorunludur.' });
    }

    const result = await AuthService.loginWithPassword(email, password);
    
    if (result.user.role !== 'ADMIN' && result.user.role !== 'MODERATOR') {
      return res.status(401).json({ status: 'FAILED', message: 'Yetkisiz giriş. Bu portala yalnızca Yönetici ve Moderatör hesapları erişebilir.' });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Giriş başarılı.',
      data: {
        token: result.token,
        user: {
          id: result.user.id,
          role: result.user.role,
          email: result.user.email,
        }
      },
    });
  } catch (error: any) {
    return res.status(401).json({ status: 'FAILED', message: error.message || 'Giriş başarısız.' });
  }
};
