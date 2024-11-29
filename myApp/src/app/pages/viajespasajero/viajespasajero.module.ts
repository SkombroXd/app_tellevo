import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViajespasajeroPageRoutingModule } from './viajespasajero-routing.module';

import { ViajespasajeroPage } from './viajespasajero.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViajespasajeroPageRoutingModule
  ],
  declarations: [ViajespasajeroPage]
})
export class ViajespasajeroPageModule {}
