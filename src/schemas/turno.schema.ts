import { z } from 'zod';
import { dateSchema, specialtySchema, textSchema, queryIdSchema } from './common.schema.js';

export const turnoSchema = z
  .object({
    paciente: textSchema,
    documento: textSchema,
    especialidad: specialtySchema,
    medicoId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    fecha: dateSchema,
    hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Usá HH:mm entre 00:00 y 23:59'),
    confirmado: z.boolean(),
    observaciones: z.string().trim().optional(),
  })
  .strict();
export const turnoQuerySchema = z
  .object({
    especialidad: textSchema.optional(),
    fecha: dateSchema.optional(),
    medicoId: queryIdSchema.optional(),
  })
  .strict();
export type TurnoInput = z.infer<typeof turnoSchema>;
export type TurnoFilters = z.infer<typeof turnoQuerySchema>;
