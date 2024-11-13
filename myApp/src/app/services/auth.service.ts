import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private AFauth:AngularFireAuth, 
    private router:Router,
  ){
   }
   login(email:string, contrasena:string){
    return this.AFauth.signInWithEmailAndPassword(email , contrasena)
    .then((result)=>{
      console.log('Usuario logeado',result.user);
      this.router.navigateByUrl('/tipocuenta');
      return result.user
    })
    .catch((e)=>{
      console.log('Error al iniciar session',e);
      throw e;
    })
   }
   
}