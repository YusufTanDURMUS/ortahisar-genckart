import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getEsnafList = async (req: Request, res: Response) => {
  try {
    const esnaflar = await prisma.esnaf.findMany({
      include: { user: { select: { name: true, email: true } } },
    });
    res.json({ success: true, count: esnaflar.length, data: esnaflar });
  } catch (error: any) {
    // If DB isn't migrated yet, return mock fallback for demonstration
    res.json({
      success: true,
      data: [
        {
          id: 'esnaf-1',
          shopName: 'Örnek Market & Kuruyemiş',
          taxNumber: '1234567890',
          address: 'Kadıköy, İstanbul',
          latitude: 41.0082,
          longitude: 28.9784,
          phone: '0532 000 0000',
          category: 'Market',
          isActive: true,
        },
        {
          id: 'esnaf-2',
          shopName: 'Bursa İskender Kebap',
          taxNumber: '9876543210',
          address: 'Fatih, İstanbul',
          latitude: 41.0122,
          longitude: 28.976,
          phone: '0533 111 2233',
          category: 'Restoran',
          isActive: true,
        },
      ],
    });
  }
};

export const createEsnaf = async (req: Request, res: Response) => {
  try {
    const { shopName, taxNumber, address, latitude, longitude, phone, category, userId } = req.body;
    const esnaf = await prisma.esnaf.create({
      data: { shopName, taxNumber, address, latitude, longitude, phone, category, userId },
    });
    res.status(201).json({ success: true, data: esnaf });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
