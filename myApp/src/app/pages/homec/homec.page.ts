import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-homec',
  templateUrl: './homec.page.html',
  styleUrls: ['./homec.page.scss'],
})
export class HomecPage implements OnInit {
  map!: mapboxgl.Map;
  lat!: number;
  lon!: number;
  destinationMarker!: mapboxgl.Marker;
  destination: [number, number] | null = null; // Coordenadas del destino
  searchQuery: string = ''; // Dirección ingresada por el usuario

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.lat = coordinates.coords.latitude;
    this.lon = coordinates.coords.longitude;
  
    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoia2VmaWVycm8iLCJhIjoiY20zZ2NoYm91MDJ3cDJxcHRseGZxZnpmdyJ9.EZiJXVqhIfThpB9n3C308g';
  
    // Crear el mapa centrado en la ubicación actual
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.lon, this.lat],
      zoom: 12,
    });
  
    // Agregar marcador en la ubicación inicial
    new mapboxgl.Marker({ color: 'blue' })
      .setLngLat([this.lon, this.lat])
      .setPopup(new mapboxgl.Popup().setText('Ubicación actual'))
      .addTo(this.map);
  
    // Inicializar el marcador del destino
    this.destinationMarker = new mapboxgl.Marker({ color: 'red' });
  
    // Escuchar clics en el mapa para seleccionar el destino
    this.map.on('click', (event: mapboxgl.MapMouseEvent) => {
      const lngLat = event.lngLat;
      this.setDestination([lngLat.lng, lngLat.lat]);
    });
  }
  

  // Método para buscar una dirección
  async searchAddress() {
    if (!this.searchQuery.trim()) {
      alert('Por favor, ingresa una dirección.');
      return;
    }
  
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.searchQuery)}.json?access_token=${(mapboxgl as any).accessToken}&limit=1`;
  
    try {
      const response: any = await firstValueFrom(this.http.get(url));
  
      if (response.features && response.features.length > 0) {
        const [lon, lat] = response.features[0].geometry.coordinates;
        this.setDestination([lon, lat]);
      } else {
        alert('Dirección no encontrada.');
      }
    } catch (error) {
      console.error('Error al buscar la dirección:', error);
      alert('Hubo un error al buscar la dirección.');
    }
  }
  
  // Establecer destino y trazar la ruta
  async setDestination(destination: [number, number]) {
    this.destination = destination;
    this.destinationMarker.setLngLat(destination).addTo(this.map);
  
    // Centrar el mapa en el destino
    this.map.flyTo({ center: destination, zoom: 14 });
  
    // Obtener y trazar la ruta
    await this.getRoute();
  }
  

  // Función para obtener y trazar la ruta
  async getRoute() {
    if (!this.destination) return;

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.lon},${this.lat};${this.destination[0]},${this.destination[1]}?geometries=geojson&steps=true&access_token=${(mapboxgl as any).accessToken}`;

    try {
      const response: any = await firstValueFrom(this.http.get(url));

      if (response.routes && response.routes.length > 0) {
        const route = response.routes[0].geometry.coordinates;
        this.drawRoute(route);
      } else {
        console.error('No se encontró ninguna ruta.');
      }
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
    }
  }

  // Función para trazar la ruta en el mapa
  drawRoute(route: [number, number][]) {
    // Verificar si la capa de ruta ya existe y eliminarla si es necesario
    if (this.map.getLayer('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }

    // Añadir la fuente de la ruta
    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      },
    });

    // Añadir la capa de línea para mostrar la ruta
    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
      },
    });
  }
}
