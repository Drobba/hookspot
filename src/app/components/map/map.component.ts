import { Component, OnInit, Injector, ApplicationRef, ComponentRef, createComponent, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { CatchService } from '../../services/catch.service';
import { Catch } from '../../models/catch';
import { MapService } from '../../services/map.service';
import { getFishImagePath } from '../../utils/fish-image.util';
import { CatchPopupComponent } from '../catch-popup/catch-popup.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map: L.Map | undefined;
  private readonly defaultCenter: L.LatLngTuple = [60.212664, 16.811447]; //Stockholm
  private readonly defaultZoom = 11;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private catchService: CatchService,
    private mapService: MapService,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  ngOnInit(): void {
    // Map initialization moved to AfterViewInit
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      
      // Create a ResizeObserver to handle map sizing when container changes
      this.resizeObserver = new ResizeObserver(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });
      
      const mapElement = document.getElementById('map');
      if (mapElement) {
        this.resizeObserver.observe(mapElement);
      }
      
      // Subscribe to catches from CatchService
      this.catchService.catches$.subscribe((catches: Catch[]) => {
        this.addMarkers(catches);
      });
    }, 100); // Small delay to ensure DOM is ready
  }
  
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.map) {
      this.map.remove();
    }
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

      // Create popup content using the CatchPopupComponent
      const popupContent = this.createPopupContent(catchItem);

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

  private createPopupContent(catchItem: Catch): HTMLElement {
    // Create the component
    const componentRef = createComponent(CatchPopupComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });
    
    // Set inputs
    componentRef.instance.catchItem = catchItem;
    
    // Attach to the DOM and detect changes
    this.appRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
    
    // Get DOM element
    const domElement = (componentRef.location.nativeElement as HTMLElement);
    
    // Listen for component destruction
    const destroyComponent = () => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    };
    
    // Add event listener for popup close
    document.addEventListener('popupClose', destroyComponent, { once: true });
    
    return domElement;
  }
}
