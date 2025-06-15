import { Component, Input, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';

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
  @Input() userId?: string;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private userService = inject(UserService);

  onAvatarClick() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.userId) {
      const url = await this.userService.uploadAvatar(this.userId, file);
      this.avatarUrl = url;
    }
  }
}
