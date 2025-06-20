import { Component, inject, OnDestroy } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DialogStateService } from '../../services/dialog-state.service';
import { MatButtonModule } from '@angular/material/button';
import { FilterService, FilterSettings } from '../../services/filter.service';
import { Month, getMonthName } from '../../enums/month';
import { Weight, getWeightName } from '../../enums/weight';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { RangeSliderComponent, RangeSliderConfig } from '../common/range-slider/range-slider.component';

@Component({
  selector: 'app-filter-catch',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FontAwesomeModule,
    RangeSliderComponent,
  ],
  templateUrl: './filter-catch.component.html',
  styleUrls: ['./filter-catch.component.scss'],
})
export class FilterCatchComponent implements OnDestroy {
  public dialogRef = inject(MatDialogRef<FilterCatchComponent>);
  private dialogState = inject(DialogStateService);
  private filterService = inject(FilterService);

  closeIcon = faTimes;

  // Month range state
  monthStart = Month.JANUARY;
  monthEnd = Month.DECEMBER;
  private monthOptions: number[] = Object.values(Month).filter(v => typeof v === 'number') as number[];

  // Weight range state
  weightStart = Weight.ONE;
  weightEnd = Weight.TWENTY_FIVE;
  private weightOptions: number[] = Object.values(Weight).filter(v => typeof v === 'number') as number[];

  // Slider Configurations
  get monthSliderConfig(): RangeSliderConfig {
    return {
      header: 'Show only catches caught between:',
      options: this.monthOptions,
      formatLabel: this.formatMonthLabel,
      startValue: this.monthStart,
      endValue: this.monthEnd,
    };
  }

  get weightSliderConfig(): RangeSliderConfig {
    return {
      header: 'Show only catches weighing between:',
      options: this.weightOptions,
      formatLabel: this.formatWeightLabel,
      startValue: this.weightStart,
      endValue: this.weightEnd,
    };
  }

  Month = Month;
  Weight = Weight;

  constructor() {
    this.dialogState.addCatchDialogOpen$.next(true);

    const filterSettings = this.filterService.getFilterSettings();
    if (filterSettings) {
      if (filterSettings.monthFilter) {
        this.monthStart = filterSettings.monthFilter.startMonth;
        this.monthEnd = filterSettings.monthFilter.endMonth;
      }
      if (filterSettings.weightFilter) {
        this.weightStart = filterSettings.weightFilter.startWeight;
        this.weightEnd = filterSettings.weightFilter.endWeight;
      }
    }
  }

  // Formatting functions for the sliders
  private formatMonthLabel = (value: number): string => getMonthName(value as Month);
  private formatWeightLabel = (value: number): string => getWeightName(value as Weight);

  private getDefaultFilterSettings() {
    return {
      monthFilter: {
        startMonth: Month.JANUARY,
        endMonth: Month.DECEMBER,
      },
      weightFilter: {
        startWeight: Weight.ONE,
        endWeight: Weight.TWENTY_FIVE,
      },
    };
  }

  close(): void {
    this.dialogRef.close();
    this.dialogState.addCatchDialogOpen$.next(false);
  }

  applyFilter(): void {
    const filterSettings: FilterSettings = {};
    const defaults = this.getDefaultFilterSettings();

    if (
      this.monthStart !== defaults.monthFilter.startMonth ||
      this.monthEnd !== defaults.monthFilter.endMonth
    ) {
      filterSettings.monthFilter = {
        startMonth: this.monthStart,
        endMonth: this.monthEnd,
      };
    }

    if (
      this.weightStart !== defaults.weightFilter.startWeight ||
      this.weightEnd !== defaults.weightFilter.endWeight
    ) {
      filterSettings.weightFilter = {
        startWeight: this.weightStart,
        endWeight: this.weightEnd,
      };
    }

    this.filterService.applyFilter(filterSettings);
    this.close();
  }

  resetFilter(): void {
    const defaults = this.getDefaultFilterSettings();
    this.monthStart = defaults.monthFilter.startMonth;
    this.monthEnd = defaults.monthFilter.endMonth;
    this.weightStart = defaults.weightFilter.startWeight;
    this.weightEnd = defaults.weightFilter.endWeight;
    this.filterService.clearFilter();
    this.close();
  }

  ngOnDestroy(): void {
    this.dialogState.addCatchDialogOpen$.next(false);
  }
} 