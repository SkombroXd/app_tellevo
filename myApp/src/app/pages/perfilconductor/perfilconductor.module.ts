import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilconductorPageRoutingModule } from './perfilconductor-routing.module';

import { PerfilconductorPage } from './perfilconductor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilconductorPageRoutingModule
  ],
  declarations: [PerfilconductorPage]
})
export class PerfilconductorPageModule {}
