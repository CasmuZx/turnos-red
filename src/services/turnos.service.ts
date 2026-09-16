import { readFile } from 'node:fs/promises';
import { env } from '../config/env.js';
import { busEventos } from '../events/turnos.events.js';
import type { Turno, TurnoCrudo } from '../models/turno.model.js';
import { normalizarTurno } from './normalizacion.service.js';

export class ErrorValidacion extends Error {}
export class ErrorNoEncontrado extends Error {}

class TurnosService {
  private turnos: Turno[] = [];

  // Punto 5.a: lectura del archivo con promesas.
  async cargarDesdeArchivo(): Promise<void> {
    try {
      const contenido = await readFile(env.dataFile, 'utf8');
      const datos: unknown = JSON.parse(contenido);
      if (!Array.isArray(datos)) throw new Error('El JSON debe contener un arreglo.');

      const normalizados = datos.map((dato) => normalizarTurno(dato as TurnoCrudo));
      this.turnos = normalizados.filter((turno): turno is Turno => turno !== null);
      const rechazados = datos.length - this.turnos.length;
      console.log(
        `Procesamiento finalizado: ${this.turnos.length} aceptados, ${rechazados} rechazados.`,
      );
    } catch (error) {
      const detalle = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`No se pudo leer o procesar ${env.dataFile}: ${detalle}`);
      throw error;
    }
  }

  obtenerTodos(): Turno[] {
    return this.turnos;
  }

  obtenerPorId(id: number): Turno {
    const turno = this.turnos.find((item) => item.id === id);
    if (!turno) throw new ErrorNoEncontrado(`No existe un turno con ID ${id}.`);
    return turno;
  }

  crear(datos: TurnoCrudo): Turno {
    const ultimoId = this.turnos.length > 0 ? Math.max(...this.turnos.map((turno) => turno.id)) : 0;
    const idGenerado = ultimoId + 1;
    const candidato = normalizarTurno({ ...datos, id: datos.id ?? idGenerado });
    if (!candidato) throw new ErrorValidacion('Los datos del turno no son válidos.');
    if (this.turnos.some((turno) => turno.id === candidato.id)) {
      throw new ErrorValidacion(`Ya existe un turno con ID ${candidato.id}.`);
    }

    this.turnos.push(candidato);
    // Punto 8.b: eventos al crear, actualizar o eliminar.
    busEventos.emit('turno:creado', candidato);
    return candidato;
  }

  actualizar(id: number, datos: TurnoCrudo): Turno {
    const indice = this.turnos.findIndex((turno) => turno.id === id);
    if (indice === -1) throw new ErrorNoEncontrado(`No existe un turno con ID ${id}.`);

    const actual = this.turnos[indice];
    if (!actual) throw new ErrorNoEncontrado(`No existe un turno con ID ${id}.`);
    const candidato = normalizarTurno({ ...actual, ...datos, id });
    if (!candidato) throw new ErrorValidacion('Los datos del turno no son válidos.');

    this.turnos[indice] = candidato;
    busEventos.emit('turno:actualizado', candidato);
    return candidato;
  }

  eliminar(id: number): Turno {
    const indice = this.turnos.findIndex((turno) => turno.id === id);
    if (indice === -1) throw new ErrorNoEncontrado(`No existe un turno con ID ${id}.`);

    const [eliminado] = this.turnos.splice(indice, 1);
    if (!eliminado) throw new ErrorNoEncontrado(`No existe un turno con ID ${id}.`);
    busEventos.emit('turno:eliminado', eliminado);
    return eliminado;
  }
}

export const turnosService = new TurnosService();
