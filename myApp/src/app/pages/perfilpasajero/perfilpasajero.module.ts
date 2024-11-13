import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilpasajeroPageRoutingModule } from './perfilpasajero-routing.module';

import { PerfilpasajeroPage } from './perfilpasajero.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilpasajeroPageRoutingModule
  ],
  declarations: [PerfilpasajeroPage]
})
export class PerfilpasajeroPageModule {}
