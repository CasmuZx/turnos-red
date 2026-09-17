import { Router } from 'express';
import {
  actualizarTurno,
  crearTurno,
  eliminarTurno,
  listarTurnos,
  obtenerTurno,
} from '../controllers/turnos.controller.js';
import { validate } from '../middlewares/validate.js';
import { idParamsSchema } from '../schemas/common.schema.js';
import { turnoSchema, turnoQuerySchema } from '../schemas/turno.schema.js';

export const turnosRouter = Router();
turnosRouter.get('/', validate(turnoQuerySchema, 'query'), listarTurnos);
turnosRouter.get('/:id', validate(idParamsSchema, 'params'), obtenerTurno);
turnosRouter.post('/', validate(turnoSchema, 'body'), crearTurno);
turnosRouter.put(
  '/:id',
  validate(idParamsSchema, 'params'),
  validate(turnoSchema, 'body'),
  actualizarTurno,
);
turnosRouter.delete('/:id', validate(idParamsSchema, 'params'), eliminarTurno);
