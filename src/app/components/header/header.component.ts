import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLocationDot, faCirclePlus, faStar, faUser, faTrophy  } from '@fortawesome/free-solid-svg-icons';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddCatchComponent } from '../add-catch/add-catch.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FontAwesomeModule, MatDialogModule, AddCatchComponent, RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private readonly dialogId = 'add-catch-dialog';
  
  public locationIcon = faLocationDot;
  public addCatchIcon = faCirclePlus;
  public starIcon = faStar;
  public userIcon = faUser;
  public trophyIcon = faTrophy;
  user: User | undefined | null = undefined;

  /**
   *
   */
  constructor() {
    this.authService.currentUser$.pipe(takeUntilDestroyed()).subscribe(user => this.user = user);
  }

  openFishRegisterDialog() {
    // Check if dialog is already open
    if (this.dialog.getDialogById(this.dialogId)) {
      return;
    }

    const isMobile = window.innerWidth < 768;
    this.dialog.open(AddCatchComponent, {
      id: this.dialogId,
      width: isMobile ? '100%' : '400px',
      height: isMobile ? '100%' : 'auto',
      maxWidth: '100%',
      maxHeight: '100%',
      panelClass: [
        'custom-dialog-container',
        isMobile ? 'fullscreen-mobile-dialog' : '',
      ],
      position: isMobile ? {
        top: '0',
        left: '0'
      } : undefined,
      disableClose: false
    });
  }

  logOut() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
