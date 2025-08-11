import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { Invite } from '../../../models/invite';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TeamService } from '../../../services/team.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, FontAwesomeModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  public backIcon = faArrowLeftLong;

  private userService = inject(UserService);
  private teamService = inject(TeamService);
  public invitations: Invite[] = [];

  constructor() {
    this.userService.invites$
      .pipe(takeUntilDestroyed())
      .subscribe((invites) => this.inviteChanges(invites));
  }

  private inviteChanges(invites: Invite[]): void {
    this.invitations = invites;
  }

  async onAcceptInvite(invite: Invite): Promise<void> {
    try {
      await this.teamService.acceptInvite(invite);
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  }

  async onDeclineInvite(invite: Invite): Promise<void> {
    try {
      await this.teamService.declineInvite(invite);
    } catch (error) {
      console.error('Error declining invite:', error);
    }
  }
}
