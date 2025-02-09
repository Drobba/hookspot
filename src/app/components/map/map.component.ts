import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Centrera kartan över den första markören
    this.map = L.map('map', {
      center: [60.212664, 16.811447], // Första positionen i Färnebofjärden
      zoom: 11,
    });

    L.tileLayer('https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=DGFPXsZXReirjtp4BE3s', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: '/map-marker.svg',
      iconSize: [40, 40], // Anpassa storleken
      iconAnchor: [20, 40], // Basens förankring
      popupAnchor: [0, -40], // Position för popup-fönstret
    });

    // Marker 1 med anpassad SVG-ikon
    const marker1 = L.marker([60.212664, 16.811447], { icon: customIcon });
    marker1.addTo(this.map).bindPopup('Felix, Gädda 5.4 kg');

    // Marker 2 med samma SVG-ikon
    const marker2 = L.marker([60.212102, 16.832443], { icon: customIcon });
    marker2.addTo(this.map).bindPopup('Andreas, Gädda 3.2 kg');
  }
}
