export interface Notificacion {
  id: string;
  userId: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  tipo: 'reserva' | 'cancelacion';
  viajeId: string;
} 