import { Component, inject } from '@angular/core';
import { Catch, CrtCatchInput } from '../../models/catch';
import { CatchService } from '../../services/catch.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
@Component({
  selector: 'app-add-catch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, FontAwesomeModule],
  templateUrl: './add-catch.component.html',
  styleUrls: ['./add-catch.component.scss'],
})
export class AddCatchComponent {
  private catchService = inject(CatchService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<AddCatchComponent>);
  closeIcon = faTimes;

  user?: User | null;
  catches: Catch[] = [];
  availableFishes: string[] = ['Gädda', 'Abborre', 'Gös', 'Regnbågslax', 'Röding', 'Lax', 'Öring'];

  // Reactive Form
  catchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.catchForm = this.fb.group({
      fishType: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(0.1)]],
    });

    this.catchService.catches$
      .pipe(takeUntilDestroyed())
      .subscribe((catches) => (this.catches = catches));

    this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe((user) => (this.user = user));
  }

  async addItem(): Promise<void> {
    if (this.catchForm.invalid) {
      console.error('Formuläret är ogiltigt.');
      return;
    }

    if (!this.user) {
      return;
    }

    const position = await this.getCurrentLocation();
    if (!position) {
      return;
    }

    const newCatch: CrtCatchInput = {
      fishType: this.catchForm.value.fishType,
      fishWeight: parseFloat(this.catchForm.value.weight),
      user: {
        userId: this.user.userId,
        email: this.user.email,
        userName: this.user.userName,
      },
      location: {
        lat: position.latitude,
        lng: position.longitude,
      },
    };

    try {
      await this.catchService.addCatch(newCatch);
      this.catchForm.reset(); // Återställ formuläret
      this.closeDialog();
    } catch (error) {
      console.error('Error adding catch:', error);
      this.closeDialog();
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  private getCurrentLocation(): Promise<GeolocationCoordinates | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation stöds inte av webbläsaren.');
        resolve(null);
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          (error) => {
            console.error('Geolocation error:', error);
            resolve(null);
          }
        );
      }
    });
  }
}

