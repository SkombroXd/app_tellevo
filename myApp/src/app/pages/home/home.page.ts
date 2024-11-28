// home.page.ts
import { Component, OnInit } from '@angular/core';
import { ViajeService } from '../../services/viaje.service';
import { Viaje } from '../../interfaces/viaje';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  viajesDisponibles: Viaje[] = [];

  constructor(
    private viajeService: ViajeService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.obtenerViajesDisponibles();
  }

  obtenerViajesDisponibles() {
    this.viajeService.obtenerViajes().subscribe((viajes) => {
      this.viajesDisponibles = viajes;
    });
  }

  async reservarViaje(viaje: Viaje) {
    try {
      await this.viajeService.reservarViaje(viaje);
      this.mostrarAlerta('Éxito', 'Viaje reservado correctamente');
    } catch (error) {
      this.mostrarAlerta('Error', error instanceof Error ? error.message : 'No se pudo reservar el viaje');
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
