import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViajespasajeroPage } from './viajespasajero.page';

const routes: Routes = [
  {
    path: '',
    component: ViajespasajeroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViajespasajeroPageRoutingModule {}
