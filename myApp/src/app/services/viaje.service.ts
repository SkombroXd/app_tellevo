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
    return this.firestore.collection<Viaje>(this.viajesCollection).add(viaje);
  }

  obtenerViajes() {
    return this.firestore.collection<Viaje>(this.viajesCollection).valueChanges();
  }
}
