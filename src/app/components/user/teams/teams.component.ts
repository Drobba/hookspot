import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CreateTeamModalComponent } from './create-team-modal/create-team-modal.component';
import { lastValueFrom } from 'rxjs';
import { TeamSerivce } from '../../../services/team.service';
import { Team } from '../../../models/team';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Member } from '../../../models/member';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, MatAutocompleteModule, ReactiveFormsModule,  MatTableModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
})
export class TeamsComponent {
  private dialog = inject(MatDialog);
  private teamService = inject(TeamSerivce);
  private userService = inject(UserService);
  teams: Team[] = [];
  users: User[] = [];
  userSearchControl = new FormControl('');
  filteredOptions: Observable<User[]>;



  constructor() {

    this.userService.users$.pipe(takeUntilDestroyed()).subscribe(users => {
      this.users = users;
    });
    
    this.teamService.teams$
      .pipe(takeUntilDestroyed())
      .subscribe((teams) => {
        this.teams = teams;
        console.log('Teams!', this.teams);
  
        if (teams.length > 0) {
          this.selectedTeamId = teams[0].teamId;
          this.dataSource = teams[0].members || [];
        }
      });

      this.filteredOptions = this.userSearchControl.valueChanges.pipe(
        startWith(''),
        map(value => (value && value.length >= 2)
          ? this._filter(value)
          : [])
      );
      
  }

  private _filter(value: string): User[] {
    const filterValue = value.toLowerCase();
  
    return this.users.filter(user =>
      user.userName?.toLowerCase().includes(filterValue) ||
      user.email?.toLowerCase().includes(filterValue)
    );
  }
  
  
  


  displayedColumns: string[] = ['name', 'role', 'joinDate'];


  selectedTeamId?: string;
  
  dataSource: Member[] = [];

  onTeamChange(teamId: string): void {
    const selectedTeam = this.teams.find(team => team.teamId === teamId);
  
    if (selectedTeam) {
      this.selectedTeamId = selectedTeam.teamId;
      this.dataSource = selectedTeam.members || [];
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

    try {
      await this.teamService.createTeam(newTeamName);
    } catch (error) {
      console.error(error);
    }
  }
  

}
