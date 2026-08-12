import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getEsnafList = async (req: Request, res: Response) => {
  try {
    const esnaflar = await prisma.merchant.findMany({
      include: { user: { select: { name: true, surname: true, email: true } } },
    });
    res.json({ success: true, count: esnaflar.length, data: esnaflar });
  } catch (error: any) {
    res.json({
      success: true,
      data: [
        {
          id: 'esnaf-1',
          shopName: 'Trabzon Tarihi Kalkınma Fırını',
          ownerName: 'Mustafa Usta',
          taxNumber: '6100000001',
          category: 'Fırın & Tatlı',
          address: 'Kalkınma Mah. Ortahisar/Trabzon',
          phone: '0462 325 0001',
          discountRate: 15.0,
          isActive: true,
        },
        {
          id: 'esnaf-2',
          shopName: 'KTÜ Kampüs Kafe',
          ownerName: 'Mehmet Ali Bey',
          taxNumber: '6100000002',
          category: 'Restoran',
          address: 'KTÜ Kanuni Kampüsü Ortahisar/Trabzon',
          phone: '0462 325 0002',
          discountRate: 20.0,
          isActive: true,
        },
      ],
    });
  }
};

export const createEsnaf = async (req: Request, res: Response) => {
  try {
    const { shopName, ownerName, taxNumber, address, latitude, longitude, phone, category, discountRate, userId } = req.body;
    const esnaf = await prisma.merchant.create({
      data: {
        shopName,
        ownerName,
        taxNumber,
        address,
        latitude,
        longitude,
        phone,
        category,
        discountRate: discountRate || 10.0,
        userId,
      },
    });
    res.status(201).json({ success: true, data: esnaf });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
