import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViajesconductorPageRoutingModule } from './viajesconductor-routing.module';

import { ViajesconductorPage } from './viajesconductor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViajesconductorPageRoutingModule
  ],
  declarations: [ViajesconductorPage]
})
export class ViajesconductorPageModule {}
