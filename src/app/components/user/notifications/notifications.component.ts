import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeftLong, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, FontAwesomeModule, RouterLink], // ✅ Lägg till Material moduler
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {

  public backIcon = faArrowLeftLong;

  invitations = [
    { inviter: 'John Doe', group: 'Fishing Masters' },
    { inviter: 'Alice Smith', group: 'Deep Sea Hunters' },
    { inviter: 'Bob Johnson', group: 'River Explorers' },
    { inviter: 'Emma Brown', group: 'Lake Legends' },
    { inviter: 'Emma Brown', group: 'Lake Legends' },
    { inviter: 'Emma Brown', group: 'Lake Legends' },
    { inviter: 'Emma Brown', group: 'Lake Legends' },
    { inviter: 'Emma Brown', group: 'Lake Legends' },
    { inviter: 'John Doe', group: 'Fishing Masters' },
    { inviter: 'Alice Smith', group: 'Deep Sea Hunters' },
    { inviter: 'Bob Johnson', group: 'River Explorers' },
    { inviter: 'Emma Brown', group: 'Lake Legends' },
    { inviter: 'Emma Brown', group: 'Lake Legends' },
    { inviter: 'Emma Brown', group: 'Lake Legends' },
    { inviter: 'Emma Brown', group: 'Lake Legends' },
    { inviter: 'Emma Brown', group: 'Lake Legends' },
  ];
}
