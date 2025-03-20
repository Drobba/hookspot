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
  templateUrl: './header.component.html', // Ändrat till styleUrls
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog)
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
    this.dialog.open(AddCatchComponent, {
      width: '400px',
      height: 'auto',
      panelClass: 'custom-dialog-container'
    });
  }


  logOut() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
