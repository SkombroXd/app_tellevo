import { Component, OnInit } from '@angular/core';
import { ViajeService } from '../../services/viaje.service';
import { AuthService } from '../../services/auth.service';
import { Viaje } from '../../interfaces/viaje';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-viajespasajero',
  templateUrl: './viajespasajero.page.html',
  styleUrls: ['./viajespasajero.page.scss'],
})
export class ViajespasajeroPage implements OnInit {
  viajesReservados: Viaje[] = [];
  userId: string | undefined;

  constructor(
    private viajeService: ViajeService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.userId = user.uid;
      this.cargarViajes();
    }
  }

  cargarViajes() {
    if (this.userId) {
      this.viajeService.obtenerViajesPorPasajero(this.userId).subscribe(
        (viajes) => {
          this.viajesReservados = viajes;
        },
        (error) => {
          console.error('Error al cargar viajes:', error);
          this.mostrarAlerta('Error', 'No se pudieron cargar los viajes');
        }
      );
    }
  }

  private async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}
