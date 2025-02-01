import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LoginRegisterPageComponent } from './components/login-register-page/login-register-page.component';
import { AddCatchComponent } from './components/add-catch/add-catch.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  {
      path: '',
      redirectTo: 'map',
      pathMatch: 'full',

  },

  {
    path: 'login',
    component: LoginRegisterPageComponent,
  },

  {
    path: 'map',
    component: MapComponent,
    canActivate: [authGuard]
  },

  {
    path: 'leaderboard',
    component: LeaderboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'addCatch',
    component: AddCatchComponent,
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
