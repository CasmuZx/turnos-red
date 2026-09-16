import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';
import { turnosService } from './services/turnos.service.js';
import { configurarSocket } from './socket/socket.js';

// Punto 4: código TypeScript usando import y export.
async function iniciarServidor(): Promise<void> {
  await turnosService.cargarDesdeArchivo();

  const servidorHttp = createServer(app);
  const io = new Server(servidorHttp, {
    cors: { origin: '*' },
  });
  configurarSocket(io);

  servidorHttp.listen(env.port, () => {
    console.log(`TurnosRed escuchando en http://localhost:${env.port}`);
  });
}

iniciarServidor().catch((error: unknown) => {
  console.error('No fue posible iniciar el servidor:', error);
  process.exit(1);
});
