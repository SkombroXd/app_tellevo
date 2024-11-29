import { Component, OnInit } from '@angular/core';
import { Vehiculo } from '../../interfaces/vehiculo';
import { VehiculoService } from '../../services/vehiculo.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-datosvehiculo',
  templateUrl: './datosvehiculo.page.html',
  styleUrls: ['./datosvehiculo.page.scss'],
})
export class DatosvehiculoPage implements OnInit {
  vehiculo: Vehiculo = {
    id: '',
    userId: '',
    patente: '',
    marca: '',
    modelo: '',
    color: '',
    estado: true
  };

  constructor(
    private vehiculoService: VehiculoService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getCurrentUser();
  }

  private async getCurrentUser() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.vehiculo.userId = user.uid;
    }
  }

  async agregarVehiculo() {
    if (!this.validarDatos()) {
      return;
    }

    try {
      await this.vehiculoService.agregarVehiculo(this.vehiculo);
      await this.mostrarAlerta('Éxito', 'Vehículo agregado correctamente. Ahora eres conductor.');
      this.router.navigate(['/tabsc/homec']);
    } catch (error) {
      console.error('Error:', error);
      await this.mostrarAlerta('Error', 'No se pudo agregar el vehículo');
    }
  }

  private validarDatos(): boolean {
    if (!this.vehiculo.patente || !this.vehiculo.marca || 
        !this.vehiculo.modelo || !this.vehiculo.color) {
      this.mostrarAlerta('Error', 'Por favor complete todos los campos');
      return false;
    }
    return true;
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






