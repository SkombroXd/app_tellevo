// src/app/services/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from } from 'rxjs';
import { map, take, tap, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth, 
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      take(1),
      switchMap(user => {
        return from(this.authService.getCurrentUser()).pipe(
          map(currentUser => {
            const storedUser = this.authService.getStoredUser();
            if (!navigator.onLine && storedUser) {
              return true;
            }
            
            const isAuthenticated = !!(currentUser && storedUser);
            
            if (!isAuthenticated) {
              console.log('No autenticado - Redirigiendo a login');
              this.router.navigate(['/login']);
              return false;
            }
            
            return true;
          })
        );
      }),
      tap(isAuth => {
        if (!isAuth) {
          console.log('Guard: Acceso denegado');
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
