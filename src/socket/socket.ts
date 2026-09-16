import type { Server } from 'socket.io';
import { busEventos } from '../events/turnos.events.js';

export function configurarSocket(io: Server): void {
  // Punto 9: conexión y eventos de Socket.IO.
  io.on('connection', (socket) => {
    console.log(`Cliente conectado por Socket.IO: ${socket.id}`);
    socket.on('disconnect', () => console.log(`Cliente desconectado: ${socket.id}`));
  });

  busEventos.on('turno:creado', (turno) => io.emit('turno:nuevo', turno));
  busEventos.on('turno:actualizado', (turno) => io.emit('turno:actualizado', turno));
  busEventos.on('turno:eliminado', (turno) => io.emit('turno:eliminado', turno));
}
