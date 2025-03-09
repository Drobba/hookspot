import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LoginRegisterPageComponent } from './components/login-register-page/login-register-page.component';
import { AddCatchComponent } from './components/add-catch/add-catch.component';
import { UserComponent } from './components/user/user.component';
import { authGuard } from './guards/auth.guard';
import { UserSettingsComponent } from './components/user/user-settings/user-settings.component';
import { TeamsComponent } from './components/user/teams/teams.component';
import { NotificationsComponent } from './components/user/notifications/notifications.component';


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
  {
    path: 'user',
    component: UserComponent,
    children: [
      {path: 'profile', component: UserSettingsComponent},
      {path: 'teams', component: TeamsComponent},
      {path: 'notifications', component: NotificationsComponent},
    ]
  }
  // {
  //   path: 'login',
  //   component: LoginComponent,
  // },

  // {
  //   path: 'register',
  //   component: RegisterComponent,
  // },
];
