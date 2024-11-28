// home.page.ts
import { Component, OnInit } from '@angular/core';
import { ViajeService } from '../../services/viaje.service';
import { Viaje } from '../../interfaces/viaje';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  viajesDisponibles: Viaje[] = [];
  userId: string | undefined;

  constructor(
    private viajeService: ViajeService,
    private alertController: AlertController,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.userId = user.uid;
      this.obtenerViajesDisponibles();
    }
  }

  obtenerViajesDisponibles() {
    this.viajeService.obtenerViajes().subscribe((viajes) => {
      // Filtrar los viajes propios si el usuario está autenticado
      this.viajesDisponibles = viajes.filter(viaje => viaje.userId !== this.userId);
    });
  }

  async reservarViaje(viaje: Viaje) {
    try {
      // Verificar que no sea el propio viaje del conductor
      if (viaje.userId === this.userId) {
        await this.mostrarAlerta('Error', 'No puedes reservar tus propios viajes');
        return;
      }

      await this.viajeService.reservarViaje(viaje);
      await this.mostrarAlerta('Éxito', 'Viaje reservado correctamente');
    } catch (error) {
      await this.mostrarAlerta('Error', error instanceof Error ? error.message : 'No se pudo reservar el viaje');
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
