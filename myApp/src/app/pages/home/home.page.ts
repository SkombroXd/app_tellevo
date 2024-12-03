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
  reservasUsuario: Set<string> = new Set();

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
      this.cargarReservasUsuario();
    }
  }

  private cargarReservasUsuario() {
    if (this.userId) {
      this.viajeService.obtenerReservasUsuario(this.userId).subscribe(reservas => {
        this.reservasUsuario = new Set(reservas.map(r => r.viajeId));
      });
    }
  }

  tieneReserva(viajeId: string): boolean {
    return this.reservasUsuario.has(viajeId);
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

      // Verificar si hay asientos disponibles
      if (viaje.cantidadp <= 0) {
        await this.mostrarAlerta('Error', 'No hay asientos disponibles para este viaje');
        return;
      }

      await this.viajeService.reservarViaje(viaje);
      await this.mostrarAlerta('Éxito', 'Viaje reservado correctamente');
    } catch (error: any) {
      let mensaje = 'No se pudo reservar el viaje';
      if (error.message === 'Ya tienes una reserva para este viaje') {
        mensaje = 'Ya tienes una reserva para este viaje';
      } else if (error.message === 'No hay asientos disponibles para este viaje') {
        mensaje = 'No hay asientos disponibles para este viaje';
      }
      await this.mostrarAlerta('Error', mensaje);
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
