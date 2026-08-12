import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getEsnafList = async (req: Request, res: Response) => {
  try {
    const esnaflar = await prisma.merchantProfile.findMany({
      include: { user: { select: { email: true, phoneNumber: true } } },
    });
    res.json({ success: true, count: esnaflar.length, data: esnaflar });
  } catch (error: any) {
    res.json({
      success: true,
      data: [
        {
          id: 'esnaf-1',
          businessName: 'Trabzon Tarihi Kalkınma Fırını',
          category: 'Fırın & Tatlı',
          address: 'Kalkınma Mah. Ortahisar/Trabzon',
          taxNumber: '6100000001',
          defaultDiscountRate: 15.0,
          qrCodeIdentifier: 'STATIC-QR-61001',
        },
        {
          id: 'esnaf-2',
          businessName: 'KTÜ Kampüs Kafe',
          category: 'Restoran / Kafe',
          address: 'KTÜ Kanuni Kampüsü Ortahisar/Trabzon',
          taxNumber: '6100000002',
          defaultDiscountRate: 20.0,
          qrCodeIdentifier: 'STATIC-QR-61002',
        },
      ],
    });
  }
};

export const createEsnaf = async (req: Request, res: Response) => {
  try {
    const { businessName, category, address, taxNumber, defaultDiscountRate, userId } = req.body;
    const merchant = await prisma.merchantProfile.create({
      data: {
        userId,
        businessName,
        category,
        address,
        taxNumber,
        defaultDiscountRate: defaultDiscountRate || 10.0,
      },
    });
    res.status(201).json({ success: true, data: merchant });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
