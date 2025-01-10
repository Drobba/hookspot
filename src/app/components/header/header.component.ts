import { Component, inject } from '@angular/core';
import { AuthSerivce } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html', // Ändrat till styleUrls
})
export class HeaderComponent {
  authService = inject(AuthSerivce);

  userName: string | null = null;

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.userName = user?.displayName || null;
    });
  }
}
