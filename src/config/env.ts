import 'dotenv/config';
import path from 'node:path';

// Punto 2: variables de entorno.
const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('La variable PORT debe ser un número entero entre 1 y 65535.');
}

export const env = {
  port,
  dataFile: path.resolve(process.cwd(), process.env.DATA_FILE ?? './data/turnos.json'),
};
