import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Month } from '../enums/month';

export interface MonthFilter {
  startMonth: Month;
  endMonth: Month;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private currentFilterSubject = new BehaviorSubject<MonthFilter | null>(null);
  public currentFilter$ = this.currentFilterSubject.asObservable();

  applyFilter(filter: MonthFilter): void {
    this.currentFilterSubject.next(filter);
  }

  clearFilter(): void {
    this.currentFilterSubject.next(null);
  }

  getCurrentFilter(): MonthFilter | null {
    return this.currentFilterSubject.value;
  }
} 