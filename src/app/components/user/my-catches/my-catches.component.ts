import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatchService } from '../../../services/catch.service';
import { AuthService } from '../../../services/auth.service';
import { Catch } from '../../../models/catch';
import { User } from '../../../models/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageGalleryComponent } from '../../common/image-gallery/image-gallery.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from '../../common/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-my-catches',
  standalone: true,
  imports: [CommonModule, ImageGalleryComponent, FontAwesomeModule, RouterLink],
  templateUrl: './my-catches.component.html',
  styleUrls: ['./my-catches.component.scss']
})
export class MyCatchesComponent {
  private catchService = inject(CatchService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  public backIcon = faArrowLeftLong;

  user?: User | null;
  myCatches: Catch[] = [];

  constructor() {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe(user => {
        this.user = user;
        this.filterCatches();
      });

    this.catchService.catches$
      .pipe(takeUntilDestroyed())
      .subscribe(catches => {
        this.filterCatches(catches);
      });
  }

  private filterCatches(catches?: Catch[]) {
    if (!this.user) {
      this.myCatches = [];
      return;
    }
    const allCatches = catches || [];
    this.myCatches = allCatches
      .filter(c => c.user.userId === this.user?.userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async onDeleteCatch(catchId: string) {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Bekräfta borttagning',
        message: 'Är du säker på att du vill ta bort denna fångst?',
        confirmText: 'Ta bort',
        cancelText: 'Avbryt'
      }
    });
    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      await this.catchService.deleteCatch(catchId);
    }
  }
} 