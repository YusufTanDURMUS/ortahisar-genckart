import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const verifyEDevletStudent = async (req: Request, res: Response) => {
  try {
    const { tcKn, firstName, lastName, birthYear } = req.body;

    if (!tcKn || !firstName || !lastName || !birthYear) {
      return res.status(400).json({
        success: false,
        message: 'Eksik parametre: TC Kimlik No, ad, soyad ve doğum yılı zorunludur.',
      });
    }

    const authData = await AuthService.verifyAndRegisterStudent({
      tcKn,
      firstName,
      lastName,
      birthYear: Number(birthYear),
    });

    return res.status(200).json({
      success: true,
      message: 'e-Devlet doğrulama ve giriş işlemi başarılı.',
      data: authData,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Giriş işlemi başarısız.',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Eksik parametre: E-posta ve şifre zorunludur.',
      });
    }

    const authData = await AuthService.loginWithPassword(email, password);

    return res.status(200).json({
      success: true,
      message: 'Kullanıcı girişi başarılı.',
      data: authData,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Kimlik doğrulama başarısız.',
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const user = (req as any).user;
  return res.json({
    success: true,
    data: user || null,
  });
};
