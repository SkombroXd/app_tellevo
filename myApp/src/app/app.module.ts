import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { AuthService } from './services/auth.service'; // Asegúrate de que la ruta sea correcta
import { AuthGuard } from './services/auth.guard'; // Importa el guard

import { TabsComponent } from './components/tabs/tabs.component';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { TabscComponent } from './components/tabsc/tabsc.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, TabsComponent, TabscComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, AngularFireModule.initializeApp(environment.firebaseConfig),AngularFireAuthModule,AngularFireDatabaseModule,HttpClientModule,AngularFirestoreModule,],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },AuthService, AuthGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}