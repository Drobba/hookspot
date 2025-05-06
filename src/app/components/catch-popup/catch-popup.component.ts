import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Catch } from '../../models/catch';
import { getFishImagePath } from '../../utils/fish-image.util';

@Component({
  selector: 'app-catch-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catch-popup.component.html',
  styleUrl: './catch-popup.component.scss'
})
export class CatchPopupComponent implements AfterViewInit {
  @Input() catchItem!: Catch;
  @ViewChild('imageContainer') imageContainer!: ElementRef<HTMLElement>;
  @ViewChild('fishImage') fishImage!: ElementRef<HTMLImageElement>;
  
  constructor() {}
  
  ngAfterViewInit(): void {
    // Add image load event listener using ViewChild
    if (this.fishImage && this.imageContainer) {
      const img = this.fishImage.nativeElement;
      const container = this.imageContainer.nativeElement;
      
      img.onload = () => {
        container.classList.add('image-loaded');
      };
      
      // If image is already loaded from cache
      if (img.complete) {
        container.classList.add('image-loaded');
      }
    }
  }
  
  getImageSource(): string {
    if (!this.catchItem) return '';
    return this.catchItem.imageUrl || getFishImagePath(this.catchItem.fishType);
  }
  
  onCloseClick(event: Event): void {
    event.stopPropagation();
    const closeEvent = new CustomEvent('popupClose');
    document.dispatchEvent(closeEvent);
  }
}
