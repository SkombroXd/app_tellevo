import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Viaje } from '../interfaces/viaje';
import { Observable, map, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { NotificacionService } from './notificacion.service';
import { Notificacion } from '../interfaces/notificacion';

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

  async reservarViaje(viaje: Viaje): Promise<boolean> {
    const user = await this.authService.getCurrentUser();
    if (!user) return false;

    try {
      // Primero verificar si ya existe una reserva
      const reservaExistente = await this.verificarReservaExistente(viaje.id, user.uid);
      if (reservaExistente) {
        throw new Error('Ya tienes una reserva para este viaje');
      }

      // Verificar si hay asientos disponibles
      if (viaje.cantidadp <= 0) {
        throw new Error('No hay asientos disponibles para este viaje');
      }

      // Obtener datos del pasajero
      const pasajeroDoc = await this.firestore.collection('usuarios').doc(user.uid).get().toPromise();
      const pasajeroData = pasajeroDoc?.data() as any;
      const nombrePasajero = `${pasajeroData?.nombre} ${pasajeroData?.apellido}`;

      // Crear la reserva
      const reservaId = this.firestore.createId();
      const reserva = {
        id: reservaId,
        viajeId: viaje.id,
        userId: user.uid,
        nombrePasajero: nombrePasajero,
        fecha: new Date()
      };

      await this.firestore.collection(this.reservasCollection).doc(reservaId).set(reserva);
      
      // Actualizar cantidad de asientos
      viaje.cantidadp--;
      await this.actualizarViaje(viaje);

      // Crear notificación para el conductor
      const notificacion: Notificacion = {
        id: this.firestore.createId(),
        userId: viaje.userId!, // ID del conductor
        mensaje: `${nombrePasajero} ha reservado un asiento en tu viaje a ${viaje.destino}`,
        fecha: new Date(),
        leida: false,
        tipo: 'reserva',
        viajeId: viaje.id
      };

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
