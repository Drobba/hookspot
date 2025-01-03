import { Component, input } from '@angular/core';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {

  leaderboardId = input.required<string>();
  limit = input.required<string>();

}
