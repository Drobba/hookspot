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

    // Marker 1: Första platsen i Färnebofjärden
    const marker1 = L.marker([60.212664, 16.811447]); // Första marker-positionen
    marker1.addTo(this.map).bindPopup('Felix, Gädda 5.4 kg').openPopup();

    // // Marker 2: Andra platsen i Färnebofjärden
    // const marker2 = L.marker([60.212102, 16.832443]); // Andra marker-positionen
    // marker2.addTo(this.map).bindPopup('Andreas, Gädda 3.2 kg').openPopup();

    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41], // Standardstorlek för Leaflet-markörer
      iconAnchor: [12, 41], // Förankra ikonen vid basen
      popupAnchor: [1, -34], // Popup-förankring
      shadowSize: [41, 41], // Storlek på skuggan
    });

    // Marker 2: Andra platsen i Färnebofjärden med röd ikon
    const marker2 = L.marker([60.212102, 16.832443], { icon: redIcon }); // Andra marker-positionen
    marker2.addTo(this.map).bindPopup('Andreas, Gädda 3.2 kg').openPopup();
  }
}
