# TurnosRed

Este proyecto es un backend para administrar turnos médicos. Lee los turnos desde un archivo JSON, corrige los distintos formatos y permite consultarlos o modificarlos mediante una API REST. También usa Socket.IO para avisar los cambios en tiempo real.

La configuración de los puntos 1, 3 y 4 está en `.nvmrc`, `package.json`, `eslint.config.js` y `tsconfig.json`. El punto 10 corresponde a este README.

## Requisitos previos

- Git
- NVM
- Node.js 22 LTS
- npm
- Postman o un cliente HTTP parecido

## Instalación

```bash
cd turnos-red
nvm install
nvm use
npm install
cp .env.example .env
npm run dev
```

En Windows PowerShell, si `cp` no está disponible, usar:

```powershell
Copy-Item .env.example .env
```

La API queda disponible, de manera predeterminada, en `http://localhost:3000`.

## Variables de entorno

| Variable    | Descripción                                                      | Ejemplo              |
| ----------- | ---------------------------------------------------------------- | -------------------- |
| `PORT`      | Puerto HTTP del servidor                                         | `3000`               |
| `DATA_FILE` | Ruta al JSON inicial, relativa a la raíz del proyecto o absoluta | `./data/turnos.json` |

El archivo `.env` tiene la configuración local y no se sube a Git ni se incluye en la entrega. El archivo `.env.example` sirve como ejemplo y debe copiarse como `.env` antes de iniciar el proyecto.

## Scripts npm

| Script                 | Función                                     |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Inicia el proyecto en modo desarrollo.      |
| `npm run build`        | Compila el código y crea la carpeta `dist`. |
| `npm start`            | Ejecuta el proyecto ya compilado.           |
| `npm run lint`         | Busca errores de escritura en el código.    |
| `npm run format`       | Ordena el formato del código con Prettier.  |
| `npm run format:check` | Comprueba el formato sin cambiar archivos.  |

## Estructura

```text
turnos-red/
├── data/
│   └── turnos.json
├── src/
│   ├── config/       # Configuración del .env
│   ├── controllers/  # Recibe las peticiones HTTP
│   ├── events/       # Eventos internos
│   ├── models/       # Interfaces de los turnos
│   ├── routes/       # Rutas de Express
│   ├── services/     # Lógica y normalización
│   ├── socket/       # Eventos enviados con Socket.IO
│   ├── utils/        # Ejemplo con callbacks
│   ├── app.ts        # Configuración de la aplicación
│   └── server.ts     # Inicio del servidor
├── .env.example
├── .nvmrc
├── eslint.config.js
├── package.json
└── tsconfig.json
```

El servidor carga `turnos.json` de forma asíncrona con `node:fs/promises`. Cada registro pasa por la normalización; al iniciar se informa por consola la cantidad aceptada y rechazada. Los cambios realizados por la API se conservan en memoria durante la ejecución.

## API REST

| Método | Ruta          | Resultado exitoso        | Errores principales |
| ------ | ------------- | ------------------------ | ------------------- |
| GET    | `/turnos`     | `200`: listado           | `500`               |
| GET    | `/turnos/:id` | `200`: turno             | `400`, `404`, `500` |
| POST   | `/turnos`     | `201`: turno creado      | `400`, `500`        |
| PUT    | `/turnos/:id` | `200`: turno actualizado | `400`, `404`, `500` |
| DELETE | `/turnos/:id` | `200`: turno eliminado   | `400`, `404`, `500` |

Ejemplo para crear un turno (el `id` es opcional; si se omite, se genera):

```json
{
  "paciente": "Paciente Ejemplo",
  "documento": 10000000,
  "especialidad": "nutrición",
  "fecha": "20/08/2026",
  "hora": "14.30",
  "confirmado": "sí",
  "observaciones": "Primera consulta"
}
```

Se aceptan fechas `DD/MM/AAAA` o `AAAA-MM-DD` y se almacenan como `AAAA-MM-DD`. Las horas se aceptan con punto o dos puntos y se almacenan como `HH:mm`. El campo `confirmado` admite booleanos, `si`/`sí`, `no`, `true`/`false` y `1`/`0`.

## Eventos

Cuando se crea, actualiza o elimina un turno, `EventEmitter` genera un evento interno. Socket.IO recibe ese evento y se lo manda a los clientes conectados:

| Evento interno      | Evento Socket.IO    | Datos enviados    |
| ------------------- | ------------------- | ----------------- |
| `turno:creado`      | `turno:nuevo`       | Turno creado      |
| `turno:actualizado` | `turno:actualizado` | Turno actualizado |
| `turno:eliminado`   | `turno:eliminado`   | Turno eliminado   |

Ejemplo mínimo de cliente:

```html
<script src="http://localhost:3000/socket.io/socket.io.js"></script>
<script>
  const socket = io('http://localhost:3000');
  socket.on('turno:nuevo', (turno) => console.log('Nuevo:', turno));
  socket.on('turno:actualizado', (turno) => console.log('Actualizado:', turno));
  socket.on('turno:eliminado', (turno) => console.log('Eliminado:', turno));
</script>
```

## Verificación antes de entregar

```bash
npm run format
npm run lint
npm run build
npm start
```

Luego se pueden probar los endpoints desde Postman. Enviar `Content-Type: application/json` en las solicitudes POST y PUT.

## Capturas para la entrega

El proyecto incluye una colección en `postman/TurnosRed.postman_collection.json`. Se importa desde Postman y se ejecutan las cinco peticiones en el orden en que aparecen.

Para depurar en VS Code:

1. Abrir `src/services/turnos.service.ts` y colocar un punto de interrupción dentro de `crear`.
2. Entrar en **Ejecutar y depurar**.
3. Elegir **Depurar TurnosRed** y presionar el botón de inicio.
4. Enviar el POST desde Postman y sacar la captura cuando VS Code se detenga.

Para comprobar Socket.IO:

1. Iniciar el servidor con `npm run dev`.
2. Abrir `http://localhost:3000/eventos.html` en el navegador.
3. Enviar el POST, PUT o DELETE desde Postman.
4. Sacar una captura cuando el evento aparezca en la página.

Las imágenes se pueden guardar dentro de la carpeta `evidencias` siguiendo los nombres indicados en `evidencias/LEEME.md`.
