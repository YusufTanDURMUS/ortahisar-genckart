import axios from 'axios';
import { IEdevletAuthAdapter, StudentAuthCheckResult } from './IEdevletAuthAdapter';

export class RealEDevletAuthAdapter implements IEdevletAuthAdapter {
  async verifyStudentEligibility(tcKn: string, birthYear: number): Promise<StudentAuthCheckResult> {
    try {
      // Belediyenin canlı API'sine atılacak HTTP POST isteği
      const response = await axios.post(process.env.BELEDIYE_EDEVLET_URL!, {
        tc_kn: tcKn,
        birth_year: birthYear
      }, {
        headers: { 'Authorization': `Bearer ${process.env.BELEDIYE_API_KEY}` }
      });

      return {
        isEligible: response.data.is_eligible,
        belediyeStudentId: response.data.user_details.belediye_id,
        tcKn,
        firstName: response.data.user_details.first_name,
        lastName: response.data.user_details.last_name,
        message: response.data.message
      };
    } catch (error) {
      return {
        isEligible: false,
        tcKn,
        message: 'Belediye doğrulama servisi ile iletişim kurulamadı.'
      };
    }
  }
}
