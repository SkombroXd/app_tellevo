import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabconductorPageRoutingModule } from './tabconductor-routing.module';

import { TabconductorPage } from './tabconductor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabconductorPageRoutingModule
  ],
  declarations: [TabconductorPage]
})
export class TabconductorPageModule {}
