import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalController, Platform } from '@ionic/angular';

import { Notificacion } from '../../interfaces/notificacion';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

@Component({

  selector: 'app-notifications-modal',

  template: `

    <ion-header>

      <ion-toolbar>

        <ion-title>Notificaciones</ion-title>

        <ion-buttons slot="end">

          <ion-button (click)="dismiss()">

            <ion-icon name="close"></ion-icon>

          </ion-button>

        </ion-buttons>

      </ion-toolbar>

    </ion-header>

    <ion-content class="ion-padding">

      <div class="notifications-container">

        <div *ngFor="let notificacion of notificaciones" 

             class="notification-item"

             [class.unread]="!notificacion.leida">

          <div class="notification-content">

            {{ notificacion.mensaje }}

          </div>

          <div class="notification-hora">

            <ion-icon name="time-outline"></ion-icon>

            Hora de salida: {{ notificacion.horaSalida || 'No disponible' }}

          </div>

          <div class="notification-time">

            <ion-icon name="calendar-outline"></ion-icon>

            Notificación recibida el {{ formatDate(notificacion.fecha) }}

          </div>

        </div>

      </div>

    </ion-content>

  `,

  styles: [`

    :host {

      --background-color: var(--ion-background-color);

      --text-color: var(--ion-text-color);

      --item-background: var(--ion-item-background);

      --border-color: var(--ion-color-primary);

    }



    ion-content {

      --background: var(--background-color);

    }



    .notifications-container {

      display: flex;

      flex-direction: column;

      gap: 12px;

    }



    .notification-item {

      background-color: var(--item-background);

      border-radius: 8px;

      padding: 15px;

      border-left: 3px solid var(--border-color);

      transition: all 0.3s ease;

      margin-bottom: 8px;

      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    }



    .notification-item.unread {

      background-color: rgba(var(--ion-color-primary-rgb), 0.1);

    }



    .notification-content {

      color: var(--text-color);

      font-size: 14px;

      line-height: 1.4;

      margin-bottom: 12px;

    }



    .notification-hora {

      color: var(--ion-color-primary);

      font-size: 13px;

      margin-bottom: 8px;

      font-weight: 500;

      display: flex;

      align-items: center;

      gap: 5px;

    }



    .notification-time {

      color: var(--ion-color-medium);

      font-size: 12px;

      display: flex;

      align-items: center;

      gap: 5px;

    }



    ion-icon {

      font-size: 16px;

    }



    @media (prefers-color-scheme: dark) {

      .notification-item {

        box-shadow: 0 2px 4px rgba(0,0,0,0.3);

      }

    }

  `]

})

export class NotificationsModalComponent implements OnInit, OnDestroy {

  @Input() notificaciones: Notificacion[] = [];

  private destroy$ = new Subject<void>();

  private fechasFormateadas = new Map<string, string>();



  constructor(private modalCtrl: ModalController, private platform: Platform) {}



  ngOnInit() {

    console.log('Notificaciones recibidas en el modal:', this.notificaciones);

    this.notificaciones.forEach(n => {

      console.log('Fecha de notificación:', n.fecha);

      console.log('Fecha formateada:', this.formatDate(n.fecha));

    });

    

    this.notificaciones = this.notificaciones.sort((a, b) => {

      const fechaA = this.getTimestamp(a.fecha);

      const fechaB = this.getTimestamp(b.fecha);

      return fechaB - fechaA;

    });

    

    this.notificaciones.forEach((n, index) => {

      console.log(`Notificación ${index} - horaSalida:`, n.horaSalida);

    });

  }



  formatDate(timestamp: any): string {

    const key = timestamp instanceof firebase.firestore.Timestamp ? 

      timestamp.toDate().toISOString() : 

      timestamp.toString();



    if (this.fechasFormateadas.has(key)) {

      return this.fechasFormateadas.get(key);

    }



    let fechaFormateada: string;

    try {

      if (!timestamp) {

        console.log('Fecha vacía recibida');

        return 'Fecha no disponible';

      }

      

      console.log('Formateando fecha:', timestamp);

      

      let date: Date;

      if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {

        date = new Date(timestamp.seconds * 1000);

      } else if (typeof timestamp === 'string') {

        date = new Date(timestamp);

      } else {

        date = new Date(timestamp);

      }

      

      if (isNaN(date.getTime())) {

        console.log('Fecha inválida:', timestamp);

        return 'Fecha no disponible';

      }



      fechaFormateada = new Intl.DateTimeFormat('es-ES', {

        year: 'numeric',

        month: '2-digit',

        day: '2-digit',

        hour: '2-digit',

        minute: '2-digit',

        hour12: false

      }).format(date);

    } catch (error) {

      console.error('Error al formatear fecha:', error, 'Fecha recibida:', timestamp);

      return 'Fecha no disponible';

    }



    this.fechasFormateadas.set(key, fechaFormateada);

    return fechaFormateada;

  }



  dismiss() {

    this.modalCtrl.dismiss();

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



  ngOnDestroy() {

    this.destroy$.next();

    this.destroy$.complete();

  }

} 














