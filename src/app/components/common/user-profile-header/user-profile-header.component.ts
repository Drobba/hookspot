import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile-header.component.html',
  styleUrl: './user-profile-header.component.scss'
})
export class UserProfileHeaderComponent {
  @Input() userName?: string;
  @Input() email?: string;
  @Input() avatarUrl: string = 'assets/default-user.svg';

}
