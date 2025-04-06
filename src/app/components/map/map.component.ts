import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { CatchService } from '../../services/catch.service';
import { Catch } from '../../models/catch';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;

  constructor(private catchService: CatchService) {}

  ngOnInit(): void {
    this.initMap();

    // Prenumerera på fångster från CatchService
    this.catchService.catches$.subscribe((catches: Catch[]) => {
      this.addMarkers(catches);
    });
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [60.212664, 16.811447],
      zoom: 11,
    });

    L.tileLayer('https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=DGFPXsZXReirjtp4BE3s', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  private addMarkers(catches: Catch[]): void {
    if (!this.map) {
      console.error('Kartan är inte initialiserad.');
      return;
    }
  
    // Rensa gamla markörer
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map?.removeLayer(layer);
      }
    });
  
    const customIcon = L.icon({
      iconUrl: 'assets/Esox_lucius.png',
      iconSize: [60, 24],       // anpassa
      iconAnchor: [30, 12],     // anpassa
      popupAnchor: [0, -12],
      className: ''
    });
    
  
    catches.forEach((catchItem) => {
      const marker = L.marker(
        [catchItem.location.lat, catchItem.location.lng],
        { icon: customIcon }
      );
      marker.addTo(this.map!).bindPopup(`
        <img src="assets/Esox_lucius.png"/>
        <b>${catchItem.user.userName}</b><br>
        Fiskart: ${catchItem.fishType}<br>
        Vikt: ${catchItem.fishWeight} kg
      `);
    });
  }
  
}
