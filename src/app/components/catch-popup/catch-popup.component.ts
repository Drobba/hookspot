import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Catch } from '../../models/catch';
import { getFishImagePath } from '../../utils/fish-image.util';
import { SkeletonLoaderComponent } from '../common/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-catch-popup',
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  templateUrl: './catch-popup.component.html',
  styleUrl: './catch-popup.component.scss'
})
export class CatchPopupComponent {
  @Input() catchItem!: Catch;
  @Output() close = new EventEmitter<void>();
  isImageLoaded = false;

  getImageSource(): string {
    if (!this.catchItem) return '';
    return this.catchItem.imageUrl || getFishImagePath(this.catchItem.fishType);
  }

  onImageLoad(): void {
    this.isImageLoaded = true;
  }

  onCloseClick(): void {
    this.close.emit();
  }
}
