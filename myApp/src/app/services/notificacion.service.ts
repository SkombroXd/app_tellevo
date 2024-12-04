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



          const fechaA = this.getTimestamp(a.fechaNotificacion || a.fecha);



          const fechaB = this.getTimestamp(b.fechaNotificacion || b.fecha);



          return fechaB - fechaA;



        });



      })



    );



  }







  private getTimestamp(date: any): number {



    if (date && typeof date === 'object' && 'seconds' in date) {



      return date.seconds * 1000;



    }



    if (typeof date === 'string') {



      return new Date(date).getTime();



    }



    return new Date(date).getTime();



  }







  async crearNotificacion(notificacion: Omit<Notificacion, 'id'>) {



    try {



      const id = this.firestore.createId();



      const notificacionConId = {



        ...notificacion,



        id,



        fecha: notificacion.fecha,



        fechaNotificacion: notificacion.fechaNotificacion



      };



      console.log('Guardando notificación:', notificacionConId);



      await this.firestore.collection('notificaciones').doc(id).set(notificacionConId);



      return id;



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


