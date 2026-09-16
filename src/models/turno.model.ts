// Punto 6.a: datos como llegan desde el JSON.
export interface TurnoCrudo {
  id?: unknown;
  paciente?: unknown;
  documento?: unknown;
  especialidad?: unknown;
  fecha?: unknown;
  hora?: unknown;
  confirmado?: unknown;
  observaciones?: unknown;
}

// Punto 6.b: turno ya normalizado.
export interface Turno {
  id: number;
  paciente: string;
  documento: string;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: boolean;
  observaciones?: string;
}
