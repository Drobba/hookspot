import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { Catch, CrtCatchInput } from '../../models/catch';
import { CatchService } from '../../services/catch.service';
import { DateService } from '../../services/date.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { MapService } from '../../services/map.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { faTimes, faLocationPin, faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-add-catch',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    MatButtonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    FontAwesomeModule,
    MatStepperModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-catch.component.html',
  styleUrls: ['./add-catch.component.scss'],
})
export class AddCatchComponent {
  private catchService = inject(CatchService);
  private authService = inject(AuthService);
  private dateService = inject(DateService);
  private mapService = inject(MapService);
  private storage = inject(Storage);
  private dialogRef = inject(MatDialogRef<AddCatchComponent>);
  public spinnerService = inject(SpinnerService);
  
  closeIcon = faTimes;
  locationIcon = faLocationPin;
  imageIcon = faImage;

  user?: User | null;
  catches: Catch[] = [];
  availableFishes: string[] = ['Gädda', 'Abborre', 'Gös', 'Regnbågslax', 'Röding', 'Lax', 'Öring'];

  // Map related properties
  private map?: L.Map;
  selectedLocation?: { lat: number; lng: number };

  // Image upload related properties
  selectedImage: File | null = null;
  selectedImageUrl: string | null = null;
  isUploading = false;

  // Forms for both steps
  locationForm: FormGroup;
  catchForm: FormGroup;

  @ViewChild('previewImage') previewImage!: ElementRef;
  
  private isDragging = false;
  private startY = 0;
  private currentY = 0;
  private maxDrag = 0;

  constructor(private fb: FormBuilder) {
    // Initialize both forms
    this.locationForm = this.fb.group({
      location: [null, Validators.required]
    });

    this.catchForm = this.fb.group({
      fishType: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(0.1)]],
      length: ['', [Validators.required, Validators.min(1)]],
      bait: ['', Validators.required]
    });

    this.catchService.catches$
      .pipe(takeUntilDestroyed())
      .subscribe((catches) => (this.catches = catches));

    this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe((user) => (this.user = user));
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 0);
  }

  private initMap(): void {
    this.map = this.mapService.initMap('catch-location-map', {
      zoomControl: false,
    }, false);

    // Set map to current location and update form
    this.mapService.setMapToCurrentLocation(this.map).subscribe(location => {
      this.selectedLocation = location;
      this.locationForm.patchValue({
        location: this.selectedLocation
      });
    });

    // Update location when map moves
    this.map.on('moveend', () => {
      if (this.map) {
        const center = this.map.getCenter();
        this.selectedLocation = { lat: center.lat, lng: center.lng };
        
        // Update form
        this.locationForm.patchValue({
          location: this.selectedLocation
        });
      }
    });
  }

  startImageDrag(event: MouseEvent) {
    if (!this.previewImage) return;
    
    this.isDragging = true;
    this.startY = event.clientY - this.currentY;
    
    // Beräkna max dragavstånd baserat på bildens höjd
    const img = this.previewImage.nativeElement;
    const containerHeight = img.parentElement.offsetHeight;
    this.maxDrag = Math.max(0, img.offsetHeight - containerHeight);
    
    document.addEventListener('mousemove', this.handleImageDrag);
    document.addEventListener('mouseup', this.stopImageDrag);
  }

  private handleImageDrag = (event: MouseEvent) => {
    if (!this.isDragging) return;
    
    event.preventDefault();
    
    // Beräkna ny Y-position med begränsningar
    this.currentY = event.clientY - this.startY;
    this.currentY = Math.min(0, Math.max(-this.maxDrag, this.currentY));
    
    const img = this.previewImage.nativeElement;
    img.style.transform = `translateY(${this.currentY}px)`;
  }

  private stopImageDrag = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleImageDrag);
    document.removeEventListener('mouseup', this.stopImageDrag);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      // Återställ dragposition när ny bild väljs
      this.currentY = 0;
      // Skapa förhandsvisnings-URL
      this.selectedImageUrl = URL.createObjectURL(this.selectedImage);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.selectedImageUrl = null;
    this.currentY = 0;
  }

  async addItem(): Promise<void> {
    if (this.catchForm.invalid || !this.selectedLocation) {
      console.error('Form is invalid or location not selected');
      return;
    }

    if (!this.user) {
      return;
    }

    try {
      this.spinnerService.showSpinner();
      this.isUploading = true;
      let imageUrl: string | undefined;

      if (this.selectedImage) {
        imageUrl = await this.uploadImage(this.selectedImage);
      }

      // Bygg newCatch utan imageUrl om den är undefined
      const newCatch: CrtCatchInput = {
        fishType: this.catchForm.value.fishType,
        fishWeight: parseFloat(this.catchForm.value.weight),
        fishLength: parseFloat(this.catchForm.value.length),
        bait: this.catchForm.value.bait,
        date: this.dateService.getTodayAsIsoDate(),
        user: {
          userId: this.user.userId,
          email: this.user.email,
          userName: this.user.userName,
        },
        location: this.selectedLocation,
        ...(imageUrl ? { imageUrl } : {}) // Lägg bara till imageUrl om det finns
      };

      await this.catchService.addCatch(newCatch);
      this.catchForm.reset();
      this.closeDialog();
    } catch (error) {
      console.error('Error adding catch:', error);
    } finally {
      this.isUploading = false;
      this.spinnerService.hideSpinner();
    }
  }

  closeDialog(): void {
    if (this.selectedImageUrl) {
      URL.revokeObjectURL(this.selectedImageUrl);
    }
    this.dialogRef.close();
  }

  private async uploadImage(file: File): Promise<string> {
    const timestamp = new Date().getTime();
    const filePath = `catches/${this.user?.userId}/${timestamp}_${file.name}`;
    const fileRef = ref(this.storage, filePath);
    
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  }
}

