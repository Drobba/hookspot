import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faPeopleGroup, faBell, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './user.component.html',
})
export class UserComponent {
  public userIcon = faUser;
  public teamsIcon = faPeopleGroup;
  public notificationIcon = faBell;
  public logoutIcon = faArrowRightFromBracket;
}
