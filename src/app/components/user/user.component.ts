import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // ✅ Importera Router och NavigationEnd
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faPeopleGroup, faBell, faArrowRightFromBracket, faAngleRight, faFish, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SettingsItemComponent } from '../common/settings-item/settings-item.component';
import { UserProfileHeaderComponent } from '../common/user-profile-header/user-profile-header.component';
import { SettingMenuItem } from '../../models/setting-menu-item';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FontAwesomeModule, RouterOutlet, RouterLink, CommonModule, SettingsItemComponent, UserProfileHeaderComponent],
  templateUrl: './user.component.html',
})
export class UserComponent {
  public readonly userIcon = faUser;
  public readonly teamsIcon = faPeopleGroup;
  public readonly notificationIcon = faBell;
  public readonly logoutIcon = faArrowRightFromBracket;
  public readonly angleRightIcon = faAngleRight;
  public readonly catchesIcon = faFish;

  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  public pendingInviteCount = 0;

  user?: User | null;

  showSettings: boolean = true;

  public readonly title = 'Account';

  getHeaderClass(): string {
    return !this.showSettings ? 'mb-6' : '';
  }

  public settingsMenuItems: SettingMenuItem[] = [
    { icon: this.catchesIcon, label: 'My Catches', path: 'my-catches'},
    { icon: this.teamsIcon, label: 'Teams', path: 'teams'},
    { icon: this.notificationIcon, label: 'Notifications', path: 'notifications'},
  ]

  constructor() {
    this.authService.currentUser$.pipe(takeUntilDestroyed()).subscribe(user => this.user = user);
    
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showSettings = event.url === '/user';
      }
    });

    this.userService.invites$
    .pipe(takeUntilDestroyed())
    .subscribe(invites => {
      this.pendingInviteCount = invites.length;
    });
  }

  logOut() {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }
}
