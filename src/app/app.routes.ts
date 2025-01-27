import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LoginRegisterPageComponent } from './components/login-register-page/login-register-page.component';


export const routes: Routes = [
  {
      path: '',
      redirectTo: 'map',
      pathMatch: 'full'

  },

  {
    path: 'login',
    component: LoginRegisterPageComponent,
  },

  {
    path: 'map',
    component: MapComponent,
  },

  {
    path: 'leaderboard',
    component: LeaderboardComponent,
  },
  // {
  //   path: 'login',
  //   component: LoginComponent,
  // },

  // {
  //   path: 'register',
  //   component: RegisterComponent,
  // },
];
