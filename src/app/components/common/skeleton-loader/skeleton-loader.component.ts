// SkeletonLoaderComponent: A reusable component for displaying a skeleton loading animation while content (such as images) is being loaded.
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss']
})

export class SkeletonLoaderComponent {
  @Input() width: string = '100%';
  @Input() height: string = '100%';
} 