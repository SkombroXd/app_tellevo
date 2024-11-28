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

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
  }

  async seleccionarTipoCuenta(esConductor: boolean) {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        // Actualizar el tipo de cuenta en Firestore
        await this.firestore.collection('usuarios').doc(user.uid).update({
          tipocuenta: esConductor
        });

        // Navegar a la ruta correspondiente
        if (esConductor) {
          this.router.navigate(['/datosvehiculo']);
        } else {
          this.router.navigate(['/tabs/home']);
        }
      }
    } catch (error) {
      console.error('Error al seleccionar tipo de cuenta:', error);
    }
  }
}
