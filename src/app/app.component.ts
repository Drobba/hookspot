import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { LoginRegisterPageComponent } from './components/login-register-page/login-register-page.component';
import { FormsModule } from '@angular/forms';
import { User } from './models/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    HeaderComponent,
    FormsModule,
    CommonModule,
  ], // Lägg till HeaderComponent här
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // Ändrat till styleUrls
})
export class AppComponent {
  authService = inject(AuthService);
  user?: User | null;

  constructor() {
    this.authService.currentUser$.pipe(takeUntilDestroyed()).subscribe(user => this.user = user);
  }

  logout(): void {
    this.authService.logout();
  }
}
