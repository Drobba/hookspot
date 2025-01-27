import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html', // Ändrat till styleUrls
})
export class HeaderComponent {
  authService = inject(AuthService);
  router = inject(Router);

  user: User | undefined | null = undefined;

  /**
   *
   */
  constructor() {
    this.authService.currentUser$.pipe(takeUntilDestroyed()).subscribe(user => this.user = user);
  }

  // ngOnInit(): void {
  //   this.authService.user$.subscribe((user) => {
  //     this.userName = user?.displayName || null;
  //   });
  // }

  logOut() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
