import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ViajeService } from '../../services/viaje.service';

interface Viaje {
  nombrec: string;
  ubicacionActual: string; // Dirección en texto de la ubicación inicial
  destino: string;
  cantidadp: number;
  costo: number;
  fecha: string;
  hora: string;
}

@Component({
  selector: 'app-homec',
  templateUrl: './homec.page.html',
  styleUrls: ['./homec.page.scss'],
})
export class HomecPage implements OnInit {
  map!: mapboxgl.Map;
  lat!: number;
  lon!: number;
  ubicacionActual: string = ''; // Dirección en texto de la ubicación inicial
  destinationMarker!: mapboxgl.Marker;
  destination: [number, number] | null = null;
  searchQuery: string = ''; // Dirección ingresada por el usuario
  predictions: any[] = []; // Lista de predicciones de direcciones

  // Nuevas propiedades para el viaje
  nombreConductor: string = 'Usuario'; // Nombre del conductor
  cantidadPasajeros: number = 1; // Cantidad de pasajeros
  costoViaje: number = 1000; // Costo del viaje
  horaViaje: string = '00:00'; // Hora del viaje
  viajes: Viaje[] = []; // Lista para almacenar viajes

  constructor(private http: HttpClient, private viajeService: ViajeService) {}

  async ngOnInit() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.lat = coordinates.coords.latitude;
    this.lon = coordinates.coords.longitude;

    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoia2VmaWVycm8iLCJhIjoiY20zZ2NoYm91MDJ3cDJxcHRseGZxZnpmdyJ9.EZiJXVqhIfThpB9n3C308g';

    // Obtener la dirección de la ubicación inicial
    await this.obtenerDireccionOrigen();

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

  async obtenerDireccionOrigen() {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${this.lon},${this.lat}.json?access_token=${(mapboxgl as any).accessToken}`;

    try {
      const response: any = await firstValueFrom(this.http.get(url));
      if (response.features && response.features.length > 0) {
        this.ubicacionActual = response.features[0].place_name;
        console.log('Dirección de origen:', this.ubicacionActual);
      } else {
        console.error('No se encontró la dirección de origen.');
        this.ubicacionActual = `${this.lat},${this.lon}`; // Usa las coordenadas si falla
      }
    } catch (error) {
      console.error('Error al obtener la dirección de origen:', error);
      this.ubicacionActual = `${this.lat},${this.lon}`; // Usa las coordenadas si falla
    }
  }

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

  hidePredictions() {
    setTimeout(() => {
      this.predictions = [];
    }, 200);
  }

  selectPrediction(prediction: any) {
    this.searchQuery = prediction.place_name;
    const [lon, lat] = prediction.geometry.coordinates;
    this.predictions = [];
    this.setDestination([lon, lat]);
  }

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

  async setDestination(destination: [number, number]) {
    this.destination = destination;

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${destination[0]},${destination[1]}.json?access_token=${(mapboxgl as any).accessToken}`;

    try {
      const response: any = await firstValueFrom(this.http.get(url));
      if (response.features && response.features.length > 0) {
        this.searchQuery = response.features[0].place_name;
      } else {
        console.error('No se encontró la dirección.');
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
    }

    this.destinationMarker.setLngLat(destination).addTo(this.map);
    this.map.flyTo({ center: destination, zoom: 14 });
    await this.getRoute();
  }

  async getRoute() {
    if (!this.destination) {
      console.error('No hay destino seleccionado');
      return;
    }

    const origin: [number, number] = [this.lon, this.lat];
    const destination = this.destination;

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${(mapboxgl as any).accessToken}`;

    try {
      const response: any = await firstValueFrom(this.http.get(url));
      const route = response.routes[0].geometry.coordinates;
      this.drawRoute(route);
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
    }
  }
  
  drawRoute(route: [number, number][]) {
    // Verificar si ya existe una capa de ruta y eliminarla antes de agregar una nueva
    if (this.map.getLayer('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }
  
    // Añadir la fuente de datos para la ruta con las propiedades necesarias
    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {}, // Asegurarse de incluir 'properties' aunque esté vacío
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      },
    });
  
    // Añadir la capa de línea para la ruta
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

  agregarViaje() {
    if (!this.destination) {
      alert('Por favor selecciona un destino en el mapa.');
      return;
    }
  
    const nuevoViaje: Viaje = {
      nombrec: this.nombreConductor,
      ubicacionActual: this.ubicacionActual,
      destino: this.searchQuery,
      cantidadp: this.cantidadPasajeros,
      costo: this.costoViaje,
      fecha: new Date().toLocaleDateString(),
      hora: this.horaViaje,
    };
  
    this.viajeService
      .agregarViaje(nuevoViaje)
      .then(() => {
        alert('Viaje agregado con éxito.');
        console.log('Viaje guardado en Firebase:', nuevoViaje);
      })
      .catch((error) => {
        alert('Error al guardar el viaje.');
        console.error('Error al guardar el viaje:', error);
      });
  }
}
