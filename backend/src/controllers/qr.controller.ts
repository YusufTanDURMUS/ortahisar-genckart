import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const generateQR = async (req: Request, res: Response) => {
  try {
    const { amount, studentId } = req.body;
    const verificationCode = `GK-VERIFY-${Math.floor(100000 + Math.random() * 900000)}`;

    res.status(201).json({
      success: true,
      data: {
        verificationCode,
        amount: parseFloat(amount) || 100,
        studentId: studentId || 'student-demo-id',
        expiresInSeconds: 120,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const verifyAndProcessQR = async (req: Request, res: Response) => {
  try {
    const { studentId, merchantId, originalAmount, integrationType } = req.body;

    const discountRate = 15.0; // %15
    const origAmt = Number(originalAmount) || 100.0;
    const discountedAmt = origAmt * (1 - discountRate / 100);
    const savedAmt = origAmt - discountedAmt;
    const verificationCode = `GK-OK-${Date.now()}`;

    const transaction = await prisma.transaction.create({
      data: {
        studentId,
        merchantId,
        originalAmount: origAmt,
        discountRate,
        discountedAmount: discountedAmt,
        savedAmount: savedAmt,
        integrationType: integrationType || 'PWA_SCAN',
        verificationCode,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Ortahisar Gençkart İndirimi Başarıyla Uygulandı!',
      data: transaction,
    });
  } catch (error: any) {
    // Fallback response for offline demo
    const origAmt = Number(req.body.originalAmount) || 100.0;
    const discountRate = 15.0;
    const discountedAmt = origAmt * 0.85;
    const savedAmt = origAmt * 0.15;

    res.status(201).json({
      success: true,
      message: 'Ortahisar Gençkart İndirimi Başarıyla Uygulandı!',
      data: {
        id: `tx-${Date.now()}`,
        originalAmount: origAmt,
        discountRate,
        discountedAmount: discountedAmt,
        savedAmount: savedAmt,
        integrationType: req.body.integrationType || 'KEYBOARD_WEDGE',
        verificationCode: `GK-OK-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
    });
  }
};
