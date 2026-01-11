import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { DashboardComponent } from './app/pages/dashboard-component/dashboard-component';
import { TeamComponent } from './app/pages/team-component/team-component';
import { PlayersComponent } from './app/pages/players-component/players-component';
import { MatchesComponent } from './app/pages/matches-component/matches-component';
import { TerrainComponent } from './app/pages/terrain-component/terrain-component';
import { routes } from './app/app.routes'; 
import { provideHttpClient } from '@angular/common/http';

const appRoutes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'team', component: TeamComponent },
  { path: 'players', component: PlayersComponent },
  { path: 'matches', component: MatchesComponent },
  { path: 'terrain', component: TerrainComponent }
];
bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideRouter(routes) 
  ]
})
.catch(err => console.error(err));