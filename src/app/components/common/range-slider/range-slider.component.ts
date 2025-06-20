import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';

export interface RangeSliderConfig {
  header: string;
  options: number[];
  formatLabel: (value: number) => string;
  startValue: number;
  endValue: number;
}

@Component({
  selector: 'app-range-slider',
  standalone: true,
  imports: [CommonModule, MatSliderModule, FormsModule],
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.scss'],
})
export class RangeSliderComponent {
  @Input() config!: RangeSliderConfig;

  @Output() startValueChange = new EventEmitter<number>();
  @Output() endValueChange = new EventEmitter<number>();

  get min(): number {
    if (!this.config || !this.config.options || this.config.options.length === 0) {
      return 0;
    }
    return Math.min(...this.config.options);
  }

  get max(): number {
    if (!this.config || !this.config.options || this.config.options.length === 0) {
      return 100;
    }
    return Math.max(...this.config.options);
  }

  getThumbPosition(value: number): number {
    if (this.max === this.min) {
      return 0;
    }
    return ((value - this.min) / (this.max - this.min)) * 100;
  }
} 