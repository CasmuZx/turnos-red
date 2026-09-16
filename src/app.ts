import express from 'express';
import { manejarError } from './controllers/turnos.controller.js';
import { turnosRouter } from './routes/turnos.routes.js';

export const app = express();

// Punto 7.b: configuración de Express.
app.use(express.json());
app.use(express.static('public'));
app.get('/', (_req, res) => {
  res.status(200).json({ nombre: 'TurnosRed API', estado: 'activa' });
});
app.use('/turnos', turnosRouter);
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use(manejarError);
