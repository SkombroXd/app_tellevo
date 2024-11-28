import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

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
      take(1),
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