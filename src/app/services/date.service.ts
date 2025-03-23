import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  getTodayAsIsoDate(): string {
    return new Date().toISOString().split('T')[0];
  }


  formatToIso(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
