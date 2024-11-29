import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViajesconductorPage } from './viajesconductor.page';

const routes: Routes = [
  {
    path: '',
    component: ViajesconductorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViajesconductorPageRoutingModule {}
