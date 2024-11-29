import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Viaje } from '../interfaces/viaje';
import { Observable, map, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { NotificacionService } from './notificacion.service';
import { Notificacion } from '../interfaces/notificacion';
import firebase from 'firebase/compat/app';

interface Reserva {
  id: string;
  viajeId: string;
  userId: string;
  fecha: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ViajeService {
  private viajesCollection = 'viajes';
  private reservasCollection = 'reservas';

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private notificacionService: NotificacionService
  ) {}

  agregarViaje(viaje: Viaje) {
    return this.firestore.collection<Viaje>(this.viajesCollection).doc(viaje.id).set(viaje);
  }

  generarId(): string {
    return this.firestore.createId();
  }

  obtenerViajes() {
    const ahora = new Date();
    return this.firestore.collection<Viaje>(this.viajesCollection)
      .valueChanges({ idField: 'id' })
      .pipe(
        map(viajes => {
          return viajes.filter(viaje => {
            const fechaViaje = new Date(`${viaje.fecha} ${viaje.hora}`);
            return fechaViaje >= ahora;
          }).sort((a, b) => {
            const fechaA = new Date(`${a.fecha} ${a.hora}`);
            const fechaB = new Date(`${b.fecha} ${b.hora}`);
            return fechaA.getTime() - fechaB.getTime();
          });
        })
      );
  }

  actualizarViaje(viaje: Viaje) {
    return this.firestore.collection<Viaje>(this.viajesCollection).doc(viaje.id).update(viaje);
  }

  async verificarReservaExistente(viajeId: string, userId: string): Promise<boolean> {
    const reservas = await this.firestore
      .collection(this.reservasCollection, ref => 
        ref.where('viajeId', '==', viajeId)
           .where('userId', '==', userId)
      )
      .get()
      .toPromise();

    return !reservas?.empty;
  }

  async reservarViaje(viaje: Viaje) {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const pasajeroDoc = await this.firestore.collection('usuarios').doc(user.uid).get().toPromise();
      const pasajeroData = pasajeroDoc?.data() as any;
      const nombrePasajero = `${pasajeroData.nombre} ${pasajeroData.apellido}`;

      await this.firestore.collection('reservas').add({
        userId: user.uid,
        viajeId: viaje.id,
        fecha: firebase.firestore.Timestamp.now()
      });

      const timestamp = firebase.firestore.Timestamp.now();
      const notificacion: Omit<Notificacion, 'id'> = {
        userId: viaje.userId!,
        mensaje: `${nombrePasajero} ha reservado un asiento para el viaje a ${viaje.destino}`,
        fecha: timestamp,
        fechaNotificacion: timestamp,
        horaSalida: viaje.hora,
        leida: false,
        nombrePasajero: nombrePasajero,
        destino: viaje.destino,
        viajeId: viaje.id
      };

      if (!viaje.hora) {
        console.warn('Advertencia: El viaje no tiene hora especificada');
      }

      console.log('Creando notificación:', notificacion);
      await this.notificacionService.crearNotificacion(notificacion);
      return true;
    } catch (error) {
      console.error('Error al reservar viaje:', error);
      throw error;
    }
  }

  async verificarViajeExistente(userId: string, fecha: string, hora: string): Promise<boolean> {
    const viajes = await this.firestore
      .collection<Viaje>(this.viajesCollection, ref => 
        ref.where('userId', '==', userId)
           .where('fecha', '==', fecha)
           .where('hora', '==', hora)
      )
      .get()
      .toPromise();

    return !viajes?.empty;
  }

  async agregarViajeConductor(viaje: Viaje): Promise<boolean> {
    const user = await this.authService.getCurrentUser();
    if (!user) return false;

    // Verificar si la fecha y hora son futuras
    const fechaViaje = new Date(`${viaje.fecha} ${viaje.hora}`);
    const ahora = new Date();
    
    if (fechaViaje <= ahora) {
      throw new Error('No puedes agregar viajes en fechas u horas pasadas');
    }

    // Verificar si ya existe un viaje a la misma hora
    const viajeExistente = await this.verificarViajeExistente(user.uid, viaje.fecha, viaje.hora);
    if (viajeExistente) {
      throw new Error('Ya tienes un viaje programado para esta fecha y hora');
    }

    // Agregar el ID del conductor al viaje
    viaje.userId = user.uid;
    
    await this.agregarViaje(viaje);
    return true;
  }

  obtenerViajesPorConductor(conductorId: string): Observable<Viaje[]> {
    return this.firestore.collection<Viaje>(this.viajesCollection, 
      ref => ref.where('userId', '==', conductorId)
    ).valueChanges({ idField: 'id' })
    .pipe(
      map(viajes => {
        return viajes.sort((a, b) => {
          const fechaA = new Date(`${a.fecha} ${a.hora}`);
          const fechaB = new Date(`${b.fecha} ${b.hora}`);
          return fechaB.getTime() - fechaA.getTime();
        });
      })
    );
  }

  async cancelarViaje(viajeId: string): Promise<void> {
    try {
      // Primero verificamos si hay reservas activas
      const reservas = await this.firestore
        .collection(this.reservasCollection)
        .ref.where('viajeId', '==', viajeId)
        .get();

      // Si hay reservas, las eliminamos
      const batch = this.firestore.firestore.batch();
      reservas.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Eliminamos el viaje
      batch.delete(this.firestore.collection(this.viajesCollection).doc(viajeId).ref);

      // Ejecutamos todas las operaciones
      await batch.commit();
    } catch (error) {
      console.error('Error al cancelar el viaje:', error);
      throw error;
    }
  }

  obtenerViajesPorPasajero(pasajeroId: string): Observable<Viaje[]> {
    return this.firestore.collection<Reserva>(this.reservasCollection, 
      ref => ref.where('userId', '==', pasajeroId)
    ).valueChanges({ idField: 'id' }).pipe(
      switchMap(reservas => {
        if (reservas.length === 0) return of([]);
        
        const viajeIds = reservas.map(r => r.viajeId);
        return this.firestore.collection<Viaje>(this.viajesCollection, 
          ref => ref.where('id', 'in', viajeIds)
        ).valueChanges({ idField: 'id' }).pipe(
          map(viajes => {
            return viajes.sort((a, b) => {
              const fechaA = new Date(`${a.fecha} ${a.hora}`);
              const fechaB = new Date(`${b.fecha} ${b.hora}`);
              return fechaB.getTime() - fechaA.getTime();
            });
          })
        );
      })
    );
  }
}
