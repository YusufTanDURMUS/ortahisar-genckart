import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  nodeEnv: process.env.NODE_ENV || 'development',
  authMode: process.env.AUTH_MODE || 'MOCK',
  jwtSecret: process.env.JWT_SECRET || 'ortahisar_genc_kart_super_secret_jwt_key_2026',
  jwtExpiresIn: '7d',
};
