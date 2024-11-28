import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { VehiculoService } from './vehiculo.service';
import { AuthService } from './auth.service';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
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
      take(1),
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return of(false);
        }
        
        return from(this.firestore.collection('usuarios').doc(user.uid).get().toPromise()).pipe(
          switchMap(userDoc => {
            const userData = userDoc?.data() as { tipocuenta: boolean } | undefined;
            
            if (!userData?.tipocuenta) {
              this.router.navigate(['/tabs/home']);
              return of(false);
            }

            return from(this.vehiculoService.tieneVehiculo(user.uid)).pipe(
              map(tieneVehiculo => {
                if (tieneVehiculo) {
                  this.router.navigate(['/tabsc/homec']);
                  return false;
                }
                return true;
              })
            );
          })
        );
      })
    );
  }
} 