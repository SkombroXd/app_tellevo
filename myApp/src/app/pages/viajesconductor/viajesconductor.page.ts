import { Component, OnInit } from '@angular/core';
import { ViajeService } from '../../services/viaje.service';
import { AuthService } from '../../services/auth.service';
import { Viaje } from '../../interfaces/viaje';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-viajesconductor',
  templateUrl: './viajesconductor.page.html',
  styleUrls: ['./viajesconductor.page.scss'],
})
export class ViajesconductorPage implements OnInit {
  viajesPublicados: Viaje[] = [];
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
      this.viajeService.obtenerViajesPorConductor(this.userId).subscribe(
        (viajes) => {
          this.viajesPublicados = viajes;
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
