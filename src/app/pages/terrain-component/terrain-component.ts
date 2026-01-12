import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Player } from '../../models/Player';
import { Team } from '../../models/Team';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../Services/data-service';
import { MatchEvent, MatchService } from '../../Services/Match/match-service';

@Component({
  selector: 'app-terrain-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terrain-component.html',
  styleUrls: ['./terrain-component.css'],
})
export class TerrainComponent implements OnInit {
  allTeams: Team[] = [];
  allPlayers: Player[] = [];

  selectedHomeTeam: Team | null = null;
  selectedAwayTeam: Team | null = null;

  homePlayers: Player[] = [];
  awayPlayers: Player[] = [];

  // Match Sim State
  matchLogs: MatchEvent[] = [];
  homeScore = 0;
  awayScore = 0;
  matchTimer = 0;
  isMatchLive = false;

  // Selected Player for FIFA Card
  selectedPlayer: Player | null = null;
  showCard = false;

  // Search Players
  searchQuery: string = '';
  searchResults: Player[] = [];

  // Transfer Modal State
  showTransferModal = false;
  transferPlayer: Player | null = null;
  transferType: 'CONFIRM' | 'SUCCESS' | 'ERROR' = 'CONFIRM';
  transferMessage = '';

  // Default formation 4-3-3 coordinates (in percentages)
  formations: any = {
    '4-3-3': [
      { x: 50, y: 90 }, // GK
      { x: 20, y: 75 }, { x: 40, y: 80 }, { x: 60, y: 80 }, { x: 80, y: 75 }, // Def
      { x: 30, y: 55 }, { x: 50, y: 60 }, { x: 70, y: 55 }, // Mid
      { x: 20, y: 25 }, { x: 50, y: 20 }, { x: 80, y: 25 }  // Att
    ],
    '4-4-2': [
      { x: 50, y: 90 }, // GK
      { x: 20, y: 75 }, { x: 40, y: 80 }, { x: 60, y: 80 }, { x: 80, y: 75 }, // Def
      { x: 15, y: 50 }, { x: 40, y: 55 }, { x: 60, y: 55 }, { x: 85, y: 50 }, // Mid
      { x: 35, y: 25 }, { x: 65, y: 25 } // Att
    ],
    '3-5-2': [
      { x: 50, y: 90 }, // GK
      { x: 30, y: 80 }, { x: 50, y: 82 }, { x: 70, y: 80 }, // Def
      { x: 15, y: 60 }, { x: 35, y: 60 }, { x: 50, y: 55 }, { x: 65, y: 60 }, { x: 85, y: 60 }, // Mid
      { x: 35, y: 25 }, { x: 65, y: 25 } // Att
    ],
    '5-3-2': [
      { x: 50, y: 90 }, // GK
      { x: 15, y: 70 }, { x: 30, y: 75 }, { x: 50, y: 78 }, { x: 70, y: 75 }, { x: 85, y: 70 }, // Def
      { x: 35, y: 55 }, { x: 50, y: 50 }, { x: 65, y: 55 }, // Mid
      { x: 40, y: 25 }, { x: 60, y: 25 } // Att
    ],
    '4-2-3-1': [
      { x: 50, y: 90 }, // GK
      { x: 20, y: 75 }, { x: 40, y: 80 }, { x: 60, y: 80 }, { x: 80, y: 75 }, // Def
      { x: 40, y: 65 }, { x: 60, y: 65 }, // CDM
      { x: 20, y: 45 }, { x: 50, y: 45 }, { x: 80, y: 45 }, // AM
      { x: 50, y: 20 } // ST
    ]
  };

  selectedFormation: string = '4-3-3';

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private matchService: MatchService
  ) { }

  ngOnInit(): void {
    import('rxjs').then(({ combineLatest }) => {
      combineLatest([
        this.dataService.teams$,
        this.dataService.players$
      ]).subscribe(([teams, players]) => {
        this.allTeams = teams;
        this.allPlayers = players;
        this.updateHomePlayers();
        this.updateAwayPlayers();
        this.checkQueryParams();
      });
    });
  }

  private checkQueryParams(): void {
    if (this.allTeams.length === 0) return;

    this.route.queryParams.subscribe(params => {
      const preSelectedId = params['teamId'];
      if (preSelectedId) {
        this.selectHomeTeam(preSelectedId);
        const opponent = this.allTeams.find(t => t.id !== Number(preSelectedId));
        if (opponent) this.selectAwayTeam(opponent.id);
      } else if (!this.selectedHomeTeam && this.allTeams.length >= 1) {
        const realMadrid = this.allTeams.find(t => t.name.toLowerCase().includes('real madrid'));
        if (realMadrid) {
          this.selectHomeTeam(realMadrid.id);
          const opponent = this.allTeams.find(t => t.id !== realMadrid.id);
          if (opponent) this.selectAwayTeam(opponent.id);
        } else {
          this.selectHomeTeam(this.allTeams[0].id);
          if (this.allTeams.length >= 2) this.selectAwayTeam(this.allTeams[1].id);
        }
      }
    });
  }

  onSearchChange() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    const query = this.searchQuery.toLowerCase();
    this.searchResults = this.allPlayers
      .filter(p => p.name.toLowerCase().includes(query))
      .filter(p => !this.homePlayers.find(hp => hp.id === p.id)) // Not already in squad
      .slice(0, 5);
  }

  addToSquad(player: Player) {
    if (!this.selectedHomeTeam) return;

    const price = player.price || 0;
    const currentBudget = this.selectedHomeTeam.budget || 0;

    if (currentBudget < price) {
      this.transferPlayer = player;
      this.transferType = 'ERROR';
      this.transferMessage = `INSUFFICIENT FUNDS`;
      this.showTransferModal = true;
      return;
    }

    this.transferPlayer = player;
    this.transferType = 'CONFIRM';
    this.transferMessage = `TRANSFER CONFIRMATION`;
    this.showTransferModal = true;
  }

  confirmPurchase() {
    if (!this.transferPlayer || !this.selectedHomeTeam) return;

    const price = this.transferPlayer.price || 0;

    // Deduct from budget
    this.selectedHomeTeam.budget = (this.selectedHomeTeam.budget || 0) - price;
    this.dataService.updateTeam(this.selectedHomeTeam);

    // Transfer player to current team
    this.transferPlayer.teamId = this.selectedHomeTeam.id;
    this.transferPlayer.x = 0; // Bench position
    this.transferPlayer.y = 100;

    this.dataService.updatePlayer(this.transferPlayer);
    this.searchQuery = '';
    this.searchResults = [];

    // Update local list
    this.updateHomePlayers();

    // Show Success
    this.transferType = 'SUCCESS';
    this.transferMessage = 'TRANSFER COMPLETED';
    // Success Modal stays open until closed by user
  }

  closeTransferModal() {
    this.showTransferModal = false;
    setTimeout(() => {
      this.transferPlayer = null;
      this.transferMessage = '';
    }, 300);
  }

  moveToBench(player: Player) {
    player.x = 0;
    player.y = 100;
    this.dataService.updatePlayer(player);
    this.updateHomePlayers();
  }

  clearPitch() {
    if (!this.selectedHomeTeam) return;

    // Confirmation before clearing
    if (confirm("Reset layout and return all players to the bench?")) {
      this.homePlayers.forEach(p => {
        p.x = 0;
        p.y = 100;
        this.dataService.updatePlayer(p);
      });
      this.updateHomePlayers();
    }
  }

  removeFromSquad(player: Player) {
    if (confirm(`Are you sure you want to release ${player.name} from the squad?`)) {
      player.teamId = 0;
      player.x = 0;
      player.y = 0;
      this.dataService.updatePlayer(player);
      this.updateHomePlayers();
      if (this.selectedPlayer?.id === player.id) {
        this.closePlayerCard();
      }
    }
  }


  selectHomeTeam(teamId: any) {
    const id = Number(teamId);
    this.selectedHomeTeam = this.allTeams.find(t => t.id === id) || null;

    if (this.selectedHomeTeam) {
      // Move ALL players of this team to the bench (y=100) by default
      // This ensures the pitch starts empty as requested
      const teamPlayers = this.allPlayers.filter(p => p.teamId === id);
      const updatedPlayers = teamPlayers.map(p => ({ ...p, x: 0, y: 100 }));
      this.dataService.updatePlayersBatch(updatedPlayers);
    }
    this.updateHomePlayers();
    // Refresh slots
    this.formationSlots = this.formations[this.selectedFormation] || [];
  }

  selectAwayTeam(teamId: any) {
    const id = Number(teamId);
    this.selectedAwayTeam = this.allTeams.find(t => t.id === id) || null;
    this.updateAwayPlayers();
  }

  // Current formation slots to render "Ghost" markers
  formationSlots: any[] = [];

  updateHomePlayers() {
    if (!this.selectedHomeTeam) return;

    // Refresh selectedHomeTeam data from allTeams to get latest budget
    const updatedTeam = this.allTeams.find(t => t.id === this.selectedHomeTeam?.id);
    if (updatedTeam) this.selectedHomeTeam = updatedTeam;

    this.homePlayers = this.allPlayers.filter(p => p.teamId === this.selectedHomeTeam?.id);
    // Don't auto-apply formation here to prevent shifting when deleting/adding players
    this.formationSlots = this.formations[this.selectedFormation] || [];
  }

  updateAwayPlayers() {
    if (!this.selectedAwayTeam) return;
    this.awayPlayers = this.allPlayers.filter(p => p.teamId === this.selectedAwayTeam?.id);
  }

  setFormation(formationName: string) {
    this.selectedFormation = formationName;
    this.applyFormation(formationName);
  }

  applyFormation(fmtName: string) {
    const coords = this.formations[fmtName];
    if (!coords) return;
    this.formationSlots = coords;

    // Filter players who are on the field (y < 100)
    const onFieldPlayers = this.homePlayers.filter(p => p.y < 100);

    // Create a copy of slots to track which ones are taken
    let availableSlots = [...coords];

    // For each player on field, find and snap to the nearest AVAILABLE slot
    onFieldPlayers.forEach(p => {
      if (availableSlots.length === 0) return;

      let nearestSlotIndex = -1;
      let minDistance = 1000;

      availableSlots.forEach((slot, idx) => {
        const dx = slot.x - p.x;
        const dy = slot.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          nearestSlotIndex = idx;
        }
      });

      if (nearestSlotIndex !== -1) {
        const slot = availableSlots[nearestSlotIndex];
        p.x = slot.x;
        p.y = slot.y;
        this.dataService.updatePlayer(p);

        // Remove this slot so another player doesn't snap to it
        availableSlots.splice(nearestSlotIndex, 1);
      }
    });
  }

  // --- Match Simulation ---
  startMatch() {
    if (!this.selectedHomeTeam || !this.selectedAwayTeam) return;

    this.isMatchLive = true;
    this.homeScore = 0;
    this.awayScore = 0;
    this.matchLogs = [];

    const activeHomePlayers = this.homePlayers.filter(p => p.y < 100);
    const activeAwayPlayers = this.awayPlayers.filter(p => p.y < 100);

    this.matchService.simulateMatch(this.selectedHomeTeam, this.selectedAwayTeam, activeHomePlayers, activeAwayPlayers)
      .subscribe({
        next: (event) => {
          this.matchTimer = event.minute;
          this.matchLogs.unshift(event); // Add to top

          if (event.type === 'GOAL') {
            if (event.teamId === this.selectedHomeTeam?.id) this.homeScore++;
            if (event.teamId === this.selectedAwayTeam?.id) this.awayScore++;
          }
        },
        complete: () => {
          this.isMatchLive = false;
          if (this.selectedHomeTeam && this.selectedAwayTeam) {
            const homeId = this.selectedHomeTeam.id;
            const awayId = this.selectedAwayTeam.id;
            this.dataService.addMatch({
              homeTeamId: homeId,
              awayTeamId: awayId,
              homeTeamName: this.selectedHomeTeam.name,
              awayTeamName: this.selectedAwayTeam.name,
              homeScore: this.homeScore,
              awayScore: this.awayScore,
              date: new Date().toISOString().split('T')[0],
              status: 'FT',
              homeScorers: this.matchLogs.filter(l => l.type === 'GOAL' && l.teamId === homeId).map(l => {
                const name = l.description.split(' scored for ')[0].replace('GOAL! ', '');
                return `${name} ${l.minute}'`;
              }),
              awayScorers: this.matchLogs.filter(l => l.type === 'GOAL' && l.teamId === awayId).map(l => {
                const name = l.description.split(' scored for ')[0].replace('GOAL! ', '');
                return `${name} ${l.minute}'`;
              }),
              stats: {
                possession: [50, 50],
                shots: [this.matchLogs.filter(l => l.teamId === homeId).length, this.matchLogs.filter(l => l.teamId === awayId).length],
                shotsOnTarget: [this.homeScore + 2, this.awayScore + 2],
                corners: [4, 4],
                fouls: [2, 2]
              }
            });
            alert('Match Finished! Result saved to Match Center.');
          }
        }
      });
  }


  // --- Drag and Drop Logic ---

  draggedPlayer: Player | null = null;

  onDragStart(event: DragEvent, player: Player) {
    this.draggedPlayer = player;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify(player));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Necessary to allow dropping
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (this.draggedPlayer && this.selectedHomeTeam) {
      const fieldElement = event.currentTarget as HTMLElement;
      const rect = fieldElement.getBoundingClientRect();
      const dropX = ((event.clientX - rect.left) / rect.width) * 100;
      const dropY = ((event.clientY - rect.top) / rect.height) * 100;

      // Find nearest slot logic
      let nearestSlot: any = null;
      let minDistance = 1000;

      this.formationSlots.forEach(slot => {
        const dx = slot.x - dropX;
        const dy = slot.y - dropY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 15) { // Snap radius
          minDistance = distance;
          nearestSlot = slot;
        }
      });

      if (nearestSlot) {
        this.draggedPlayer.x = nearestSlot.x;
        this.draggedPlayer.y = nearestSlot.y;
      } else {
        this.draggedPlayer.x = dropX;
        this.draggedPlayer.y = dropY;
      }

      this.dataService.updatePlayer(this.draggedPlayer);
      this.draggedPlayer = null;
    }
  }

  // --- Player Card Methods ---
  showPlayerCard(player: Player) {
    this.selectedPlayer = player;
    this.showCard = true;
  }

  closePlayerCard() {
    this.showCard = false;
    setTimeout(() => this.selectedPlayer = null, 300); // Wait for animation
  }

  resetData() {
    if (confirm('This will reset all your team changes and player positions to default. Continue?')) {
      this.dataService.resetData();
    }
  }
}
