import firebase from 'firebase/compat/app';

export interface Notificacion {
  id: string;
  userId: string;
  mensaje: string;
  fecha?: firebase.firestore.Timestamp;
  fechaNotificacion: firebase.firestore.Timestamp;
  horaSalida?: string;
  leida: boolean;
  nombrePasajero: string;
  destino: string;
  viajeId: string;
} 