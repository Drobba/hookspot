import { Component, inject, OnDestroy } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DialogStateService } from '../../services/dialog-state.service';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FilterService } from '../../services/filter.service';
import { Month, getMonthName } from '../../enums/month';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-filter-catch',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatSliderModule, 
    FormsModule, 
    MatButtonModule,
    FontAwesomeModule
  ],
  templateUrl: './filter-catch.component.html',
  styleUrls: ['./filter-catch.component.scss'],
})
export class FilterCatchComponent implements OnDestroy {
  public dialogRef = inject(MatDialogRef<FilterCatchComponent>);
  private dialogState = inject(DialogStateService);
  private filterService = inject(FilterService);

  // Icons
  closeIcon = faTimes;

  rangeStart = Month.JANUARY;
  rangeEnd = Month.DECEMBER;

  constructor() {
    this.dialogState.addCatchDialogOpen$.next(true);
    
    // Initialisera slider-värdena baserat på aktivt filter
    const currentFilter = this.filterService.getCurrentFilter();
    if (currentFilter) {
      this.rangeStart = currentFilter.startMonth;
      this.rangeEnd = currentFilter.endMonth;
    }
  }

  close(): void {
    this.dialogRef.close();
    this.dialogState.addCatchDialogOpen$.next(false);
  }

  applyFilter(): void {
    this.filterService.applyFilter({
      startMonth: this.rangeStart,
      endMonth: this.rangeEnd
    });
    this.close();
  }

  resetFilter(): void {
    this.rangeStart = Month.JANUARY;
    this.rangeEnd = Month.DECEMBER;
    this.filterService.clearFilter();
    this.close();
  }

  ngOnDestroy(): void {
    this.dialogState.addCatchDialogOpen$.next(false);
  }

  getMonthName(value: Month): string {
    return getMonthName(value);
  }

  getThumbPosition(value: Month): number {
    // Returnerar procentbaserad position för värdet på slidern
    return ((value - Month.JANUARY) / (Month.DECEMBER - Month.JANUARY)) * 100;
  }
} 