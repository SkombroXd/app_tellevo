import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConductorGuard implements CanActivate {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return new Observable<boolean>(obs => obs.next(false));
        }
        
        return this.firestore.collection('usuarios').doc(user.uid).get().pipe(
          map(doc => {
            const userData = doc.data() as { tipocuenta: boolean };
            if (!userData?.tipocuenta) {
              this.router.navigate(['/tabs/home']);
              return false;
            }
            return true;
          })
        );
      })
    );
  }
} 