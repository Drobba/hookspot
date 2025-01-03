import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'map',
        pathMatch: 'full'

    },

    {
        path: 'map',
        component: MapComponent
    },

    {
        path: 'leaderboard/:leaderboardId',
        component: LeaderboardComponent
    },

];
