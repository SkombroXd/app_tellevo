import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilpasajeroPage } from './perfilpasajero.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilpasajeroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilpasajeroPageRoutingModule {}
