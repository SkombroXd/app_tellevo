import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TipocuentaPageRoutingModule } from './tipocuenta-routing.module';

import { TipocuentaPage } from './tipocuenta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TipocuentaPageRoutingModule
  ],
  declarations: [TipocuentaPage]
})
export class TipocuentaPageModule {}
