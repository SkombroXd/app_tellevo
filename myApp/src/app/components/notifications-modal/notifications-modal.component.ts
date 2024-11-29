import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Notificacion } from '../../interfaces/notificacion';

@Component({
  selector: 'app-notifications-modal',
  template: `
    <ion-header>
      <ion-toolbar color="dark">
        <ion-title>Notificaciones</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" color="dark">
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
    .notifications-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .notification-item {
      background-color: #2a2a2a;
      border-radius: 8px;
      padding: 15px;
      border-left: 3px solid #4285f4;
      transition: background-color 0.2s ease;
    }

    .notification-item.unread {
      background-color: #333333;
    }

    .notification-content {
      color: white;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .notification-hora {
      color: #4285f4;
      font-size: 13px;
      margin-bottom: 8px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .notification-time {
      color: #888;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    ion-icon {
      font-size: 16px;
    }

    .error {
      color: #ff4444;
    }
  `]
})
export class NotificationsModalComponent implements OnInit {
  @Input() notificaciones: Notificacion[] = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    console.log('Notificaciones recibidas en el modal:', this.notificaciones);
    this.notificaciones = this.notificaciones.sort((a, b) => {
      const fechaA = a.fecha?.toDate?.() || new Date(0);
      const fechaB = b.fecha?.toDate?.() || new Date(0);
      return fechaB.getTime() - fechaA.getTime();
    });
    
    // Verificar que cada notificación tiene horaSalida
    this.notificaciones.forEach((n, index) => {
      console.log(`Notificación ${index} - horaSalida:`, n.horaSalida);
    });
  }

  formatDate(timestamp: any): string {
    try {
      if (timestamp && timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error al formatear fecha:', error);
    }
    return 'Fecha no disponible';
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
} 






