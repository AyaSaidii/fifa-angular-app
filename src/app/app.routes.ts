import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard-component/dashboard-component';
import { TeamComponent } from './pages/team-component/team-component';
import { PlayersComponent } from './pages/players-component/players-component';
import { MatchesComponent } from './pages/matches-component/matches-component';
import { TerrainComponent } from './pages/terrain-component/terrain-component';

export const routes: Routes = [ 
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'teams', component: TeamComponent },
  { path: 'players', component: PlayersComponent },
  { path: 'matches', component: MatchesComponent },
  { path: 'terrain', component: TerrainComponent }
];
