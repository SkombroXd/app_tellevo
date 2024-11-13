import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabconductorPage } from './tabconductor.page';

const routes: Routes = [
  {
    path: '',
    component: TabconductorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabconductorPageRoutingModule {}
