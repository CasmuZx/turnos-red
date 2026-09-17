import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../errors/api-error.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  void _next;
  if (error instanceof ZodError) {
    res.status(400).json({
      status: 400,
      message: 'Error de validación en los datos ingresados',
      code: 'VALIDATION_ERROR',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    });
    return;
  }
  if (error instanceof ApiError) {
    res.status(error.status).json({
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }
  const parseError = error as { type?: string } | null;
  if (parseError?.type === 'entity.parse.failed' || parseError?.type === 'entity.too.large') {
    res.status(400).json({
      status: 400,
      message: 'El cuerpo debe ser JSON válido y no superar 100 KB.',
      code: 'VALIDATION_ERROR',
      details: [{ field: 'body', message: 'JSON inválido o demasiado grande' }],
    });
    return;
  }
  console.error(error);
  res.status(500).json({
    status: 500,
    message: 'Error interno del servidor.',
    code: 'INTERNAL_ERROR',
    details: [],
  });
};
