import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ViajeService } from '../../services/viaje.service';
import { AlertController, ModalController } from '@ionic/angular';
import { NotificacionService } from '../../services/notificacion.service';
import { AuthService } from '../../services/auth.service';
import { Notificacion } from '../../interfaces/notificacion';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationsModalComponent } from '../../components/notifications-modal/notifications-modal.component';

interface Viaje {
  id: string;
  nombrec: string;
  ubicacionActual: string;
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
  ubicacionActual: string = '';
  destinationMarker!: mapboxgl.Marker;
  destination: [number, number] | null = null;
  searchQuery: string = '';
  predictions: any[] = [];

  nombreConductor: string = 'Usuario';
  cantidadPasajeros: number = 1;
  maxPasajeros: number = 4;
  costoViaje: number = 1000;
  horaViaje: string = '00:00';
  viajes: Viaje[] = [];
  notificacionesNoLeidas = 0;

  constructor(
    private http: HttpClient, 
    private viajeService: ViajeService,
    private alertController: AlertController,
    private modalController: ModalController,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.lat = coordinates.coords.latitude;
    this.lon = coordinates.coords.longitude;

    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoia2VmaWVycm8iLCJhIjoiY20zZ2NoYm91MDJ3cDJxcHRseGZxZnpmdyJ9.EZiJXVqhIfThpB9n3C308g';

    await this.obtenerDireccionOrigen();

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.lon, this.lat],
      zoom: 12,
    });

    new mapboxgl.Marker().setLngLat([this.lon, this.lat]).addTo(this.map);
    this.destinationMarker = new mapboxgl.Marker({ color: 'red' });

    this.map.on('click', (event: mapboxgl.MapMouseEvent) => {
      const lngLat = event.lngLat;
      this.setDestination([lngLat.lng, lngLat.lat]);
    });

    await this.cargarNotificaciones();
    await this.cargarDatosConductor();
  }

  private async cargarDatosConductor() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userDoc = await this.firestore.collection('usuarios').doc(user.uid).get().toPromise();
      const userData = userDoc?.data() as any;
      if (userData) {
        this.nombreConductor = `${userData.nombre} ${userData.apellido}`;
      }
    }
  }

  async obtenerDireccionOrigen() {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${this.lon},${this.lat}.json?access_token=${(mapboxgl as any).accessToken}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      this.ubicacionActual = response.features?.[0]?.place_name || `${this.lat},${this.lon}`;
    } catch (error) {
      console.error('Error al obtener la dirección de origen:', error);
      this.ubicacionActual = `${this.lat},${this.lon}`;
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
      if (response.features?.length > 0) {
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
      this.searchQuery = response.features?.[0]?.place_name || 'Dirección desconocida';
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
    }

    this.destinationMarker.setLngLat(destination).addTo(this.map);
    this.map.flyTo({ center: destination, zoom: 14 });
    await this.getRoute();
  }

  async getRoute() {
    if (!this.destination) return console.error('No hay destino seleccionado');

    const origin: [number, number] = [this.lon, this.lat];
    const destination = this.destination;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${(mapboxgl as any).accessToken}`;

    try {
      const response: any = await firstValueFrom(this.http.get(url));
      this.drawRoute(response.routes[0]?.geometry.coordinates || []);
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
    }
  }

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

  async agregarViaje() {
    if (!this.destination) {
      await this.mostrarAlerta('Error', 'Por favor selecciona un destino en el mapa.');
      return;
    }

    if (!this.horaViaje) {
      await this.mostrarAlerta('Error', 'Por favor selecciona una hora para el viaje.');
      return;
    }

    if (this.cantidadPasajeros > this.maxPasajeros) {
      await this.mostrarAlerta('Error', 'El máximo de pasajeros permitido es 4');
      return;
    }

    const user = await this.authService.getCurrentUser();
    if (!user) {
      await this.mostrarAlerta('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    const fechaActual = new Date().toISOString().split('T')[0];
    
    const nuevoViaje = {
      id: this.viajeService.generarId(),
      nombrec: this.nombreConductor,
      ubicacionActual: this.ubicacionActual,
      destino: this.searchQuery,
      cantidadp: this.cantidadPasajeros,
      costo: this.costoViaje,
      fecha: fechaActual,
      hora: this.horaViaje,
      userId: user.uid
    };

    try {
      await this.viajeService.agregarViajeConductor(nuevoViaje);
      await this.mostrarAlerta('Éxito', 'Viaje agregado correctamente.');
      this.limpiarFormulario();
    } catch (error) {
      await this.mostrarAlerta('Error', error instanceof Error ? error.message : 'No se pudo agregar el viaje');
    }
  }

  private limpiarFormulario() {
    this.cantidadPasajeros = 1;
    this.costoViaje = 1000;
    this.horaViaje = '00:00';
    this.searchQuery = '';
    this.destination = null;
    if (this.destinationMarker) {
      this.destinationMarker.remove();
    }
    if (this.map.getLayer('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }
  }

  private async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  decrementarPasajeros() {
    if (this.cantidadPasajeros > 1) {
      this.cantidadPasajeros--;
    }
  }

  incrementarPasajeros() {
    if (this.cantidadPasajeros < this.maxPasajeros) {
      this.cantidadPasajeros++;
    }
  }

  async cargarNotificaciones() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.notificacionService.obtenerNotificaciones(user.uid).subscribe(
        notificaciones => {
          console.log('Notificaciones cargadas:', notificaciones);
          this.notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;
        },
        error => {
          console.error('Error al cargar notificaciones:', error);
        }
      );
    }
  }

  async mostrarNotificaciones() {
    const user = await this.authService.getCurrentUser();
    if (!user) return;

    try {
      // Obtener las notificaciones primero
      const notificaciones = await firstValueFrom(
        this.notificacionService.obtenerNotificaciones(user.uid)
      );

      if (notificaciones.length === 0) {
        await this.mostrarAlerta('Notificaciones', 'No tienes notificaciones nuevas');
        return;
      }

      // Crear y mostrar el modal
      const modal = await this.modalController.create({
        component: NotificationsModalComponent,
        componentProps: {
          notificaciones: [...notificaciones] // Crear una copia del array
        },
        cssClass: 'notifications-modal'
      });

      await modal.present();

      // Manejar el cierre del modal
      const { data } = await modal.onDidDismiss();
      
      // Marcar notificaciones como leídas
      for (const notificacion of notificaciones) {
        if (!notificacion.leida) {
          await this.notificacionService.marcarComoLeida(notificacion.id);
        }
      }

    } catch (error) {
      console.error('Error al mostrar notificaciones:', error);
      await this.mostrarAlerta('Error', 'No se pudieron cargar las notificaciones');
    }
  }
}  