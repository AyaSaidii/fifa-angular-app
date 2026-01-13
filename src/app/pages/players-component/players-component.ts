import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Player } from '../../models/Player';
import { Team } from '../../models/Team';
import { DataService } from '../../Services/data-service';

@Component({
  selector: 'app-players-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './players-component.html',
  styleUrls: ['./players-component.css'],
})
export class PlayersComponent implements OnInit, OnDestroy {
  players: Player[] = [];
  teams: Team[] = [];
  loading = true;
  showAddForm = false;

  // New player form
  newPlayer = {
    name: '',
    position: 'ST',
    teamId: 1,
    image: ''
  };

  positions = ['GK', 'RB', 'CB', 'LB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

  private subscriptions: Subscription[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataService.players$.subscribe(players => {
        this.players = players;
        this.loading = false;
      })
    );

    this.subscriptions.push(
      this.dataService.teams$.subscribe(teams => {
        this.teams = teams;
        if (teams.length > 0 && !this.newPlayer.teamId) {
          this.newPlayer.teamId = teams[0].id;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getTeamName(teamId: number): string {
    return this.dataService.getTeamName(teamId);
  }

  getTeamLogo(teamId: number): string {
    return this.dataService.getTeamLogo(teamId);
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addPlayer(): void {
    if (!this.newPlayer.name.trim()) return;

    // Generate avatar if no image provided
    const image = this.newPlayer.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(this.newPlayer.name)}&background=random`;

    this.dataService.addPlayer({
      name: this.newPlayer.name,
      position: this.newPlayer.position,
      teamId: this.newPlayer.teamId,
      image: image,
      x: 50,
      y: 50
    });

    this.resetForm();
    this.showAddForm = false;
  }

  deletePlayer(id: number): void {
    if (confirm('Are you sure you want to delete this player?')) {
      this.dataService.deletePlayer(id);
    }
  }

  private resetForm(): void {
    this.newPlayer = {
      name: '',
      position: 'ST',
      teamId: this.teams.length > 0 ? this.teams[0].id : 1,
      image: ''
    };
  }
}
