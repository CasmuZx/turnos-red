import { z } from 'zod';
import { specialtySchema, textSchema } from './common.schema.js';

export const medicoSchema = z
  .object({
    nombre: textSchema,
    documento: textSchema,
    especialidad: specialtySchema,
    disponible: z.boolean(),
  })
  .strict();
export const medicoQuerySchema = z
  .object({
    especialidad: textSchema.optional(),
    disponible: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
  })
  .strict();
export type MedicoInput = z.infer<typeof medicoSchema>;
export type MedicoFilters = z.infer<typeof medicoQuerySchema>;
