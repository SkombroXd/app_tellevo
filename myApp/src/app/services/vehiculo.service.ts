import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Vehiculo } from '../interfaces/vehiculo';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private vehiculosCollection = 'vehiculos';
  private usuariosCollection = 'usuarios';

  constructor(private firestore: AngularFirestore) { }

  async agregarVehiculo(vehiculo: Vehiculo) {
    try {
      // Crear nuevo vehículo
      const id = this.firestore.createId();
      const nuevoVehiculo = { ...vehiculo, id };
      await this.firestore.collection(this.vehiculosCollection).doc(id).set(nuevoVehiculo);

      // Actualizar tipocuenta del usuario a true (conductor)
      await this.firestore.collection(this.usuariosCollection)
        .doc(vehiculo.userId)
        .update({ tipocuenta: true });

      return nuevoVehiculo;
    } catch (error) {
      console.error('Error al agregar vehículo:', error);
      throw error;
    }
  }

  obtenerVehiculosPorUsuario(userId: string): Observable<Vehiculo[]> {
    return this.firestore.collection<Vehiculo>(this.vehiculosCollection, 
      ref => ref.where('userId', '==', userId)).valueChanges();
  }
} 