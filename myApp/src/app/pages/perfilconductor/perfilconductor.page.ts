import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-perfilconductor',
  templateUrl: './perfilconductor.page.html',
  styleUrls: ['./perfilconductor.page.scss'],
})
export class PerfilconductorPage implements OnInit {
  nombreUsuario: string = '';
  apellidoUsuario: string = '';

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private firestore: AngularFirestore
  ) {}

  async ngOnInit() {
    await this.cargarDatosUsuario();
  }

  private async cargarDatosUsuario() {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        const userDoc = await this.firestore.collection('usuarios').doc(user.uid).get().toPromise();
        const userData = userDoc?.data() as any;
        if (userData) {
          this.nombreUsuario = userData.nombre || '';
          this.apellidoUsuario = userData.apellido || '';
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
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
