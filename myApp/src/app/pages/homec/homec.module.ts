import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomecPageRoutingModule } from './homec-routing.module';

import { HomecPage } from './homec.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomecPageRoutingModule
  ],
  declarations: [HomecPage]
})
export class HomecPageModule {}
