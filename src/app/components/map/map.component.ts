import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { CatchService } from '../../services/catch.service';
import { Catch } from '../../models/catch';
import { MapService } from '../../services/map.service';
import { getFishImagePath } from '../../utils/fish-image.util';
import { CatchInfoPopupService } from '../../services/catch-info-popup.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  private readonly defaultCenter: L.LatLngTuple = [60.212664, 16.811447]; //Stockholm
  private readonly defaultZoom = 11;

  constructor(
    private catchService: CatchService,
    private mapService: MapService,
    private catchInfoPopupService: CatchInfoPopupService
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

    catches.forEach((catchItem) => {
      let iconSize: [number, number] = [60, 40];
      let iconAnchor: [number, number] = [30, 20];

      if (catchItem.fishType === 'Gös' || catchItem.fishType === 'Abborre') {
        iconSize = [45, 30]; 
        iconAnchor = [22, 15];
      } else if (catchItem.fishType === 'Gädda') {
        iconSize = [60, 48]; 
        iconAnchor = [30, 24];
      }

      const iconUrl = getFishImagePath(catchItem.fishType);
      const customIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: iconSize,
        iconAnchor: iconAnchor,
        popupAnchor: [0, -12],
        className: 'fish-marker'
      });
      
      const marker = L.marker(
        [catchItem.location.lat, catchItem.location.lng],
        { icon: customIcon }
      );

      // Create popup content using the CatchInfoPopupService
      const popupContent = this.catchInfoPopupService.createCatchInfoPopup(catchItem);

      marker.addTo(this.map!).bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-popup',
        maxWidth: 300,
        minWidth: 300
      });
    });
  }
}
