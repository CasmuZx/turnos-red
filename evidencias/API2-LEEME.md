# Evidencias de Actividad 2

Preparar un documento de máximo cinco páginas con capturas reales, sin portada independiente que consuma una página. Indicar Santiago Casmuz, Integraciones web y API 2 al inicio.

1. **CRUD de médicos:** POST con 201 y GET del médico creado con 200. Mostrar método, URL, body enviado y respuesta.
2. **Turnos y relación:** POST turno con medicoId, PUT completo con 200 y DELETE con 204 sin cuerpo. Capturar antes de que Runner elimine los datos o usar las respuestas guardadas del run.
3. **Validaciones y errores:** solicitud 17 (documento numérico) con 400, VALIDATION_ERROR y details.documento; solicitud 24 con 404 y formato uniforme.
4. **Filtros y automatización:** solicitud 15 con especialidad, fecha y medicoId y resultado filtrado; solicitud 06 con disponible=false. Agregar resumen de Runner con tests en verde.
5. **Mock Server:** mostrar petición hacia la URL real asignada por Postman y respuesta 200 o 201 con los tests en Pass. Incluir nombre del mock o configuración si cabe.

Recomendación: dos o tres capturas legibles por página, con una frase que describa lo probado. No presentar Saved Responses locales como ejecución contra un mock real.

Las capturas todavía deben tomarse en Postman. Cuando estén disponibles se puede armar el PDF o Word final.
