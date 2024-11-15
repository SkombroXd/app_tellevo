import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Viaje } from '../interfaces/viaje'; // Tu interfaz de viajes

@Injectable({
  providedIn: 'root',
})
export class ViajeService {
  private viajesCollection = 'viajes'; // Nombre de la colección en Firestore

  constructor(private firestore: AngularFirestore) {}

  agregarViaje(viaje: Viaje) {
    return this.firestore.collection<Viaje>(this.viajesCollection).doc(viaje.id).set(viaje);
  }

  generarId(): string {
    return this.firestore.createId(); // Método de AngularFirestore para crear IDs únicos
  }

  obtenerViajes() {
    return this.firestore.collection<Viaje>(this.viajesCollection).valueChanges({ idField: 'id' });
  }

  actualizarViaje(viaje: Viaje) {
    return this.firestore.collection<Viaje>(this.viajesCollection).doc(viaje.id).update(viaje);
  }
}
