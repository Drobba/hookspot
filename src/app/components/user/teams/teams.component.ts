import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CreateTeamModalComponent } from './create-team-modal/create-team-modal.component';
import { lastValueFrom } from 'rxjs';

export interface Member {
  name: string;
  role: 'Admin' | 'Member';
  joinDate: string;
}

export interface Team {
  id: number;
  name: string;
  data: Member[];
}

const TEAM_ONE_DATA: Member[] = [
  { name: 'Andreas Nelefelt', role: 'Admin', joinDate: '2023-05-22' },
  { name: 'Felix Fassl', role: 'Member', joinDate: '2024-01-15' },
  { name: 'Magnus Strömbäck', role: 'Member', joinDate: '2023-07-19' },
  { name: 'Stefan Nelefelt', role: 'Member', joinDate: '2024-02-05' },
  { name: 'Joakim Fernandez', role: 'Member', joinDate: '2022-11-03' },
  { name: 'Joakim Berg', role: 'Member', joinDate: '2024-01-15' },
  { name: 'Niklas Åsberg', role: 'Member', joinDate: '2023-07-19' },
  { name: 'Victor Olofsson', role: 'Member', joinDate: '2024-02-05' },
  { name: 'Anthon Hellman', role: 'Member', joinDate: '2022-11-03' },
  { name: 'Victor Olofsson', role: 'Member', joinDate: '2024-01-15' },
  { name: 'Arvid Nelefelt', role: 'Member', joinDate: '2023-07-19' },
  { name: 'Tim Gartz', role: 'Member', joinDate: '2024-02-05' },
  { name: 'Jacob Johansson', role: 'Member', joinDate: '2022-11-03' },
];

const TEAM_TWO_DATA: Member[] = [
  { name: 'John Smith', role: 'Admin', joinDate: '2023-06-15' },
  { name: 'Emma Wilson', role: 'Member', joinDate: '2023-12-01' },
  { name: 'Michael Brown', role: 'Member', joinDate: '2024-01-30' },
  { name: 'Sarah Johnson', role: 'Member', joinDate: '2023-09-22' },
];

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSelectModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
})
export class TeamsComponent {
  private dialog = inject(MatDialog);
  displayedColumns: string[] = ['name', 'role', 'joinDate'];

  teams: Team[] = [
    { id: 1, name: 'Team Gädda', data: TEAM_ONE_DATA },
    { id: 2, name: 'Team Abborre', data: TEAM_TWO_DATA }
  ];

  selectedTeamId: number = this.teams[0].id;
  dataSource: Member[] = TEAM_ONE_DATA;

  onTeamChange(teamId: number): void {
    const selectedTeam = this.teams.find(team => team.id === teamId);
    if (selectedTeam) {
      this.selectedTeamId = selectedTeam.id;
      this.dataSource = selectedTeam.data;
    }
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
    console.log(newTeamName);
  }
  

}
