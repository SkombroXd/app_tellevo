import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Notificacion } from '../interfaces/notificacion';
import { Observable, from, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { Viaje } from '../interfaces/viaje';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private notificacionesCollection = 'notificaciones';
  private viajesCollection = 'viajes';

  constructor(private firestore: AngularFirestore) { }

  obtenerNotificaciones(userId: string): Observable<Notificacion[]> {
    return this.firestore.collection<Notificacion>(
      this.notificacionesCollection,
      ref => ref.where('userId', '==', userId)
    ).valueChanges({ idField: 'id' }).pipe(
      switchMap(notificaciones => {
        // Obtener los viajes correspondientes a cada notificación
        const viajeObservables = notificaciones.map(notif => 
          this.firestore.collection(this.viajesCollection)
            .doc(notif.viajeId)
            .get()
            .pipe(
              map(doc => {
                const viajeData = doc.data() as Viaje | undefined;
                return {
                  ...notif,
                  horaSalida: viajeData?.hora || 'No disponible'
                };
              })
            )
        );

        return combineLatest(viajeObservables);
      }),
      map(notificaciones => {
        return notificaciones.sort((a, b) => {
          const fechaA = (a.fechaNotificacion || a.fecha)?.toDate?.() || new Date(0);
          const fechaB = (b.fechaNotificacion || b.fecha)?.toDate?.() || new Date(0);
          return fechaB.getTime() - fechaA.getTime();
        });
      })
    );
  }

  async crearNotificacion(notificacion: Omit<Notificacion, 'id'>) {
    try {
      const id = this.firestore.createId();
      const timestamp = firebase.firestore.Timestamp.now();
      const nuevaNotificacion = {
        ...notificacion,
        id,
        fecha: timestamp,
        fechaNotificacion: timestamp,
        leida: false,
        viajeId: notificacion.viajeId
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

  marcarComoLeida(notificacionId: string) {
    return this.firestore.collection(this.notificacionesCollection)
      .doc(notificacionId)
      .update({ leida: true });
  }
} 