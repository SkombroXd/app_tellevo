// home.page.ts
import { Component, OnInit } from '@angular/core';
import { ViajeService } from '../../services/viaje.service';
import { Viaje } from '../../interfaces/viaje';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  viajesDisponibles: Viaje[] = [];

  constructor(private viajeService: ViajeService) {}

  ngOnInit() {
    this.obtenerViajesDisponibles();
  }

  obtenerViajesDisponibles() {
    this.viajeService.obtenerViajes().subscribe((viajes) => {
      // Filtra solo los viajes con pasajeros disponibles
      this.viajesDisponibles = viajes.filter(viaje => viaje.cantidadp > 0);
    });
  }

  reservarViaje(viaje: Viaje) {
    if (viaje.cantidadp > 0) {
      viaje.cantidadp--;
      this.viajeService.actualizarViaje(viaje).then(() => {
        console.log('Viaje reservado');
      }).catch((error) => {
        console.error('Error al reservar el viaje:', error);
      });
    }
  }
}
