import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  // {
  //     path: '',
  //     redirectTo: 'map',
  //     pathMatch: 'full'

  // },

  {
    path: 'map',
    component: MapComponent,
  },

  {
    path: 'leaderboard',
    component: LeaderboardComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'register',
    component: RegisterComponent,
  },
];
