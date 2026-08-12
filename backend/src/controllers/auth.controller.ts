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
