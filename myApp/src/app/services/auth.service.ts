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
  private readonly STORAGE_KEY = 'userData';
  private readonly CREDENTIALS_KEY = 'userCredentials';
  private isOffline = false;

  constructor(
    public AFauth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private vehiculoService: VehiculoService
  ) {
    window.addEventListener('offline', () => this.isOffline = true);
    window.addEventListener('online', () => this.isOffline = false);

    // Monitorear el estado de autenticación
    this.AFauth.authState.subscribe(user => {
      if (user) {
        this.router.navigateByUrl('/tipocuenta');
      }
    });
  }

  private async offlineLogin(email: string, contrasena: string) {
    const storedUser = this.getStoredUser();
    const storedCredentials = this.getStoredCredentials();
    
    if (storedUser && storedCredentials && 
        storedCredentials.email === email && 
        storedCredentials.password === contrasena) {
      console.log('Login offline exitoso');
      await this.router.navigateByUrl('/tipocuenta', { replaceUrl: true });
      return storedUser;
    }
    
    throw new Error('Credenciales incorrectas o no hay datos guardados');
  }

  async login(email: string, contrasena: string) {
    if (!navigator.onLine) {
      console.log('Sin conexión - intentando login offline');
      return this.offlineLogin(email, contrasena);
    }

    try {
      this.storeCredentials(email, contrasena);
      const result = await this.AFauth.signInWithEmailAndPassword(email, contrasena);
      
      if (result.user) {
        try {
          const userDoc = await this.firestore.collection('usuarios').doc(result.user.uid).get().toPromise();
          const userData = userDoc?.data() as Usuario;
          
          if (userData) {
            this.storeUserData(userData);
            console.log('Usuario logeado y datos guardados localmente');
            await this.router.navigateByUrl('/tipocuenta', { replaceUrl: true });
            return result.user;
          }
        } catch (firestoreError) {
          console.warn('Error al obtener datos de Firestore, usando datos locales:', firestoreError);
          return this.offlineLogin(email, contrasena);
        }
      }
      throw new Error('No se encontraron datos del usuario');
    } catch (e: any) {
      console.log('Error al iniciar sesión:', e);
      
      if (e.code === 'auth/network-request-failed' || 
          e.code === 'auth/invalid-credential' || 
          !navigator.onLine) {
        return this.offlineLogin(email, contrasena);
      }
      throw e;
    }
  }

  private storeUserData(userData: Usuario) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
  }

  private storeCredentials(email: string, password: string) {
    localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify({ email, password }));
  }

  private getStoredUser(): Usuario | null {
    const userData = localStorage.getItem(this.STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  public getStoredCredentials(): { email: string; password: string } | null {
    const credentials = localStorage.getItem(this.CREDENTIALS_KEY);
    return credentials ? JSON.parse(credentials) : null;
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
}














