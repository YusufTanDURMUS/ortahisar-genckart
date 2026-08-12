export interface StudentAuthCheckResult {
  isEligible: boolean;
  belediyeStudentId?: string;
  tcKn: string;
  firstName?: string;
  lastName?: string;
  message?: string;
}

export interface IEdevletAuthAdapter {
  verifyStudentEligibility(tcKn: string, birthYear: number): Promise<StudentAuthCheckResult>;
}
