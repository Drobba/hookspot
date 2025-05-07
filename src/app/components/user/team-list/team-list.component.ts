import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeftLong, faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TeamSerivce } from '../../../services/team.service';
import { Team } from '../../../models/team';
import { MatDialog } from '@angular/material/dialog';
import { CreateTeamModalComponent } from '../../create-team-modal/create-team-modal.component';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    FontAwesomeModule, 
    RouterLink
  ],
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent {
    public backIcon = faArrowLeftLong;
    public teamsIcon = faPeopleGroup;
    private dialog = inject(MatDialog);
    private teamService = inject(TeamSerivce);
    public teams: Team[] = [];
  
    constructor() {
        this.teamService.teams$
          .pipe(takeUntilDestroyed())
          .subscribe((teams) => {
            this.teams = teams;
          });
    }

    get memberCount() {
      return (team: Team) => {
        const count = team.members?.length || 0;
        return count === 1 ? '1 member' : `${count} members`;
      };
    }

    async openCreateTeamDialog(): Promise<string | undefined> {
      return lastValueFrom(
        this.dialog.open<CreateTeamModalComponent, string>(CreateTeamModalComponent, {
          width: '400px',
          height: 'auto',
          panelClass: 'custom-dialog-container'
        }).afterClosed()
      );
    }
    
    async createTeam() {
      const newTeamName = await this.openCreateTeamDialog();
      if (!newTeamName) return;
  
      try {
        await this.teamService.createTeam(newTeamName);
      } catch (error) {
        console.error(error);
      }
    }
} 