import { Router } from 'express';
import {
  actualizarTurno,
  crearTurno,
  eliminarTurno,
  listarTurnos,
  obtenerTurno,
} from '../controllers/turnos.controller.js';

export const turnosRouter = Router();

// Punto 7: rutas pedidas para los turnos.
turnosRouter.get('/', listarTurnos);
turnosRouter.get('/:id', obtenerTurno);
turnosRouter.post('/', crearTurno);
turnosRouter.put('/:id', actualizarTurno);
turnosRouter.delete('/:id', eliminarTurno);
