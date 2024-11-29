import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Usuario } from '../interfaces/usuario';
import { VehiculoService } from './vehiculo.service';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    public AFauth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private vehiculoService: VehiculoService
  ) {
    this.AFauth.authState.subscribe(user => {
      if (user) {
        console.log('Usuario autenticado:', user.uid);
      } else {
        console.log('Usuario no autenticado');
      }
    });
  }

  login(email: string, contrasena: string) {
    return this.AFauth.signInWithEmailAndPassword(email, contrasena)
      .then((result) => {
        console.log('Usuario logeado', result.user);
        this.router.navigateByUrl('/tipocuenta');
        return result.user;
      })
      .catch((e) => {
        console.log('Error al iniciar session', e);
        throw e;
      });
  }

  // Método para registrar nuevos usuarios
  async register(usuario: Usuario) {
    try {
      const result = await this.AFauth.createUserWithEmailAndPassword(usuario.email, usuario.password);
      if (result.user) {
        // Aseguramos que tipocuenta sea false (pasajero) por defecto
        const userData: Usuario = {
          ...usuario,
          id: result.user.uid,
          tipocuenta: false
        };
        // Guardamos los datos adicionales en Firestore
        await this.firestore.collection('usuarios').doc(result.user.uid).set(userData);
        return result.user;
      }
      throw new Error('No se pudo crear el usuario');
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  getCurrentUser(): Promise<firebase.User | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = this.AFauth.onAuthStateChanged(user => {
        if (unsubscribe) {
          Promise.resolve(unsubscribe).then(fn => fn());
        }
        resolve(user);
      }, reject);
    });
  }

  async logout() {
    try {
      await this.AFauth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }
}














