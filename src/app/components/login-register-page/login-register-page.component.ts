import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@Component({
  selector: 'app-login-register-page',
  standalone: true,
  imports: [MatCardModule, MatTabsModule, MatButtonModule, LoginComponent, RegisterComponent],
  templateUrl: './login-register-page.component.html',
  styleUrls: ['./login-register-page.component.scss']
})
export class LoginRegisterPageComponent {

}
