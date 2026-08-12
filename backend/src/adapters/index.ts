import { config } from '../config/env';
import { IEdevletAuthAdapter } from './IEdevletAuthAdapter';
import { MockEDevletAuthAdapter } from './MockEDevletAuthAdapter';
import { RealEDevletAuthAdapter } from './RealEDevletAuthAdapter';

export function getEdevletAuthAdapter(): IEdevletAuthAdapter {
  const mode = config.authMode.toUpperCase();
  if (mode === 'REAL' || mode === 'LIVE') {
    return new RealEDevletAuthAdapter();
  }
  return new MockEDevletAuthAdapter();
}

export * from './IEdevletAuthAdapter';
export * from './MockEDevletAuthAdapter';
export * from './RealEDevletAuthAdapter';
