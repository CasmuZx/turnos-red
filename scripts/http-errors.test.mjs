import assert from 'node:assert/strict';
import process from 'node:process';
import console from 'node:console';
const { fetch } = globalThis;
const base = process.env.BASE_URL ?? 'http://localhost:3000';
const cases = [
  [
    'JSON mal formado',
    '/turnos',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' },
    400,
    'VALIDATION_ERROR',
  ],
  ['Query repetida', '/medicos?disponible=true&disponible=false', {}, 400, 'VALIDATION_ERROR'],
  ['Filtro desconocido', '/turnos?otro=1', {}, 400, 'VALIDATION_ERROR'],
  ['ID decimal', '/turnos/1.5', {}, 400, 'VALIDATION_ERROR'],
  [
    'PUT médico incompleto',
    '/medicos/1',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{"disponible":false}',
    },
    400,
    'VALIDATION_ERROR',
  ],
  [
    'PUT turno inexistente',
    '/turnos/999999',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente: 'Prueba',
        documento: '123',
        especialidad: 'Pediatría',
        medicoId: 1,
        fecha: '2026-08-14',
        hora: '13:00',
        confirmado: true,
      }),
    },
    404,
    'NOT_FOUND',
  ],
];
for (const [name, path, options, status, code] of cases) {
  const response = await fetch(base + path, options);
  const body = await response.json();
  assert.equal(response.status, status);
  assert.equal(body.status, status);
  assert.equal(body.code, code);
  assert.deepEqual(Object.keys(body).sort(), ['code', 'details', 'message', 'status']);
  assert.ok(Array.isArray(body.details));
  console.log(`PASS ${name}`);
}
