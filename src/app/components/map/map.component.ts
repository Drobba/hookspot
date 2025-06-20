import { Component, inject, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { CatchService } from '../../services/catch.service';
import { Catch } from '../../models/catch';
import { MapService } from '../../services/map.service';
import { getFishImagePath } from '../../utils/fish-image.util';
import { CatchInfoPopupService } from '../../services/catch-info-popup.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilter, faSliders, faFunnelDollar } from '@fortawesome/free-solid-svg-icons';
import { DialogStateService } from '../../services/dialog-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { FilterCatchComponent } from '../filter-catch/filter-catch.component';
import { FilterService, MonthFilter } from '../../services/filter.service';
import { Month, getMonthName } from '../../enums/month';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  private readonly defaultCenter: L.LatLngTuple = [60.212664, 16.811447]; //Stockholm
  private readonly defaultZoom = 11;

  // Icons
  filterIcon = faSliders;
  filterBadgeIcon = faFunnelDollar;

  showFilterButton = true;

  private catchService = inject(CatchService);
  private mapService = inject(MapService);
  private catchInfoPopupService = inject(CatchInfoPopupService);
  private dialogState = inject(DialogStateService);
  private dialog = inject(MatDialog);
  private filterService = inject(FilterService);
  
  filteredCatches: Catch[] = [];
  currentFilter: MonthFilter | null = null;

  constructor() {
    this.dialogState.addCatchDialogOpen$
      .pipe(takeUntilDestroyed())
      .subscribe(isOpen => {
        this.showFilterButton = !isOpen;
      });

    combineLatest([
      this.catchService.catches$,
      this.filterService.currentFilter$
    ]).pipe(
      takeUntilDestroyed(),
      map(([catches, filter]) => {
        this.currentFilter = filter;
        return this.filterCatches(catches, filter);
      })
    ).subscribe(filteredCatches => {
      this.filteredCatches = filteredCatches;
      if (this.map) {
        this.addMarkers(filteredCatches);
      }
    });
  }

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = this.mapService.initMap('map', { zoomControl: false });
    this.mapService.setMapToCurrentLocation(this.map).subscribe();
    if (this.filteredCatches.length > 0) {
      this.addMarkers(this.filteredCatches);
    }
  }


  private filterCatches(catches: Catch[], filter: MonthFilter | null): Catch[] {
    if (!filter) return catches;

    return catches.filter(catchItem => {
      const catchDate = new Date(catchItem.date);
      const catchMonth = catchDate.getMonth() as Month;
      
      // Handle ranges that span across new year (e.g., Nov-Jan)
      if (filter.startMonth <= filter.endMonth) {
        return catchMonth >= filter.startMonth && catchMonth <= filter.endMonth;
      } else {
        // Range spans across new year (e.g., Nov-Jan)
        return catchMonth >= filter.startMonth || catchMonth <= filter.endMonth;
      }
    });
  }

  clearFilter(): void {
    this.filterService.clearFilter();
  }

  getMonthName(monthIndex: Month): string {
    return getMonthName(monthIndex);
  }

  private addMarkers(catches: Catch[]): void {
    if (!this.map) {
      console.error('Map is not initialized.');
      return;
    }

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

      const { element, componentRef } = this.catchInfoPopupService.createCatchInfoPopup(catchItem);

      marker.addTo(this.map!).bindPopup(element, {
        closeButton: false,
        className: 'custom-popup',
        maxWidth: 300,
        minWidth: 300
      });


      marker.on('popupclose', () => {
        this.catchInfoPopupService.destroyPopup(componentRef);
      });
    });
  }

  onFilterClick(): void {
    const isMobile = window.innerWidth < 768;
    this.dialog.open(FilterCatchComponent, {
      width: isMobile ? '100%' : '400px',
      height: isMobile ? '100%' : 'auto',
      maxWidth: '100%',
      maxHeight: '100%',
      panelClass: [
        'custom-dialog-container',
        isMobile ? 'fullscreen-mobile-dialog' : '',
      ],
      position: isMobile ? {
        top: '0',
        left: '0'
      } : undefined,
      disableClose: false
    });
  }
}
