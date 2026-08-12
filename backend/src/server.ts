import app from './app';
import { config } from './config/env';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Ortahisar Gençkart API Sunucusu http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`🔒 AUTH_MODE: ${config.authMode}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});
