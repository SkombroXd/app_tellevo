import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Usuario } from '../../interfaces/usuario';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  usuario: Usuario = {
    id: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    tipocuenta: false
  };

  confirmPassword: string = '';
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {}

  async register() {
    if (!this.validarDatos()) {
      return;
    }

    if (this.usuario.password !== this.confirmPassword) {
      await this.mostrarAlerta('Error', 'Las contraseñas no coinciden');
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.register(this.usuario);
      await this.mostrarAlerta('Éxito', 'Usuario registrado correctamente');
      this.router.navigate(['/tipocuenta']);
    } catch (error: any) {
      let mensaje = 'Error al registrar usuario';
      if (error.code === 'auth/email-already-in-use') {
        mensaje = 'El email ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'Email inválido';
      } else if (error.code === 'auth/weak-password') {
        mensaje = 'La contraseña es muy débil';
      }
      await this.mostrarAlerta('Error', mensaje);
    } finally {
      this.isLoading = false;
    }
  }

  private validarDatos(): boolean {
    if (!this.usuario.nombre || !this.usuario.apellido || 
        !this.usuario.email || !this.usuario.password || !this.confirmPassword) {
      this.mostrarAlerta('Error', 'Por favor complete todos los campos');
      return false;
    }

    if (this.usuario.password.length < 6) {
      this.mostrarAlerta('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
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






























