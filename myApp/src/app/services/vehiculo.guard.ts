import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { VehiculoService } from './vehiculo.service';
import { AuthService } from './auth.service';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class VehiculoGuard implements CanActivate {
  constructor(
    private vehiculoService: VehiculoService,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return from([false]);
        }
        
        return from(this.firestore.collection('usuarios').doc(user.uid).get().toPromise()).pipe(
          switchMap(userDoc => {
            const userData = userDoc.data() as { tipocuenta: boolean };
            
            if (!userData?.tipocuenta) {
              // Si no es conductor, redirigir a tabs
              this.router.navigate(['/tabs/home']);
              return from([false]);
            }

            return from(this.vehiculoService.tieneVehiculo(user.uid)).pipe(
              map(tieneVehiculo => {
                if (tieneVehiculo) {
                  // Si ya tiene vehículo, redirigir a la página del conductor
                  this.router.navigate(['/tabsc/homec']);
                  return false;
                }
                // Si no tiene vehículo, permitir acceso a la página de datos de vehículo
                return true;
              })
            );
          })
        );
      })
    );
  }
} 