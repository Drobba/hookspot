import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Catch } from '../../../models/catch';
import { getFishImagePath } from '../../../utils/fish-image.util';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss']
})
export class ImageGalleryComponent {
  @Input() title: string = '';
  @Input() catches: Catch[] = [];
  
  visibleCatchRows = 3;
  loadedImages: { [key: string]: boolean } = {};

  get visibleCatchesCount() {
    return this.visibleCatchRows * 2; // 2 images per row
  }

  get visibleCatches() {
    return this.catches.slice(0, this.visibleCatchesCount);
  }

  showMoreCatches() {
    this.visibleCatchRows += 3;
  }

  getCatchImageSource(catchItem: Catch): string {
    return catchItem.imageUrl || getFishImagePath(catchItem.fishType);
  }

  onImageLoad(catchId: string): void {
    this.loadedImages[catchId] = true;
  }

  isImageLoaded(catchId: string): boolean {
    return this.loadedImages[catchId] || false;
  }
} 