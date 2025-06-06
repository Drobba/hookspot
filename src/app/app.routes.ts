import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LoginRegisterPageComponent } from './components/login-register-page/login-register-page.component';
import { AddCatchComponent } from './components/add-catch/add-catch.component';
import { UserComponent } from './components/user/user.component';
import { authGuard } from './guards/auth.guard';
import { UserSettingsComponent } from './components/user/user-settings/user-settings.component';
import { TeamComponent } from './components/user/team-list/team/team.component';
import { NotificationsComponent } from './components/user/notifications/notifications.component';
import { TeamListComponent } from './components/user/team-list/team-list.component';
import { MyCatchesComponent } from './components/user/my-catches/my-catches.component';


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
    canActivate: [authGuard]
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [authGuard],
    children: [
      {path: 'profile', component: UserSettingsComponent},
      {
        path: 'teams',
        children: [
          {path: '', component: TeamListComponent},
          {path: ':teamId', component: TeamComponent}
        ]
      },
      {path: 'notifications', component: NotificationsComponent},
      {path: 'my-catches', component: MyCatchesComponent},
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
