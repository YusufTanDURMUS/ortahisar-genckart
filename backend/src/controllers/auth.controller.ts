import { Request, Response } from 'express';
import { MockEDevletAuthAdapter } from '../adapters/mockEDevletAuth.adapter';
import { prisma } from '../prisma';

export const verifyEDevletStudent = async (req: Request, res: Response) => {
  try {
    const { tckn, name, surname, birthYear } = req.body;

    if (!tckn || !name || !surname || !birthYear) {
      return res.status(400).json({
        success: false,
        message: 'Eksik bilgi: TCKN, ad, soyad ve doğum yılı zorunludur.',
      });
    }

    // 1. Mock e-Devlet Adaptörü ile Doğrulama Yap
    const authResult = await MockEDevletAuthAdapter.verifyStudentIdentity({
      tckn,
      name,
      surname,
      birthYear: Number(birthYear),
    });

    if (!authResult.isVerified || !authResult.studentDetails) {
      return res.status(401).json({
        success: false,
        message: authResult.message || 'e-Devlet Nüfus & YÖK doğrulaması başarısız.',
      });
    }

    const details = authResult.studentDetails;

    // 2. Doğrulanan Öğrenciyi Veritabanına Kaydet veya Güncelle (Upsert)
    const user = await prisma.user.upsert({
      where: { tckn: details.tckn },
      update: {
        name: details.name,
        surname: details.surname,
        university: details.university,
        department: details.department,
        studentNumber: details.studentNumber,
      },
      create: {
        tckn: details.tckn,
        name: details.name,
        surname: details.surname,
        email: `${details.tckn}@genckart.ortahisar.bel.tr`,
        birthYear: details.birthYear,
        university: details.university,
        department: details.department,
        studentNumber: details.studentNumber,
        role: 'STUDENT',
      },
    });

    res.json({
      success: true,
      message: authResult.message,
      data: {
        id: user.id,
        tckn: user.tckn,
        name: user.name,
        surname: user.surname,
        university: user.university,
        department: user.department,
        studentNumber: user.studentNumber,
        studentStatus: user.studentStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'e-Devlet doğrulama sunucu hatası',
      error: error.message,
    });
  }
};
