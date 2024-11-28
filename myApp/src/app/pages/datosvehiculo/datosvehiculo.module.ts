import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';



import { IonicModule } from '@ionic/angular';



import { DatosvehiculoPageRoutingModule } from './datosvehiculo-routing.module';



import { DatosvehiculoPage } from './datosvehiculo.page';



@NgModule({

  imports: [

    CommonModule,

    FormsModule,

    IonicModule,

    DatosvehiculoPageRoutingModule

  ],

  declarations: [DatosvehiculoPage]

})

export class DatosvehiculoPageModule {}


