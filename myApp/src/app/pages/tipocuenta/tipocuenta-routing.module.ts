import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TipocuentaPage } from './tipocuenta.page';

const routes: Routes = [
  {
    path: '',
    component: TipocuentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TipocuentaPageRoutingModule {}
