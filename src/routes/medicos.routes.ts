import { Router } from 'express';
import {
  actualizarMedico,
  crearMedico,
  eliminarMedico,
  listarMedicos,
  obtenerMedico,
} from '../controllers/medicos.controller.js';
import { validate } from '../middlewares/validate.js';
import { idParamsSchema } from '../schemas/common.schema.js';
import { medicoSchema, medicoQuerySchema } from '../schemas/medico.schema.js';

export const medicosRouter = Router();
medicosRouter.get('/', validate(medicoQuerySchema, 'query'), listarMedicos);
medicosRouter.get('/:id', validate(idParamsSchema, 'params'), obtenerMedico);
medicosRouter.post('/', validate(medicoSchema, 'body'), crearMedico);
medicosRouter.put(
  '/:id',
  validate(idParamsSchema, 'params'),
  validate(medicoSchema, 'body'),
  actualizarMedico,
);
medicosRouter.delete('/:id', validate(idParamsSchema, 'params'), eliminarMedico);
