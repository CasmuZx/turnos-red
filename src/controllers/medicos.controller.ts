import type { Request, Response } from 'express';
import { medicosService } from '../services/medicos.service.js';
import { updateDoctor, deleteDoctor } from '../services/medical-management.service.js';

export function listarMedicos(_req: Request, res: Response): void {
  res.status(200).json(medicosService.obtenerTodos(res.locals.query));
}
export function obtenerMedico(_req: Request, res: Response): void {
  res.status(200).json(medicosService.obtenerPorId(res.locals.params.id));
}
export function crearMedico(_req: Request, res: Response): void {
  res.status(201).json(medicosService.crear(res.locals.body));
}
export function actualizarMedico(_req: Request, res: Response): void {
  res.status(200).json(updateDoctor(res.locals.params.id, res.locals.body));
}
export function eliminarMedico(_req: Request, res: Response): void {
  deleteDoctor(res.locals.params.id);
  res.status(204).end();
}
