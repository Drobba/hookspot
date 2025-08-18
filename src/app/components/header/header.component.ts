import { Component, inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLinkActive } from '@angular/router';
import { User } from '../../models/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSliders, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddCatchComponent } from '../add-catch/add-catch.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FilterCatchComponent } from '../filter-catch/filter-catch.component';
import { DialogStateService } from '../../services/dialog-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FontAwesomeModule, MatDialogModule, AddCatchComponent, RouterLink, CommonModule, RouterLinkActive, FilterCatchComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private dialogState = inject(DialogStateService);
  private readonly dialogId = 'add-catch-dialog';
  
  public addCatchIcon = faCirclePlus;
  public filterIcon = faSliders;
  user: User | undefined | null = undefined;
  isFilterDialogOpen = false;

  /**
   *
   */
  constructor() {
    this.authService.currentUser$.pipe(takeUntilDestroyed()).subscribe(user => this.user = user);
    
    // Listen to filter dialog state changes
    this.dialogState.addCatchDialogOpen$.pipe(takeUntilDestroyed()).subscribe(isOpen => {
      this.isFilterDialogOpen = isOpen;
    });
  }

  openFilterDialog() {
    // Check if filter dialog is already open
    if (this.isFilterDialogOpen) {
      return;
    }

    const isMobile = window.innerWidth < 768;
    const isLaptop = window.innerWidth >= 1024 && window.innerWidth < 1440;
    
    let dialogWidth: string;
    let dialogHeight: string;
    let dialogPosition: any;
    let panelClasses: string[];
    
    if (isMobile) {
      dialogWidth = '100%';
      dialogHeight = '100%';
      dialogPosition = { top: '0', left: '0' };
      panelClasses = ['custom-dialog-container', 'fullscreen-mobile-dialog'];
    } else if (isLaptop) {
      // Special handling for laptop screens to ensure full visibility
      dialogWidth = '100%';
      dialogHeight = '100%';
      dialogPosition = { top: '0', left: '0' };
      panelClasses = ['custom-dialog-container', 'fullscreen-laptop-dialog'];
    } else {
      // Tablet and desktop
      dialogWidth = '400px';
      dialogHeight = 'auto';
      dialogPosition = undefined;
      panelClasses = ['custom-dialog-container'];
    }

    this.dialog.open(FilterCatchComponent, {
      width: dialogWidth,
      height: dialogHeight,
      maxWidth: '100%',
      maxHeight: '100%',
      panelClass: panelClasses,
      position: dialogPosition,
      disableClose: false
    });
  }

  openFishRegisterDialog() {
    // Check if dialog is already open
    if (this.dialog.getDialogById(this.dialogId)) {
      return;
    }

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const isLaptop = window.innerWidth >= 1024 && window.innerWidth < 1440;
    const isDesktop = window.innerWidth >= 1440;

    let dialogWidth: string;
    let dialogHeight: string;
    let dialogPosition: any;
    
    if (isMobile) {
      dialogWidth = '100%';
      dialogHeight = '100%';
      dialogPosition = { top: '0', left: '0' };
    } else if (isTablet) {
      dialogWidth = '600px';
      dialogHeight = 'auto';
      dialogPosition = undefined;
    } else if (isLaptop) {
      // Fullscreen for laptop screens
      dialogWidth = '100%';
      dialogHeight = '100%';
      dialogPosition = { top: '0', left: '0' };
    } else {
      dialogWidth = '800px';
      dialogHeight = 'auto';
      dialogPosition = undefined;
    }

    this.dialog.open(AddCatchComponent, {
      id: this.dialogId,
      width: dialogWidth,
      height: dialogHeight,
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: [
        'custom-dialog-container',
        isMobile ? 'fullscreen-mobile-dialog' : '',
        isTablet ? 'tablet-dialog' : '',
        isLaptop ? 'fullscreen-laptop-dialog' : '',
        isDesktop ? 'desktop-dialog' : ''
      ],
      position: dialogPosition,
      disableClose: false
    });
  }

  logOut() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    // Cleanup handled by takeUntilDestroyed
  }
}



