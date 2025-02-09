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

@Component({
  selector: 'app-add-catch',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule],
  templateUrl: './add-catch.component.html',
  styleUrls: ['./add-catch.component.scss'],
})
export class AddCatchComponent {
  private catchService = inject(CatchService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<AddCatchComponent>);

  user?: User | null;
  catches: Catch[] = [];
  fiskArt = '';
  vikt = '';

  constructor() {
    // Prenumerera på `catches$` och uppdatera lokala fångster
    this.catchService.catches$
      .pipe(takeUntilDestroyed())
      .subscribe((catches) => (this.catches = catches));

      this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe((user) => (this.user = user));
  }

  /**
   * Lägg till en ny fångst via CatchService
   */
  async addItem(): Promise<void> {
    if (!this.fiskArt || !this.vikt) {
      console.error('Fiskart och vikt måste anges.');
      return;
    }

    if(!this.user) {

      return;
    }

    const newCatch: CrtCatchInput = {
      fishType: this.fiskArt,
      fishWeight: parseFloat(this.vikt),
      user: {
        userId: this.user.userId,
        email: this.user.email, 
        userName: this.user.userName, 
      },
    };

    try {
      await this.catchService.addCatch(newCatch); // Lägg till fångsten via tjänsten
      this.fiskArt = ''; // Rensa formulärfält
      this.vikt = '';
    } catch (error) {
      console.error('Error adding catch:', error);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
