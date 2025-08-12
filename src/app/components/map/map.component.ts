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
import { FilterService, FilterSettings } from '../../services/filter.service';
import { Month, getMonthName } from '../../enums/month';
import { Weight, getWeightName } from '../../enums/weight';
import { FishType } from '../../enums/fish-type';
import { combineLatest, map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';

interface FishMapIconConfig {
  size: [number, number];
  anchor: [number, number];
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private static readonly DEFAULT_CENTER: L.LatLngTuple = [60.212664, 16.811447];
  private static readonly DEFAULT_ZOOM = 11;
  private static readonly DEFAULT_ICON_SIZE: [number, number] = [60, 40];
  private static readonly DEFAULT_ICON_ANCHOR: [number, number] = [30, 20];
  
  private static readonly FISH_ICON_SIZES: Record<FishType, FishMapIconConfig> = {
    'Gös': { size: [45, 30], anchor: [22, 15] },
    'Abborre': { size: [45, 30], anchor: [22, 15] },
    'Gädda': { size: [60, 55], anchor: [30, 24] },
    'Makrill': { size: [60, 50], anchor: [30, 25] },
    'Harr': { size: [60, 40], anchor: [30, 20] },
    'Öring': { size: [60, 40], anchor: [30, 20] },
    'Lax': { size: [60, 40], anchor: [30, 20] },
    'Röding': { size: [60, 40], anchor: [30, 20] },
    'Regnbågslax': { size: [60, 40], anchor: [30, 20] },
    'Sej': { size: [60, 40], anchor: [30, 20] }
  };
  
  private map: L.Map | undefined;
  private readonly defaultCenter: L.LatLngTuple = MapComponent.DEFAULT_CENTER;
  private readonly defaultZoom = MapComponent.DEFAULT_ZOOM;

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
  private authService = inject(AuthService);
  
  filteredCatches: Catch[] = [];
  filterSettings: FilterSettings | null = null;
  user: User | null = null;

  constructor() {
    this.dialogState.addCatchDialogOpen$
      .pipe(takeUntilDestroyed())
      .subscribe(isOpen => {
        this.showFilterButton = !isOpen;
      });

    combineLatest([
      this.catchService.catches$,
      this.filterService.filterSettings$,
      this.authService.currentUser$
    ]).pipe(
      takeUntilDestroyed(),
      map(([catches, filter, user]) => {
        this.filterSettings = filter;
        this.user = user || null;
        return this.filterCatches(catches, filter);
      })
    ).subscribe(filteredCatches => {
      this.filteredCatches = filteredCatches;
      if (this.map) {
        this.addMarkers(filteredCatches);
      }
    });
  }

  /**
   * Initialize the map after component view is ready
   */
  ngOnInit(): void {
    this.initMap();
  }

  /**
   * Initialize the Leaflet map and set to current location
   */
  private initMap(): void {
    this.map = this.mapService.initMap('map', { zoomControl: false });
    this.mapService.setMapToCurrentLocation(this.map).subscribe({
      error: (error) => console.error('Failed to set map location:', error)
    });
    if (this.filteredCatches.length > 0) {
      this.addMarkers(this.filteredCatches);
    }
  }

  /**
   * Filter catches based on month, weight, and user preferences
   */
  private filterCatches(catches: Catch[], filter: FilterSettings | null): Catch[] {
    if (!filter) return catches;

    return catches.filter(catchItem => {
      let matchesMonth = true;
      let matchesWeight = true;
      let matchesUser = true;

      // Check month filter
      if (filter.monthFilter) {
        const catchDate = new Date(catchItem.date);
        const catchMonth = catchDate.getMonth() as Month;
        
        // Handle ranges that span across new year (e.g., Nov-Jan)
        if (filter.monthFilter.startMonth <= filter.monthFilter.endMonth) {
          matchesMonth = catchMonth >= filter.monthFilter.startMonth && catchMonth <= filter.monthFilter.endMonth;
        } else {
          // Range spans across new year (e.g., Nov-Jan)
          matchesMonth = catchMonth >= filter.monthFilter.startMonth || catchMonth <= filter.monthFilter.endMonth;
        }
      }

      // Check weight filter
      if (filter.weightFilter) {
        const catchWeight = catchItem.fishWeight;
        matchesWeight = catchWeight >= filter.weightFilter.startWeight && catchWeight <= filter.weightFilter.endWeight;
      }

      // Check user filter
      if (filter.showOnlyMyCatches && this.user) {
        matchesUser = catchItem.user.userId === this.user.userId;
      }

      // All conditions must be met (AND logic)
      return matchesMonth && matchesWeight && matchesUser;
    });
  }

  /**
   * Clear all active filters
   */
  clearFilter(): void {
    this.filterService.clearFilter();
  }

  /**
   * Get the display name for a month index
   */
  getMonthName(monthIndex: Month): string {
    return getMonthName(monthIndex);
  }

  /**
   * Get the display name for a weight value
   */
  getWeightName(weightValue: Weight): string {
    return getWeightName(weightValue);
  }

  /**
   * Get formatted text displaying active filters
   */
  getFilterDisplayText(): string {
    if (!this.filterSettings) return '';
    
    const parts: string[] = [];
    
    if (this.filterSettings.monthFilter) {
      parts.push(`${this.getMonthName(this.filterSettings.monthFilter.startMonth)} - ${this.getMonthName(this.filterSettings.monthFilter.endMonth)}`);
    }
    
    if (this.filterSettings.weightFilter) {
      parts.push(`${this.getWeightName(this.filterSettings.weightFilter.startWeight)} - ${this.getWeightName(this.filterSettings.weightFilter.endWeight)}`);
    }

    if (this.filterSettings.showOnlyMyCatches) {
      parts.push('My catches only');
    }
    
    return parts.join(' • ');
  }

  /**
   * Check if any filters are currently active
   */
  hasActiveFilters(): boolean {
    return this.filterSettings !== null && (
      this.filterSettings.monthFilter !== undefined || 
      this.filterSettings.weightFilter !== undefined ||
      this.filterSettings.showOnlyMyCatches === true
    );
  }

  /**
   * Add markers for all filtered catches to the map
   */
  private addMarkers(catches: Catch[]): void {
    if (!this.map) {
      console.error('Map is not initialized.');
      return;
    }
    this.clearExistingMarkers();
    catches.forEach(catchItem => this.addSingleMarker(catchItem));
  }

  /**
   * Remove all existing markers from the map
   */
  private clearExistingMarkers(): void {
    this.map?.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map?.removeLayer(layer);
      }
    });
  }

  /**
   * Add a single catch marker to the map with popup
   */
  private addSingleMarker(catchItem: Catch): void {
    const customIcon = this.createCustomIcon(catchItem.fishType);
    
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
  }

  /**
   * Create a custom icon for a specific fish type with appropriate sizing
   */
  private createCustomIcon(fishType: FishType): L.Icon {
    const fishIconConfig = MapComponent.FISH_ICON_SIZES[fishType] || {
      size: MapComponent.DEFAULT_ICON_SIZE,
      anchor: MapComponent.DEFAULT_ICON_ANCHOR
    };

    const iconUrl = getFishImagePath(fishType);
    return L.icon({
      iconUrl: iconUrl,
      iconSize: fishIconConfig.size,
      iconAnchor: fishIconConfig.anchor,
      popupAnchor: [0, -12],
      className: 'fish-marker'
    });
  }

  /**
   * Open the filter dialog with responsive sizing for mobile/desktop
   */
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
