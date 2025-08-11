/**
 * Service for managing map operations including initialization, geolocation, and map positioning.
 */
import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { Observable, from } from 'rxjs';

export interface MapLocation {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly defaultCenter: L.LatLngTuple = [60.212664, 16.811447];
  private readonly defaultZoom = 11;
  private readonly defaultAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  constructor() {}

  initMap(mapElement: string, options: Partial<L.MapOptions> = {}, showAttribution: boolean = true): L.Map {
    const map = L.map(mapElement, {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      attributionControl: showAttribution,
      ...options
    });

    L.tileLayer('https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=DGFPXsZXReirjtp4BE3s', {
      attribution: showAttribution ? this.defaultAttribution : ''
    }).addTo(map);

    return map;
  }

  getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      if (!('geolocation' in navigator)) {
        observer.error(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          observer.next(position);
          observer.complete();
        },
        error => {
          observer.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  setMapToCurrentLocation(map: L.Map): Observable<MapLocation> {
    return new Observable(observer => {
      this.getCurrentPosition().subscribe({
        next: (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], this.defaultZoom);
          observer.next({ lat: latitude, lng: longitude });
          observer.complete();
        },
        error: (error) => {
          console.warn('Geolocation error:', error.message);
          // Fall back to default location
          const [lat, lng] = this.defaultCenter;
          observer.next({ lat, lng });
          observer.complete();
        }
      });
    });
  }
} 