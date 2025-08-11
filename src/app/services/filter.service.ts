/**
 * Service for managing catch filtering settings including month, weight, and user-specific filters.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Month } from '../enums/month';
import { Weight } from '../enums/weight';

export interface MonthFilter {
  startMonth: Month;
  endMonth: Month;
}

export interface WeightFilter {
  startWeight: Weight;
  endWeight: Weight;
}

export interface FilterSettings {
  monthFilter?: MonthFilter;
  weightFilter?: WeightFilter;
  showOnlyMyCatches?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filterSettingsSubject = new BehaviorSubject<FilterSettings | null>(null);
  public filterSettings$ = this.filterSettingsSubject.asObservable();

  applyFilter(filter: FilterSettings): void {
    this.filterSettingsSubject.next(filter);
  }

  clearFilter(): void {
    this.filterSettingsSubject.next(null);
  }

  getFilterSettings(): FilterSettings | null {
    return this.filterSettingsSubject.value;
  }
} 