import { readFile } from 'node:fs/promises';
import { env } from '../config/env.js';
import { busEventos } from '../events/turnos.events.js';
import { ApiError } from '../errors/api-error.js';
import type { Turno, TurnoCrudo } from '../models/turno.model.js';
import type { TurnoInput, TurnoFilters } from '../schemas/turno.schema.js';
import { turnoSchema } from '../schemas/turno.schema.js';
import { specialtyKey } from '../schemas/common.schema.js';
import { medicosService } from './medicos.service.js';
import { normalizarTurno } from './normalizacion.service.js';

class TurnosService {
  private turnos: Turno[] = [];
  private nextId = 1;
  async cargarDesdeArchivo(): Promise<void> {
    const datos: unknown = JSON.parse(await readFile(env.dataFile, 'utf8'));
    if (!Array.isArray(datos)) throw new Error('El JSON debe contener un arreglo.');
    this.turnos = [];
    for (const raw of datos) {
      if (!raw || typeof raw !== 'object') continue;
      const turno = normalizarTurno(raw as TurnoCrudo);
      if (!turno) continue;
      const { id, ...input } = turno;
      if (!Number.isSafeInteger(id) || this.turnos.some((item) => item.id === id)) continue;
      const parsed = turnoSchema.safeParse(input);
      if (!parsed.success) continue;
      try {
        this.validarMedico(parsed.data);
      } catch {
        continue;
      }
      this.turnos.push({ ...parsed.data, id });
    }
    this.nextId = Math.max(0, ...this.turnos.map((turno) => turno.id)) + 1;
    console.log(
      `Procesamiento finalizado: ${this.turnos.length} aceptados, ${datos.length - this.turnos.length} rechazados.`,
    );
  }
  obtenerTodos(filters: TurnoFilters = {}): Turno[] {
    return this.turnos.filter(
      (turno) =>
        (filters.especialidad === undefined ||
          specialtyKey(turno.especialidad) === specialtyKey(filters.especialidad)) &&
        (filters.fecha === undefined || turno.fecha === filters.fecha) &&
        (filters.medicoId === undefined || turno.medicoId === filters.medicoId),
    );
  }
  obtenerPorId(id: number): Turno {
    const turno = this.turnos.find((item) => item.id === id);
    if (!turno) throw new ApiError(404, `No existe un turno con ID ${id}.`, 'NOT_FOUND');
    return turno;
  }
  private validarMedico(input: TurnoInput): void {
    const medico = medicosService.obtenerPorId(input.medicoId);
    if (specialtyKey(medico.especialidad) !== specialtyKey(input.especialidad)) {
      throw new ApiError(
        400,
        'La especialidad del turno debe coincidir con la del médico.',
        'VALIDATION_ERROR',
        [{ field: 'especialidad', message: 'Especialidad incompatible con medicoId' }],
      );
    }
    if (!medico.disponible)
      throw new ApiError(400, 'El médico no está disponible.', 'VALIDATION_ERROR', [
        { field: 'medicoId', message: 'Médico no disponible' },
      ]);
  }
  crear(input: TurnoInput): Turno {
    this.validarMedico(input);
    const turno = { ...input, id: this.nextId++ };
    this.turnos.push(turno);
    busEventos.emit('turno:creado', turno);
    return turno;
  }
  actualizar(id: number, input: TurnoInput): Turno {
    this.obtenerPorId(id);
    this.validarMedico(input);
    const turno = { ...input, id };
    this.turnos = this.turnos.map((item) => (item.id === id ? turno : item));
    busEventos.emit('turno:actualizado', turno);
    return turno;
  }
  eliminar(id: number): void {
    const turno = this.obtenerPorId(id);
    this.turnos = this.turnos.filter((item) => item.id !== id);
    busEventos.emit('turno:eliminado', turno);
  }
}
export const turnosService = new TurnosService();
