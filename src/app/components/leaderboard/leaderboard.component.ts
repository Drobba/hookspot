import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFish, faTrophy, faRuler, faWeightScale, faCalendarDay, faCrown, faMedal, faAward, faFilter } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { CatchService } from '../../services/catch.service';
import { Catch } from '../../models/catch';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team';
import { expandCollapseAnimation } from '../../animations/expand-collapse.animation';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { FishType } from '../../enums/fish-type';

interface UserStat {
  userName: string;
  value: string;
  count?: number;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FontAwesomeModule,
    FormsModule
  ],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
  animations: [expandCollapseAnimation]
})
export class LeaderboardComponent implements OnInit {
  private static readonly DESKTOP_BREAKPOINT = 768;
  
  displayedColumns: string[] = ['rank', 'userName', 'fishWeight', 'fishLength', 'fishType', 'bait', 'date'];
  
  // Icons
  fishIcon = faFish;
  trophyIcon = faTrophy;
  rulerIcon = faRuler;
  scaleIcon = faWeightScale;
  calendarIcon = faCalendarDay;
  crownIcon = faCrown;
  medalIcon = faMedal;
  awardIcon = faAward;
  filterIcon = faFilter;

  // Filters
  selectedSpecies: FishType | '' = '';
  selectedYear: number = new Date().getFullYear();
  selectedTeam: string | '' = '';

  // Filter options
  species: FishType[] = Object.values(FishType);
  years: number[] = [];
  teams: Team[] = [];
  
  // Performance optimization for team filtering
  private teamMemberIds = new Set<string>();

  // User Stats
  mostCatches: UserStat = {
    userName: '',
    value: '0 catches',
    count: 0
  };

  heaviestAvg: UserStat = {
    userName: '',
    value: '0 kg avg'
  };

  longestAvg: UserStat = {
    userName: '',
    value: '0 cm avg'
  };
  
  dataSource: Catch[] = [];
  private catchService = inject(CatchService);
  private teamService = inject(TeamService);
  private userService = inject(UserService);
  users: User[] = [];

  showFilters = false;

  constructor() {
    // Subscribe to catches
    this.catchService.catches$
      .pipe(takeUntilDestroyed())
      .subscribe(catches => {
        this.dataSource = catches;
        this.updateStats();
        this.updateYears();
      });

    // Subscribe to teams
    this.teamService.teams$
      .pipe(takeUntilDestroyed())
      .subscribe(teams => {
        this.teams = teams;
        this.updateTeamMemberIds();
      });

    // Subscribe to users
    this.userService.users$
      .pipe(takeUntilDestroyed())
      .subscribe(users => {
        this.users = users;
      });
  }

  // Watch for filter changes and update stats
  ngOnInit(): void {
    // Initial stats update
    this.updateStats();
  }

  // Update stats whenever a filter changes
  onFilterChange() {
    this.updateStats();
  }

  private updateStats(): void {
    try {
      const filteredCatches = this.filteredData;
      if (filteredCatches.length === 0) {
        this.resetStats();
        return;
      }

      const userCatches = this.groupCatchesByUser(filteredCatches);
      this.updateMostCatches(userCatches);
      this.updateHeaviestAverage(userCatches);
      this.updateLongestAverage(userCatches);
    } catch (error) {
      console.error('Error updating stats:', error);
      this.resetStats();
    }
  }

  private groupCatchesByUser(catches: Catch[]): Record<string, Catch[]> {
    const userCatches: Record<string, Catch[]> = {};
    
    return catches.reduce((acc, curr) => {
      if (!acc[curr.user.userName]) {
        acc[curr.user.userName] = [];
      }
      acc[curr.user.userName].push(curr);
      return acc;
    }, userCatches);
  }

  private updateMostCatches(userCatches: Record<string, Catch[]>): void {
    let maxCatches = 0;
    let mostActiveName = '';
    Object.entries(userCatches).forEach(([userName, catches]) => {
      if (catches.length > maxCatches) {
        maxCatches = catches.length;
        mostActiveName = userName;
      }
    });
    this.mostCatches = {
      userName: mostActiveName,
      value: `${maxCatches} catches`,
      count: maxCatches
    };
  }

  private updateHeaviestAverage(userCatches: Record<string, Catch[]>): void {
    let maxWeightAvg = 0;
    let heaviestName = '';
    Object.entries(userCatches).forEach(([userName, catches]) => {
      const avg = catches.reduce((sum, c) => sum + c.fishWeight, 0) / catches.length;
      if (avg > maxWeightAvg) {
        maxWeightAvg = avg;
        heaviestName = userName;
      }
    });
    this.heaviestAvg = {
      userName: heaviestName,
      value: `${maxWeightAvg.toFixed(1)} kg avg`
    };
  }

  private updateLongestAverage(userCatches: Record<string, Catch[]>): void {
    let maxLengthAvg = 0;
    let longestName = '';
    Object.entries(userCatches).forEach(([userName, catches]) => {
      const avg = catches.reduce((sum, c) => sum + c.fishLength, 0) / catches.length;
      if (avg > maxLengthAvg) {
        maxLengthAvg = avg;
        longestName = userName;
      }
    });
    this.longestAvg = {
      userName: longestName,
      value: `${maxLengthAvg.toFixed(0)} cm avg`
    };
  }

  private updateTeamMemberIds(): void {
    this.teamMemberIds.clear();
    this.teams.forEach(team => {
      team.members?.forEach(member => {
        this.teamMemberIds.add(member.userId);
      });
    });
  }

  private resetStats() {
    this.mostCatches = {
      userName: '',
      value: '0 catches',
      count: 0
    };
    this.heaviestAvg = {
      userName: '',
      value: '0 kg avg'
    };
    this.longestAvg = {
      userName: '',
      value: '0 cm avg'
    };
  }

  private updateYears() {
    const years = new Set<number>();
    this.dataSource.forEach(catch_ => {
      years.add(new Date(catch_.date).getFullYear());
    });
    this.years = Array.from(years).sort((a, b) => b - a);
  }

  // Filter function
  get filteredData(): Catch[] {
    return this.dataSource
      .filter(record => {
        const speciesMatch = !this.selectedSpecies || record.fishType === this.selectedSpecies;
        const yearMatch = !this.selectedYear || new Date(record.date).getFullYear() === this.selectedYear;
        // Team filter
        const teamMatch = !this.selectedTeam || 
          this.teamMemberIds.has(record.user.userId);
        return speciesMatch && yearMatch && teamMatch;
      })
      .sort((a, b) => {
        if (b.fishWeight !== a.fishWeight) {
          return b.fishWeight - a.fishWeight; // Heaviest weight first
        }
        return b.fishLength - a.fishLength; // If same weight, longest length first
      });
  }

  get isDesktop(): boolean {
    return window.innerWidth >= LeaderboardComponent.DESKTOP_BREAKPOINT;
  }

  getAvatarUrl(userId: string): string {
    const user = this.users.find(u => u.userId === userId);
    return user?.avatarUrl || 'assets/app-images/default-user.svg';
  }

  getAvatarUrlByUserName(userName: string): string {
    const user = this.users.find(u => u.userName === userName);
    return user?.avatarUrl || 'assets/app-images/default-user.svg';
  }
}
