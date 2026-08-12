import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const studentLoginController = async (req: Request, res: Response) => {
  try {
    const { tcKn, birthYear, phoneNumber } = req.body;

    if (!tcKn || !birthYear || !phoneNumber) {
      return res.status(400).json({ status: 'ERROR', message: 'Eksik parametre gönderildi.' });
    }

    const result = await authService.loginOrRegisterStudent(tcKn, Number(birthYear), phoneNumber);
    return res.status(200).json({ status: 'SUCCESS', data: result });
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
    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Giriş başarılı.',
      data: {
        token: result.token,
        merchant: {
          businessName: result.user.merchantProfile?.businessName || 'Akbuz Sahaf & Kitabevi',
          category: result.user.merchantProfile?.category || 'Kitap & Kırtasiye',
        },
      },
    });
  } catch (error: any) {
    return res.status(401).json({ status: 'FAILED', message: error.message || 'Giriş başarısız.' });
  }
};
