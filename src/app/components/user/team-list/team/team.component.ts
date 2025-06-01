import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TeamSerivce } from '../../../../services/team.service';
import { Team } from '../../../../models/team';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Member } from '../../../../models/member';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../models/user';
import { TeamRole } from '../../../../enums/team-role';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import { CatchService } from '../../../../services/catch.service';
import { Catch } from '../../../../models/catch';
import { ImageGalleryComponent } from '../../../common/image-gallery/image-gallery.component';
import { getFishImagePath } from '../../../../utils/fish-image.util';
import { FishType } from '../../../../models/fish-type';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule, 
    MatAutocompleteModule, 
    ReactiveFormsModule, 
    MatTableModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    FontAwesomeModule,
    RouterLink,
    ImageGalleryComponent
  ],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent {
  teamId = input.required<string>();
  public backIcon = faArrowLeftLong;

  private dialog = inject(MatDialog);
  private teamService = inject(TeamSerivce);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private catchService = inject(CatchService);
  
  currentTeam?: Team;
  users: User[] = [];
  userSearchControl = new FormControl<User | null>(null);
  filteredOptions: Observable<User[]>;
  dataSource: Member[] = [];
  displayedColumns: string[] = ['name', 'role', 'joinDate'];
  teamCatches: Catch[] = [];
  visibleCatchRows = 3;

  TeamRole = TeamRole; // Make enum available in template

  constructor() {
    this.userService.users$
      .pipe(takeUntilDestroyed())
      .subscribe(users => {
        this.users = users;
      });
      
    this.route.params.pipe(
      map(params => params['teamId']),
      switchMap(teamId =>
        this.teamService.teams$.pipe(
          map(teams => teams.find(t => t.teamId === teamId))
        )
      ),
      takeUntilDestroyed()
    ).subscribe(team => {
      if (team) {
        this.currentTeam = team;
        this.dataSource = team.members || [];
        this.updateTeamCatches();
      }
    });

    this.filteredOptions = this.userSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const searchValue = typeof value === 'string'
          ? value
          : value?.userName ?? '';

        return searchValue.length >= 2
          ? this._filter(searchValue)
          : [];
      })
    );

    // Prenumerera på alla catches och filtrera ut teamets fångster
    this.catchService.catches$
      .pipe(takeUntilDestroyed())
      .subscribe(catches => {
        this.updateTeamCatches(catches);
      });
  }

  private _filter(value: string): User[] {
    const filterValue = value.toLowerCase();
    return this.users.filter(user =>
      user.userName?.toLowerCase().includes(filterValue) ||
      user.email?.toLowerCase().includes(filterValue)
    );
  }

  async sendInvite() {
    const selectedUser = this.userSearchControl.value;

    if (!selectedUser || !this.currentTeam) {
      console.warn('User or team not selected.');
      return;
    }

    try {
      await this.teamService.sendInvite(selectedUser, this.currentTeam);
      this.userSearchControl.reset();
    } catch (error) {
      console.error('Could not send invite', error);
    }
  }

  displayUserFn(user: User | null): string {
    return user?.userName || '';
  }

  updateTeamCatches(catches?: Catch[]) {
    if (!this.currentTeam || !this.currentTeam.members) {
      this.teamCatches = [];
      return;
    }
    const memberIds = this.currentTeam.members.map(m => m.userId);
    const allCatches = catches ?? [];
    this.teamCatches = allCatches
      .filter(c => memberIds.includes(c.user.userId) && !!c.imageUrl)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getFishImagePath(fishType: FishType) {
    return getFishImagePath(fishType);
  }

  getCatchImageSource(catchItem: Catch): string {
    return catchItem.imageUrl || getFishImagePath(catchItem.fishType);
  }

  get visibleCatchesCount() {
    return this.visibleCatchRows * 2; // 2 bilder per rad
  }

  get visibleTeamCatches() {
    return this.teamCatches.slice(0, this.visibleCatchesCount);
  }

  showMoreCatches() {
    this.visibleCatchRows += 3;
  }
}
