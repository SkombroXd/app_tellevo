import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosvehiculoPage } from './datosvehiculo.page';

const routes: Routes = [
  {
    path: '',
    component: DatosvehiculoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosvehiculoPageRoutingModule {}
