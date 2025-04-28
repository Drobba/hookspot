import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { CatchService } from '../../services/catch.service';
import { Catch } from '../../models/catch';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  private readonly defaultCenter: L.LatLngTuple = [60.212664, 16.811447];
  private readonly defaultZoom = 11;

  constructor(
    private catchService: CatchService,
    private mapService: MapService
  ) {}

  ngOnInit(): void {
    this.initMap();

    // Subscribe to catches from CatchService
    this.catchService.catches$.subscribe((catches: Catch[]) => {
      this.addMarkers(catches);
    });
  }

  private initMap(): void {
    this.map = this.mapService.initMap('map');
    
    // Set map to current location
    this.mapService.setMapToCurrentLocation(this.map).subscribe();
  }

  private addMarkers(catches: Catch[]): void {
    if (!this.map) {
      console.error('Map is not initialized.');
      return;
    }
  
    // Clear old markers
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map?.removeLayer(layer);
      }
    });

    const iconUrl = 'assets/Esox_lucius.png';
    const customIcon = L.icon({
      iconUrl: iconUrl,
      iconSize: [60, 24],
      iconAnchor: [30, 12],
      popupAnchor: [0, -12],
      className: 'fish-marker'
    });
    
    catches.forEach((catchItem) => {
      const marker = L.marker(
        [catchItem.location.lat, catchItem.location.lng],
        { icon: customIcon }
      );

      const popupContent = `
        <div class="catch-popup">
          <div class="catch-header">
            <span class="custom-close-button">&times;</span>
            <div class="image-container">
              <img src="${catchItem.imageUrl || iconUrl}" alt="${catchItem.fishType}" class="fish-image"/>
            </div>
            <h3 class="user-name">${catchItem.user.userName}</h3>
          </div>
          <div class="catch-details">
            <div class="detail-row">
              <span class="label">Fiskart</span>
              <span class="value">${catchItem.fishType}</span>
            </div>
            <div class="detail-row">
              <span class="label">Vikt</span>
              <span class="value">${catchItem.fishWeight} kg</span>
            </div>
            <div class="detail-row">
              <span class="label">Längd</span>
              <span class="value">${catchItem.fishLength} cm</span>
            </div>
            <div class="detail-row">
              <span class="label">Bete</span>
              <span class="value">${catchItem.bait}</span>
            </div>
            <div class="detail-row">
              <span class="label">Datum</span>
              <span class="value">${catchItem.date}</span>
            </div>
          </div>
        </div>
      `;

      marker.addTo(this.map!).bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-popup',
        maxWidth: 300,
        minWidth: 300
      }).on('popupopen', (e) => {
        const popup = e.popup;
        const closeButton = popup.getElement()?.querySelector('.custom-close-button');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            popup.close();
          });
        }
      });
    });
  }
}
