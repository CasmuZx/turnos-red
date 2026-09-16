import type { NextFunction, Request, Response } from 'express';
import type { TurnoCrudo } from '../models/turno.model.js';
import { ErrorNoEncontrado, ErrorValidacion, turnosService } from '../services/turnos.service.js';

function obtenerId(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0)
    throw new ErrorValidacion('El ID debe ser un entero positivo.');
  return id;
}

export function listarTurnos(_req: Request, res: Response): void {
  res.status(200).json(turnosService.obtenerTodos());
}

export function obtenerTurno(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(200).json(turnosService.obtenerPorId(obtenerId(req)));
  } catch (error) {
    next(error);
  }
}

export function crearTurno(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(201).json(turnosService.crear(req.body as TurnoCrudo));
  } catch (error) {
    next(error);
  }
}

export function actualizarTurno(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(200).json(turnosService.actualizar(obtenerId(req), req.body as TurnoCrudo));
  } catch (error) {
    next(error);
  }
}

export function eliminarTurno(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(200).json(turnosService.eliminar(obtenerId(req)));
  } catch (error) {
    next(error);
  }
}

export function manejarError(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  void _next;
  if (error instanceof ErrorValidacion) {
    res.status(400).json({ error: error.message });
    return;
  }
  if (error instanceof ErrorNoEncontrado) {
    res.status(404).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor.' });
}
