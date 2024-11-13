import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';


@Component({
  selector: 'app-homec',
  templateUrl: './homec.page.html',
  styleUrls: ['./homec.page.scss'],
})

export class HomecPage implements OnInit {
  map!: mapboxgl.Map;

  constructor() { }

  async ngOnInit() {
    const coordinates = await Geolocation.getCurrentPosition();
    const lat = coordinates.coords.latitude;
    const lon = coordinates.coords.longitude;

    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoia2VmaWVycm8iLCJhIjoiY20zZ2NoYm91MDJ3cDJxcHRseGZxZnpmdyJ9.EZiJXVqhIfThpB9n3C308g';
    this.map = new mapboxgl.Map({
      container: 'map', // ID del contenedor
      style: 'mapbox://styles/mapbox/streets-v11', // Estilo de mapa de Mapbox
      center: [lon, lat], // Coordenadas de inicio
      zoom: 9 // Nivel de zoom inicial
    });
  }
}