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

  async crearNotificacion(notificacion: Notificacion) {
    try {
      const id = this.firestore.createId();
      await this.firestore.collection(this.notificacionesCollection)
        .doc(id)
        .set({ ...notificacion, id });
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