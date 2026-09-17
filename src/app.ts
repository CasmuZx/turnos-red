import express from 'express';
import { errorHandler } from './middlewares/error-handler.js';
import { ApiError } from './errors/api-error.js';
import { turnosRouter } from './routes/turnos.routes.js';
import { medicosRouter } from './routes/medicos.routes.js';

export const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(express.static('public'));
app.get('/', (_req, res) => {
  res.status(200).json({ nombre: 'TurnosRed API', estado: 'activa', version: '2.0.0' });
});
app.use('/turnos', turnosRouter);
app.use('/medicos', medicosRouter);
app.use((_req, _res, next) => next(new ApiError(404, 'Ruta no encontrada.', 'NOT_FOUND')));
app.use(errorHandler);
