import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Platform } from '@ionic/angular';
import { Network } from '@capacitor/network';
import type { PluginListenerHandle } from '@capacitor/core';

@Component({
  selector: 'app-tipocuenta',
  templateUrl: './tipocuenta.page.html',
  styleUrls: ['./tipocuenta.page.scss'],
})
export class TipocuentaPage implements OnInit, OnDestroy {
  offlineError = false;
  isRetrying = false;
  private networkListener: PluginListenerHandle | undefined;
  private isOffline = false;
  optionsEnabled = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private platform: Platform
  ) { }

  async ngOnInit() {
    const status = await Network.getStatus();
    this.isOffline = !status.connected;

    this.networkListener = await Network.addListener('networkStatusChange', status => {
      console.log('Estado de red cambiado:', status);
      this.isOffline = !status.connected;
    });
  }

  async seleccionarTipoCuenta(esConductor: boolean) {
    if (this.offlineError) {
      return;
    }

    const status = await Network.getStatus();
    if (!status.connected) {
      this.offlineError = true;
      this.optionsEnabled = false;
      return;
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
      this.optionsEnabled = false;
    }
  }

  async reloadNet() {
    this.isRetrying = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const status = await Network.getStatus();
      if (!status.connected) {
        throw new Error('Sin conexión');
      }

      const credentials = this.authService.getStoredCredentials();
      if (!credentials) {
        throw new Error('No hay credenciales almacenadas');
      }

      await this.authService.login(credentials.email, credentials.password);
      
      this.offlineError = false;
      this.optionsEnabled = true;
      window.location.reload();
      
    } catch (error) {
      console.error('Error al reconectar:', error);
      this.offlineError = true;
      this.optionsEnabled = false;
    } finally {
      this.isRetrying = false;
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}


