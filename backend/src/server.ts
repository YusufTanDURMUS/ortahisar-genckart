import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Node.js Express + Prisma API sunucusu http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});
