import { Request, Response } from 'express';
import { MockEDevletAuthAdapter } from '../adapters/mockEDevletAuth.adapter';
import { prisma } from '../prisma';

export const verifyEDevletStudent = async (req: Request, res: Response) => {
  try {
    const { tcKn, firstName, lastName, birthYear } = req.body;

    if (!tcKn || !firstName || !lastName || !birthYear) {
      return res.status(400).json({
        success: false,
        message: 'Eksik bilgi: TCKN, ad, soyad ve doğum yılı zorunludur.',
      });
    }

    const authResult = await MockEDevletAuthAdapter.verifyStudentIdentity({
      tcKn,
      firstName,
      lastName,
      birthYear: Number(birthYear),
    });

    if (!authResult.isVerified || !authResult.studentDetails) {
      return res.status(401).json({
        success: false,
        message: authResult.message || 'e-Devlet Nüfus & YÖK doğrulaması başarısız.',
      });
    }

    const details = authResult.studentDetails;

    // Create or find User & StudentProfile
    let studentProfile = await prisma.studentProfile.findUnique({
      where: { tcKn: details.tcKn },
      include: { user: true },
    });

    if (!studentProfile) {
      const user = await prisma.user.create({
        data: {
          role: 'STUDENT',
          email: `${details.tcKn}@genckart.ortahisar.bel.tr`,
          phoneNumber: req.body.phoneNumber || null,
        },
      });

      studentProfile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          tcKn: details.tcKn,
          firstName: details.firstName,
          lastName: details.lastName,
          birthYear: details.birthYear,
          schoolName: details.schoolName,
          district: details.district,
          isEligible: details.isEligible,
          edevletRefCode: authResult.refCode,
        },
        include: { user: true },
      });
    }

    res.json({
      success: true,
      message: authResult.message,
      data: studentProfile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'e-Devlet doğrulama sunucu hatası',
      error: error.message,
    });
  }
};
