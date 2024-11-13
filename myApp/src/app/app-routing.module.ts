import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabscComponent } from './components/tabsc/tabsc.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'tipocuenta',
    loadChildren: () => import('./pages/tipocuenta/tipocuenta.module').then( m => m.TipocuentaPageModule)
  },
  {
    path: 'datosvehiculo',
    loadChildren: () => import('./pages/datosvehiculo/datosvehiculo.module').then( m => m.DatosvehiculoPageModule)
  },
  {
    path: 'tabs',
    component: TabsComponent,
    children:[
      {
        path: 'perfilpasajero',
        loadChildren: () => import('./pages/perfilpasajero/perfilpasajero.module').then( m => m.PerfilpasajeroPageModule)
      },
      {
        path: 'viajespasajero',
        loadChildren: () => import('./pages/viajespasajero/viajespasajero.module').then( m => m.ViajespasajeroPageModule)
      },
      {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
      }
    ]
  },
  {
    path: 'tabsc',
    component: TabscComponent,
    children:[
      {
        path: 'perfilconductor',
        loadChildren: () => import('./pages/perfilconductor/perfilconductor.module').then( m => m.PerfilconductorPageModule)
      },
      {
        path: 'viajesconductor',
        loadChildren: () => import('./pages/viajesconductor/viajesconductor.module').then( m => m.ViajesconductorPageModule)
      },
      {
        path: 'homec',
        loadChildren: () => import('./pages/homec/homec.module').then( m => m.HomecPageModule)
      },
    ]
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
