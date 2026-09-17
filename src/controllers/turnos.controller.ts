import type { Request, Response } from 'express';
import { turnosService } from '../services/turnos.service.js';

export function listarTurnos(_req: Request, res: Response): void {
  res.status(200).json(turnosService.obtenerTodos(res.locals.query));
}
export function obtenerTurno(_req: Request, res: Response): void {
  res.status(200).json(turnosService.obtenerPorId(res.locals.params.id));
}
export function crearTurno(_req: Request, res: Response): void {
  res.status(201).json(turnosService.crear(res.locals.body));
}
export function actualizarTurno(_req: Request, res: Response): void {
  res.status(200).json(turnosService.actualizar(res.locals.params.id, res.locals.body));
}
export function eliminarTurno(_req: Request, res: Response): void {
  turnosService.eliminar(res.locals.params.id);
  res.status(204).end();
}
