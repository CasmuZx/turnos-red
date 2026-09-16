import type { Turno, TurnoCrudo } from '../models/turno.model.js';

// Punto 6.c y 6.d: normalización y validación de los datos.
function textoLimpio(valor: unknown): string | null {
  if (typeof valor !== 'string' && typeof valor !== 'number') return null;
  const texto = String(valor).trim().replace(/\s+/g, ' ');
  return texto === '' ? null : texto;
}

function normalizarFecha(valor: unknown): string | null {
  const fecha = textoLimpio(valor);
  if (!fecha) return null;

  // Si viene como 14/08/2026 la paso a 2026-08-14.
  if (fecha.includes('/')) {
    const partes = fecha.split('/');
    if (partes.length !== 3) return null;

    const dia = partes[0];
    const mes = partes[1];
    const anio = partes[2];
    if (!dia || !mes || !anio || anio.length !== 4) return null;

    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  // Si ya está en formato ISO la dejo igual.
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  return null;
}

function normalizarHora(valor: unknown): string | null {
  const hora = textoLimpio(valor)?.replace('.', ':');
  if (!hora) return null;

  const partes = hora.split(':');
  if (partes.length !== 2 || !partes[0] || !partes[1]) return null;

  const horas = Number(partes[0]);
  const minutos = Number(partes[1]);
  if (!Number.isInteger(horas) || !Number.isInteger(minutos)) return null;
  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return null;

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function normalizarBooleano(valor: unknown): boolean | null {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number' && (valor === 0 || valor === 1)) return valor === 1;
  if (typeof valor !== 'string') return null;

  const texto = valor.trim().toLowerCase();
  if (texto === 'si' || texto === 'sí' || texto === 'true' || texto === '1') return true;
  if (texto === 'no' || texto === 'false' || texto === '0') return false;
  return null;
}

export function normalizarTurno(crudo: TurnoCrudo): Turno | null {
  // Number convierte el id recibido como texto a un número.
  const id = Number(crudo.id);
  const paciente = textoLimpio(crudo.paciente);
  const documento = textoLimpio(crudo.documento);
  const especialidad = textoLimpio(crudo.especialidad)?.toUpperCase() ?? null;
  const fecha = normalizarFecha(crudo.fecha);
  const hora = normalizarHora(crudo.hora);
  const confirmado = normalizarBooleano(crudo.confirmado);
  const observaciones = textoLimpio(crudo.observaciones);

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !paciente ||
    !documento ||
    !especialidad ||
    !fecha ||
    !hora ||
    confirmado === null
  ) {
    return null;
  }

  return {
    id,
    paciente,
    documento,
    especialidad,
    fecha,
    hora,
    confirmado,
    ...(observaciones ? { observaciones } : {}),
  };
}
