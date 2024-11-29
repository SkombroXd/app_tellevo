import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-perfilpasajero',
  templateUrl: './perfilpasajero.page.html',
  styleUrls: ['./perfilpasajero.page.scss'],
})
export class PerfilpasajeroPage implements OnInit {

  constructor(
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, cerrar sesión',
          handler: async () => {
            try {
              await this.authService.logout();
            } catch (error) {
              this.mostrarError('Error al cerrar sesión');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

}
