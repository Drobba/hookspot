import { Component, inject } from '@angular/core';
import { AuthSerivce } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'], // Ändrat till styleUrls
})
export class HeaderComponent {
  authService = inject(AuthSerivce);
}
