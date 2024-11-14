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
  destination: [number, number] | null = null;
  searchQuery: string = ''; // Dirección ingresada por el usuario
  predictions: any[] = []; // Lista de predicciones de direcciones

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.lat = coordinates.coords.latitude;
    this.lon = coordinates.coords.longitude;

    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoia2VmaWVycm8iLCJhIjoiY20zZ2NoYm91MDJ3cDJxcHRseGZxZnpmdyJ9.EZiJXVqhIfThpB9n3C308g';

    // Crear el mapa
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.lon, this.lat],
      zoom: 12,
    });

    // Agregar marcador de la ubicación actual
    new mapboxgl.Marker().setLngLat([this.lon, this.lat]).addTo(this.map);

    // Inicializar marcador de destino
    this.destinationMarker = new mapboxgl.Marker({ color: 'red' });

    // Manejar clics en el mapa para seleccionar el destino
    this.map.on('click', (event: mapboxgl.MapMouseEvent) => {
      const lngLat = event.lngLat;
      this.setDestination([lngLat.lng, lngLat.lat]);
    });
  }

// Lógica para obtener y mostrar predicciones de direcciones
async onSearchChange() {
  if (this.searchQuery.length < 3) {
    this.predictions = [];
    return;
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.searchQuery)}.json?autocomplete=true&access_token=${(mapboxgl as any).accessToken}&limit=5`;

  try {
    const response: any = await firstValueFrom(this.http.get(url));
    this.predictions = response.features || [];
  } catch (error) {
    console.error('Error al obtener predicciones:', error);
  }
}

// Ocultar predicciones al perder foco
hidePredictions() {
  setTimeout(() => {
    this.predictions = [];
  }, 200);
}

// Seleccionar una predicción de la lista
selectPrediction(prediction: any) {
  const [lon, lat] = prediction.geometry.coordinates;
  this.searchQuery = prediction.place_name;
  this.predictions = []; // Limpiar predicciones al seleccionar
  this.setDestination([lon, lat]);
}


  // Buscar una dirección específica
  async searchAddress() {
    if (!this.searchQuery.trim()) return;

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
    }
  }

  // Establecer el destino y trazar la ruta
  async setDestination(destination: [number, number]) {
    this.destination = destination;
    this.destinationMarker.setLngLat(destination).addTo(this.map);
    this.map.flyTo({ center: destination, zoom: 14 });
    await this.getRoute();
  }

  // Obtener y trazar la ruta en el mapa
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

  // Dibujar la ruta en el mapa
  drawRoute(route: [number, number][]) {
    if (this.map.getLayer('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }

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
