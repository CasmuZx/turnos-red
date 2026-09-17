import { z } from 'zod';

export const textSchema = z.string().trim().min(1, 'El campo no puede estar vacío');
// Los ejemplos de la consigna permiten espacios y acentos: Clínica médica, Pediatría.
export const specialtySchema = textSchema.regex(
  /^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+(?:[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+| [A-Za-zÁÉÍÓÚÜÑáéíóúüñ][a-záéíóúüñ]+)*$/,
  'Usá inicial mayúscula y el resto en minúsculas, por ejemplo Pediatría o Clínica médica',
);
export function specialtyKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}
export function toIsoDate(value: string): string {
  if (!value.includes('/')) return value;
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}
export const dateSchema = z
  .string()
  .regex(/^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/, 'Usá AAAA-MM-DD o DD/MM/AAAA')
  .transform(toIsoDate)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'La fecha no existe en el calendario');
const queryId = z
  .string()
  .regex(/^[1-9]\d*$/, 'El ID debe ser un entero positivo')
  .transform(Number)
  .refine(Number.isSafeInteger, 'El ID es demasiado grande');
export const idParamsSchema = z.object({ id: queryId });
export const queryIdSchema = queryId;
