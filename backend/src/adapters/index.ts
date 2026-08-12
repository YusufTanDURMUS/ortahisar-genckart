import { IEdevletAuthAdapter } from './IEdevletAuthAdapter';
import { MockEDevletAuthAdapter } from './MockEDevletAuthAdapter';
import { RealEDevletAuthAdapter } from './RealEDevletAuthAdapter';

// .env dosyasındaki AUTH_MODE değişkenine göre çalışan sınıfı otomatik seçer
export const getEdevletAdapter = (): IEdevletAuthAdapter => {
  const mode = process.env.AUTH_MODE || 'MOCK';
  if (mode === 'REAL') {
    return new RealEDevletAuthAdapter();
  }
  return new MockEDevletAuthAdapter();
};

export * from './IEdevletAuthAdapter';
export * from './MockEDevletAuthAdapter';
export * from './RealEDevletAuthAdapter';
