# TurnosRed API 2

Backend de gestión de turnos y médicos desarrollado para Integraciones web. Amplía la API 1 con Zod, errores uniformes, médicos relacionados, filtros y pruebas automatizadas en Postman. Conserva la carga y normalización del JSON y los eventos de Socket.IO.

Todos los nombres y documentos de pacientes y médicos incluidos en esta versión son datos ficticios DEMO creados exclusivamente para pruebas académicas. No deben cargarse datos personales reales en el repositorio ni en un mock público.

## Requisitos e instalación

Node.js 22.x, npm, Visual Studio Code, Git y Postman. No requiere base de datos.

```powershell
git clone https://github.com/CasmuZx/turnos-red.git
cd turnos-red
git checkout api-2
npm install
Copy-Item .env.example .env
npm run dev
```

Para una descarga ZIP, abrir la carpeta que contiene `package.json` y ejecutar los tres últimos comandos. En Linux o macOS, usar `cp .env.example .env`. El servidor inicia en http://localhost:3000. Evitar ejecutar dos servidores en el mismo puerto.

```bash
npm run build
npm start
npm run lint
npm run format:check
```

Los datos se mantienen en memoria: los cambios realizados por HTTP se pierden al reiniciar. Al iniciar se recuperan dos turnos válidos del JSON y se descarta el registro inválido; los tres médicos de ejemplo se inicializan en el servicio. No se implementa autenticación porque no se pide un endpoint de login; la variable `token` de Postman queda preparada para una futura integración, sin enviar credenciales ficticias.

## Variables de entorno

| Variable  | Valor de ejemplo   | Función                     |
| --------- | ------------------ | --------------------------- |
| PORT      | 3000               | Puerto HTTP                 |
| DATA_FILE | ./data/turnos.json | Archivo de turnos iniciales |

En Postman se utiliza un entorno separado:

| Variable | Valor inicial         | Función                                        |
| -------- | --------------------- | ---------------------------------------------- |
| baseUrl  | http://localhost:3000 | API real                                       |
| mockUrl  | vacío                 | URL asignada por Postman al Mock Server        |
| medicoId | vacío                 | ID guardado automáticamente al crear un médico |
| turnoId  | vacío                 | ID guardado automáticamente al crear un turno  |
| token    | vacío                 | Reservada para autenticación futura            |

## Estructura de directorios

```text
src/
  config/          Variables de entorno
  controllers/     Entrada HTTP y respuestas
  errors/          Error de aplicación
  events/          Bus de eventos
  middlewares/     Validación Zod y manejo central de errores
  models/          Interfaces de datos
  routes/          Rutas REST
  schemas/         Contratos Zod de body, params y query
  services/        Lógica de negocio y coordinación de recursos
  socket/          Emisión de eventos Socket.IO
  utils/           Ejemplo de lectura con callback de API 1
  app.ts
  server.ts
data/              JSON inicial
public/            Cliente de eventos
postman/           Entorno y colección anterior de API 1
scripts/           Prueba HTTP de errores
turnos-red.postman_collection.json
```

## Endpoints

| Método | Ruta         | Resultado                         |
| ------ | ------------ | --------------------------------- |
| GET    | /turnos      | Lista de turnos, 200              |
| GET    | /turnos/:id  | Turno, 200 o 404                  |
| POST   | /turnos      | Turno creado, 201                 |
| PUT    | /turnos/:id  | Reemplazo completo, 200 o 404     |
| DELETE | /turnos/:id  | Eliminación sin cuerpo, 204 o 404 |
| GET    | /medicos     | Lista de médicos, 200             |
| GET    | /medicos/:id | Médico, 200 o 404                 |
| POST   | /medicos     | Médico creado, 201                |
| PUT    | /medicos/:id | Reemplazo completo, 200 o 404     |
| DELETE | /medicos/:id | Eliminación sin cuerpo, 204 o 404 |

Los IDs se generan en el servidor, son enteros positivos y no se aceptan en el body. PUT exige todos los campos obligatorios y elimina observaciones anteriores si se omiten. Los errores de datos producen 400, los recursos o rutas inexistentes 404 y los errores inesperados 500.

### Médico

```json
{
  "nombre": "Medico Demo Uno",
  "documento": "DEMO-MED-004",
  "especialidad": "Pediatría",
  "disponible": true
}
```

Los cuatro campos son obligatorios. `documento` debe ser string y puede contener puntos, letras o guiones. `disponible` debe ser un booleano JSON.

### Turno

```json
{
  "paciente": "Paciente Demo Tres",
  "documento": "DEMO-PAC-003",
  "especialidad": "Pediatría",
  "medicoId": 1,
  "fecha": "14/08/2026",
  "hora": "14:00",
  "confirmado": true,
  "observaciones": "Control"
}
```

Todos los campos salvo `observaciones` son obligatorios. Se aceptan fechas reales en `AAAA-MM-DD` o `DD/MM/AAAA`; las respuestas usan ISO. La hora usa `HH:mm`. `medicoId` debe ser un número entero positivo, apuntar a un médico existente y disponible y coincidir con su especialidad. No se permite eliminar un médico con turnos ni cambiar su especialidad mientras tenga turnos asociados. Es posible marcarlo como no disponible para impedir nuevas reservas, conservando las existentes.

Las especialidades siguen los ejemplos de la consigna: `Clínica médica`, `Pediatría`, `Odontología`, `Nutrición`. También se admite Title Case (`Clínica Médica`) y PascalCase (`ClínicaMédica`). Se rechazan las mayúsculas completas y la inicial minúscula en el body. No se restringe a una lista cerrada de especialidades.

La normalización flexible de datos crudos se conserva para el JSON inicial; las peticiones HTTP usan los tipos estrictos definidos con Zod.

### Filtros por query params

```text
GET /turnos?especialidad=Pediatria&fecha=14/08/2026
GET /turnos?medicoId=1
GET /turnos?especialidad=Pediatría&fecha=2026-08-14&medicoId=1
GET /medicos?especialidad=Odontologia&disponible=true
GET /medicos?disponible=false
```

Los filtros se combinan con AND en los servicios. La especialidad se compara ignorando acentos, mayúsculas y espacios. `disponible` solo admite `true` o `false`, sin convertir `false` en verdadero. Un filtro válido sin coincidencias devuelve `200` y `[]`. Se rechazan filtros desconocidos, valores vacíos, parámetros repetidos y fechas inexistentes con 400.

### Error uniforme

```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "documento",
      "message": "Invalid input: expected string, received number",
      "code": "invalid_type"
    }
  ]
}
```

Los mensajes internos de Zod pueden variar por versión. Cada issue indica el campo y el motivo. El formato también se aplica a JSON mal formado, rutas inexistentes, errores de negocio y errores internos; las respuestas 500 no exponen trazas. Middleware valida antes de ejecutar controladores; los servicios no manipulan Request ni Response.

## Pruebas en Postman

1. Iniciar el servidor con `npm run dev`.
2. Importar `turnos-red.postman_collection.json` y `postman/turnos-red.postman_environment.json`.
3. Seleccionar el entorno **TurnosRed local API 2**.
4. Abrir Runner y ejecutar solo la carpeta **API local — flujo automatizado**, en orden y con una iteración.
5. Revisar que las aserciones aparezcan en Pass. Los scripts guardan `medicoId` y `turnoId` en el entorno; no hay que copiarlos manualmente.

La carpeta contiene 34 solicitudes que cubren CRUD, contratos JSON, códigos 200/201/204/400/404, filtros combinados, `disponible=false`, validación de documentos, fechas y horas, PUT completo y relaciones entre recursos. Finaliza eliminando los datos creados. Ejecutar en una instancia recién iniciada con datos de ejemplo para conservar los escenarios que usan al médico 3 como no disponible.

Cada solicitud tiene una Saved Response. La colección anterior en `postman/TurnosRed.postman_collection.json` se conserva como referencia de API 1; para esta actividad usar la nueva colección de la raíz.

### Mock Server de Postman

1. Importar la colección y crear un Mock Server desde ella mediante la opción de Postman **Mock collection** o **Create mock server**.
2. Elegir un mock público para esta práctica con datos ficticios. Copiar la URL que asigna Postman a `mockUrl` en el entorno.
3. Ejecutar únicamente la carpeta **Mock Server — ejemplos estáticos**. Las rutas usan IDs fijos 9001 y 9002 y el header `x-mock-response-name` selecciona cada ejemplo, incluidos los errores.
4. Capturar la URL del mock, la respuesta y los tests en verde.

El mock simula el contrato con respuestas guardadas; no persiste datos ni ejecuta Zod. Las pruebas reales de validación se ejecutan contra `baseUrl`. No ejecutar ambas carpetas juntas: cada una tiene un destino diferente.

También puede ejecutarse el flujo local por consola con Newman instalado aparte:

```bash
npx newman run turnos-red.postman_collection.json -e postman/turnos-red.postman_environment.json --folder "API local — flujo automatizado"
node scripts/http-errors.test.mjs
```

## Eventos conservados de API 1

Abrir http://localhost:3000/eventos.html. La creación emite `turno:nuevo`, la actualización `turno:actualizado` y la eliminación `turno:eliminado`. Las notificaciones se emiten después de modificar los datos.

## Uso de Inteligencia Artificial

Se utilizó ChatGPT con Codex para asistir en la ampliación. La tabla registra las instrucciones de trabajo y los resultados producidos. Los ajustes indicados fueron realizados durante la asistencia de Codex; no se atribuyen al estudiante revisiones manuales que todavía no realizó. Antes de entregar, el estudiante debe revisar los archivos, ejecutar las pruebas y añadir cualquier ajuste que realmente aplique.

| Tarea                  | Herramienta     | Prompt                                                                                                                                                       | Respuesta generada                                          | Ajuste manual aplicado                                                                         |
| ---------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Continuidad de API 1   | ChatGPT / Codex | «Con la información que veníamos trabajando del material de estudio tanto como con las API, necesito ahora hacer la API 2» y archivos Actividad 2 y Módulo 2 | Revisión del repositorio TurnosRed y desglose de requisitos | Pendiente de revisión por el estudiante; Codex conservó Socket.IO y carga inicial              |
| Schemas Zod            | ChatGPT / Codex | Consigna 3 adjunta: definir esquemas de Turno y Médico con documento string y especialidades Title Case / PascalCase                                         | `turno.schema.ts`, `medico.schema.ts` y schemas comunes     | Codex añadió validación de calendario y booleanos estrictos; revisión del estudiante pendiente |
| Errores y arquitectura | ChatGPT / Codex | Consigna 1 adjunta: unificar errores con status, message, code y details y carpetas inglesas                                                                 | Middleware `validate`, `errorHandler` y clase `ApiError`    | Codex guardó query validada en `res.locals` por el getter de Express 5 y corrigió DELETE a 204 |
| Médicos y filtros      | ChatGPT / Codex | Consignas 2 y 4 adjuntas: CRUD /medicos y filtros de turnos y médicos                                                                                        | Rutas, controladores y servicios con relación `medicoId`    | Codex añadió protección de médicos con turnos y comparación de especialidades sin acentos      |
| Colección Postman      | ChatGPT / Codex | Consigna 5 adjunta: variables, scripts, casos exitosos y errores y Saved Responses                                                                           | Colección con flujo local y carpeta mock                    | Codex separó mock estático del flujo real y encadenó IDs mediante variables de entorno         |
| Documentación          | ChatGPT / Codex | Consigna 6 adjunta: requisitos, instalación, entorno, endpoints y registro de IA                                                                             | README y guía de evidencias                                 | Pendiente de añadir capturas reales y registrar los ajustes que aplique el estudiante          |

## Evidencias para la entrega

Ver `evidencias/API2-LEEME.md`. Se entrega el repositorio con `src/`, README, `.env.example`, colección JSON y un documento PDF o Word de máximo cinco páginas con capturas reales de Postman. El proyecto y las pruebas por consola no reemplazan las capturas de la aplicación ni la evidencia contra un Mock Server real.
