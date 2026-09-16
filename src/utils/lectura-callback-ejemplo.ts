import { readFile } from 'node:fs';

// Punto 5.b: ejemplo usando callbacks.
// Este ejemplo no se ejecuta. Con callbacks hay que resolver todo dentro de
// otra función. Con promesas puedo usar await y manejar el error con try/catch,
// por eso elegí esa forma para leer turnos.json en el servicio.
export function leerConCallback(ruta: string): void {
  readFile(ruta, 'utf8', (error, contenido) => {
    if (error) {
      console.error('Error al leer con callback:', error.message);
      return;
    }
    console.log('Caracteres leídos con callback:', contenido.length);
  });
}
