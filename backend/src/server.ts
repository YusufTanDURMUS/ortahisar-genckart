import app from './app';
import { config } from './config/env';

const PORT = config.port;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ortahisar Gençkart API Sunucusu http://0.0.0.0:${PORT} adresinde çalışıyor`);
  console.log(`🔒 AUTH_MODE: ${config.authMode}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

