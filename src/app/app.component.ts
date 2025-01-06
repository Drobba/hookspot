import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HeaderComponent, MatButtonModule], // Lägg till HeaderComponent här
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // Ändrat till styleUrls
})
export class AppComponent {
  title = 'hookspot';

  hello() {
    const hi = 'hello';
    const bye = 'bye';
  }
}
