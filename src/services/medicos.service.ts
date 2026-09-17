import { ApiError } from '../errors/api-error.js';
import type { Medico } from '../models/medico.model.js';
import type { MedicoFilters, MedicoInput } from '../schemas/medico.schema.js';
import { specialtyKey } from '../schemas/common.schema.js';

class MedicosService {
  private medicos: Medico[] = [
    {
      id: 1,
      nombre: 'Medico Demo Uno',
      documento: 'DEMO-MED-001',
      especialidad: 'Pediatría',
      disponible: true,
    },
    {
      id: 2,
      nombre: 'Medico Demo Dos',
      documento: 'DEMO-MED-002',
      especialidad: 'Odontología',
      disponible: true,
    },
    {
      id: 3,
      nombre: 'Medico Demo Tres',
      documento: 'DEMO-MED-003',
      especialidad: 'Clínica médica',
      disponible: false,
    },
  ];
  private nextId = 4;
  obtenerTodos(filters: MedicoFilters = {}): Medico[] {
    return this.medicos.filter(
      (medico) =>
        (filters.especialidad === undefined ||
          specialtyKey(medico.especialidad) === specialtyKey(filters.especialidad)) &&
        (filters.disponible === undefined || medico.disponible === filters.disponible),
    );
  }
  obtenerPorId(id: number): Medico {
    const medico = this.medicos.find((item) => item.id === id);
    if (!medico) throw new ApiError(404, `No existe un médico con ID ${id}.`, 'NOT_FOUND');
    return medico;
  }
  crear(input: MedicoInput): Medico {
    const medico = { ...input, id: this.nextId++ };
    this.medicos.push(medico);
    return medico;
  }
  actualizar(id: number, input: MedicoInput): Medico {
    this.obtenerPorId(id);
    const medico = { ...input, id };
    this.medicos = this.medicos.map((item) => (item.id === id ? medico : item));
    return medico;
  }
  eliminar(id: number): void {
    this.obtenerPorId(id);
    this.medicos = this.medicos.filter((item) => item.id !== id);
  }
}
export const medicosService = new MedicosService();
