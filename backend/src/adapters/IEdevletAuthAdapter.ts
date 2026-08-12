export interface EDevletVerifyInput {
  tcKn: string;
  firstName: string;
  lastName: string;
  birthYear: number;
}

export interface EDevletStudentDetails {
  tcKn: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  district: string;
  birthYear: number;
  isEligible: boolean;
}

export interface EDevletVerifyResult {
  isVerified: boolean;
  message: string;
  refCode?: string;
  studentDetails?: EDevletStudentDetails;
}

export interface IEdevletAuthAdapter {
  verifyStudentIdentity(input: EDevletVerifyInput): Promise<EDevletVerifyResult>;
}
