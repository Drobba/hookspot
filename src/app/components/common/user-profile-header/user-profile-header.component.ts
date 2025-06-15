import { Component, Input, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-profile-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
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
  readonly editIcon = faPen;

  onAvatarClick() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.userId) {
      try {
        // Update UI immediately with a temporary URL for the file
        const tempUrl = URL.createObjectURL(file);
        this.avatarUrl = tempUrl;
        
        // Upload the file in the background
        const url = await this.userService.uploadAvatar(this.userId, file);
        this.avatarUrl = url;
      } catch (error) {
        console.error('Error uploading avatar:', error);
        // Restore previous URL on error
        this.avatarUrl = this.avatarUrl;
      } finally {
        // Clean up the temporary URL
        URL.revokeObjectURL(this.avatarUrl);
      }
    }
  }
}
