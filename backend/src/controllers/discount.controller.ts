import { Request, Response } from 'express';
import { DiscountService } from '../services/discount.service';

const discountService = new DiscountService();

export const verifyDiscountController = async (req: Request, res: Response) => {
  try {
    const { qrData, originalAmount, integrationType } = req.body;
    
    // req.user, JWT Auth Middleware'den gelen esnafın id'sidir
    const merchantUserId = (req as any).user?.userId || (req as any).user?.id || (req as any).user?.merchantProfileId;

    if (!qrData || !originalAmount || !integrationType) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Eksik parametre! (qrData, originalAmount, integrationType zorunludur)'
      });
    }

    const result = await discountService.verifyAndApplyDiscount({
      qrData,
      merchantUserId,
      originalAmount: Number(originalAmount),
      integrationType
    });

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'İndirim başarıyla onaylandı.',
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'FAILED',
      message: error.message
    });
  }
};

export const completeDiscountController = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;
    const merchantUserId = (req as any).user?.userId || (req as any).user?.id || (req as any).user?.merchantProfileId;

    if (!transactionId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Eksik parametre! (transactionId zorunludur)'
      });
    }

    const result = await discountService.completeTransaction(transactionId, merchantUserId);

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'İşlem başarıyla tamamlandı.',
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'FAILED',
      message: error.message
    });
  }
};
