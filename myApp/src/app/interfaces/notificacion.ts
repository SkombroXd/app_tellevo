import firebase from 'firebase/compat/app';

export interface Notificacion {
  id: string;
  userId: string;
  mensaje: string;
  fecha: firebase.firestore.Timestamp | string;
  fechaNotificacion: firebase.firestore.Timestamp | string;
  horaSalida?: string;
  leida: boolean;
  nombrePasajero: string;
  destino: string;
  viajeId: string;
} 
