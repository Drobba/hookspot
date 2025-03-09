import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // ✅ Importera Router och NavigationEnd
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faPeopleGroup, faBell, faArrowRightFromBracket, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FontAwesomeModule, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './user.component.html',
})
export class UserComponent {
  public userIcon = faUser;
  public teamsIcon = faPeopleGroup;
  public notificationIcon = faBell;
  public logoutIcon = faArrowRightFromBracket;
  public angleRightIcon = faAngleRight;

  showSettings: boolean = true; // ✅ Börjar med att settings-menyn är synlig

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // ✅ Om path INTE är "/user" -> Dölj settings
        this.showSettings = event.url === '/user';
      }
    });
  }
}
