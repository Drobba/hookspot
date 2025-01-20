import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AuthSerivce } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { LoginRegisterPageComponent } from './components/login-register-page/login-register-page.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    HeaderComponent,
    MatButtonModule,
    CommonModule,
    MatCardModule,
    MatTabsModule,
    LoginRegisterPageComponent
  ], // Lägg till HeaderComponent här
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // Ändrat till styleUrls
})
export class AppComponent {
  title = 'hookspot';

  authService = inject(AuthSerivce);

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email!,
          userName: user.displayName!,
        });
      } else {
        this.authService.currentUserSig.set(null); //Sätter till null om vi inte har loggat in än. Vill bara spara värdet av en user om vi loggat in.
      }
      console.log(this.authService.currentUserSig());
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
