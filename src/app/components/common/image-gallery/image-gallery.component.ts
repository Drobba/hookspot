import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Catch } from '../../../models/catch';
import { getFishImagePath } from '../../../utils/fish-image.util';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent, FontAwesomeModule],
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss']
})
export class ImageGalleryComponent {
  @Input() title: string = '';
  @Input() catches: Catch[] = [];
  @Input() showDelete: boolean = false;
  @Output() deleteCatch = new EventEmitter<string>();
  
  visibleCatchRows = 3;
  loadedImages: { [key: string]: boolean } = {};
  public trashIcon = faTrash;

  openMenuCatchId: string | null = null;

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

  openMenu(catchId: string, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuCatchId = catchId;
    document.addEventListener('click', this.closeMenuOnOutsideClick);
  }

  closeMenuOnOutsideClick = () => {
    this.openMenuCatchId = null;
    document.removeEventListener('click', this.closeMenuOnOutsideClick);
  };

  onDeleteCatch(catchId: string) {
    this.deleteCatch.emit(catchId);
    this.openMenuCatchId = null;
    document.removeEventListener('click', this.closeMenuOnOutsideClick);
  }
} 