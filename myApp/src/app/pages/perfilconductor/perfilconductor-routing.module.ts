import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilconductorPage } from './perfilconductor.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilconductorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilconductorPageRoutingModule {}
