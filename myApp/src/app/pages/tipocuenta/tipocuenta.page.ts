import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-tipocuenta',
  templateUrl: './tipocuenta.page.html',
  styleUrls: ['./tipocuenta.page.scss'],
})
export class TipocuentaPage implements OnInit {
  offlineError = false;
  isRetrying = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
    // Verificar estado de conexión al iniciar
    this.checkConnection();
  }

  private checkConnection() {
    this.offlineError = !navigator.onLine;
  }

  async seleccionarTipoCuenta(esConductor: boolean) {
    this.checkConnection();
    
    if (this.offlineError) {
      return; // No hacer nada si está offline
    }

    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        await this.firestore.collection('usuarios').doc(user.uid).update({
          tipocuenta: esConductor
        });

        if (esConductor) {
          this.router.navigate(['/datosvehiculo']);
        } else {
          this.router.navigate(['/tabs/home']);
        }
      }
    } catch (error) {
      console.error('Error al seleccionar tipo de cuenta:', error);
      this.offlineError = true;
    }
  }

  async reloadNet() {
    this.isRetrying = true;
    
    try {
      // Mostrar spinner por 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar conexión
      if (!navigator.onLine) {
        throw new Error('Sin conexión');
      }

      // Obtener credenciales almacenadas
      const credentials = this.authService.getStoredCredentials();
      if (!credentials) {
        throw new Error('No hay credenciales almacenadas');
      }

      // Intentar login online
      await this.authService.login(credentials.email, credentials.password);
      
      // Si el login es exitoso, ocultar error
      this.offlineError = false;
      
    } catch (error) {
      console.error('Error al reconectar:', error);
      this.offlineError = true;
    } finally {
      this.isRetrying = false;
    }
  }
}


