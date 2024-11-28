import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Notificacion } from '../interfaces/notificacion';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private notificacionesCollection = 'notificaciones';

  constructor(private firestore: AngularFirestore) { }

  async crearNotificacion(notificacion: Omit<Notificacion, 'id'>) {
    try {
      const id = this.firestore.createId();
      const nuevaNotificacion = {
        ...notificacion,
        id,
        fecha: new Date(),
        leida: false
      };
      
      await this.firestore.collection(this.notificacionesCollection)
        .doc(id)
        .set(nuevaNotificacion);
        
      return nuevaNotificacion;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  obtenerNotificaciones(userId: string): Observable<Notificacion[]> {
    return this.firestore.collection<Notificacion>(
      this.notificacionesCollection,
      ref => ref.where('userId', '==', userId)
          .orderBy('fecha', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  marcarComoLeida(notificacionId: string) {
    return this.firestore.collection(this.notificacionesCollection)
      .doc(notificacionId)
      .update({ leida: true });
  }
} 