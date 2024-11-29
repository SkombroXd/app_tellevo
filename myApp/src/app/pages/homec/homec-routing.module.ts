import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomecPage } from './homec.page';

const routes: Routes = [
  {
    path: '',
    component: HomecPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomecPageRoutingModule {}
