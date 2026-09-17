import { ApiError } from '../errors/api-error.js';
import type { MedicoInput } from '../schemas/medico.schema.js';
import { specialtyKey } from '../schemas/common.schema.js';
import { medicosService } from './medicos.service.js';
import { turnosService } from './turnos.service.js';

// Coordina los recursos sin introducir una dependencia circular entre los servicios.
export function updateDoctor(id: number, input: MedicoInput) {
  const current = medicosService.obtenerPorId(id);
  if (
    turnosService.obtenerTodos({ medicoId: id }).length &&
    specialtyKey(current.especialidad) !== specialtyKey(input.especialidad)
  ) {
    throw new ApiError(
      400,
      'No se puede cambiar la especialidad de un médico con turnos asociados.',
      'VALIDATION_ERROR',
      [{ field: 'especialidad', message: 'El médico tiene turnos asociados' }],
    );
  }
  return medicosService.actualizar(id, input);
}
export function deleteDoctor(id: number): void {
  medicosService.obtenerPorId(id);
  if (turnosService.obtenerTodos({ medicoId: id }).length) {
    throw new ApiError(400, 'Eliminá primero los turnos asociados al médico.', 'VALIDATION_ERROR', [
      { field: 'id', message: 'El médico tiene turnos asociados' },
    ]);
  }
  medicosService.eliminar(id);
}
