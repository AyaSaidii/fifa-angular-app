import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Team } from '../../models/Team';
import { Player } from '../../models/Player';
import { DataService } from '../../Services/data-service';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  totalTeams: number = 0;
  totalPlayers: number = 0;
  avgPlayersPerTeam: number = 0;
  topTeam: Team | null = null;
  topPlayers: Player[] = [];
  teams: Team[] = [];

  private subscriptions: Subscription[] = [];

  recentMatches: any[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    // Subscribe to players
    this.subscriptions.push(
      this.dataService.players$.subscribe(players => {
        this.totalPlayers = players.length;
        this.topPlayers = [...players].sort((ax, bx) => (bx.rating || 0) - (ax.rating || 0)).slice(0, 6);
        this.updateAvgSquad();
      })
    );

    // Subscribe to teams
    this.subscriptions.push(
      this.dataService.teams$.subscribe(teams => {
        this.teams = teams;
        this.totalTeams = teams.length;
        this.updateAvgSquad();

        if (teams.length > 0) {
          this.topTeam = teams[Math.floor(Math.random() * teams.length)];
        }
      })
    );

    // Subscribe to matches
    this.subscriptions.push(
      this.dataService.matches$.subscribe(matches => {
        this.recentMatches = matches.slice(0, 5).map(m => ({
          home: m.homeTeamName,
          away: m.awayTeamName,
          score: `${m.homeScore} - ${m.awayScore}`,
          date: m.date
        }));
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private updateAvgSquad(): void {
    this.avgPlayersPerTeam = this.totalTeams > 0 ? Math.round(this.totalPlayers / this.totalTeams) : 0;
  }

  getTeamName(teamId: number): string {
    return this.dataService.getTeamName(teamId);
  }
}
