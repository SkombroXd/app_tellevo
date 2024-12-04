import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabscComponent } from './components/tabsc/tabsc.component';
import { AuthGuard } from './services/auth.guard';
import { ConductorGuard } from './services/conductor.guard';
import { NoAuthGuard } from './services/no-auth.guard';
import { VehiculoGuard } from './services/vehiculo.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'tipocuenta',
    loadChildren: () => import('./pages/tipocuenta/tipocuenta.module').then(m => m.TipocuentaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'perfilpasajero',
        loadChildren: () => import('./pages/perfilpasajero/perfilpasajero.module').then(m => m.PerfilpasajeroPageModule)
      },
      {
        path: 'viajespasajero',
        loadChildren: () => import('./pages/viajespasajero/viajespasajero.module').then(m => m.ViajespasajeroPageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'tabsc',
    component: TabscComponent,
    children: [
      {
        path: 'homec',
        loadChildren: () => import('./pages/homec/homec.module').then(m => m.HomecPageModule)
      },
      {
        path: 'perfilconductor',
        loadChildren: () => import('./pages/perfilconductor/perfilconductor.module').then(m => m.PerfilconductorPageModule)
      },
      {
        path: 'viajesconductor',
        loadChildren: () => import('./pages/viajesconductor/viajesconductor.module').then(m => m.ViajesconductorPageModule)
      },
      {
        path: '',
        redirectTo: 'homec',
        pathMatch: 'full'
      }
    ],
    canActivate: [AuthGuard, ConductorGuard]
  },
  {
    path: 'datosvehiculo',
    loadChildren: () => import('./pages/datosvehiculo/datosvehiculo.module').then(m => m.DatosvehiculoPageModule),
    canActivate: [AuthGuard, VehiculoGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
