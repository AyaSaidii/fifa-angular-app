import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Player } from '../models/Player';
import { Team } from '../models/Team';
import { Match } from '../models/Match';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private playersSubject = new BehaviorSubject<Player[]>([]);
    private teamsSubject = new BehaviorSubject<Team[]>([]);
    private matchesSubject = new BehaviorSubject<Match[]>([]);

    players$ = this.playersSubject.asObservable();
    teams$ = this.teamsSubject.asObservable();
    matches$ = this.matchesSubject.asObservable();

    private dataLoaded = false;

    constructor(private http: HttpClient) {
        this.loadData();
    }

    loadData(): void {
        if (this.dataLoaded) return;

        const storedPlayers = localStorage.getItem('players');
        const storedTeams = localStorage.getItem('teams');
        const storedMatches = localStorage.getItem('matches');

        if (storedPlayers && storedTeams) {
            const players = JSON.parse(storedPlayers);
            const teams = JSON.parse(storedTeams);
            let matches = storedMatches ? JSON.parse(storedMatches) : [];

            if (matches.length === 0) {
                // Initialize with some sample data so the page isn't empty
                const initialMatches: Match[] = [
                    {
                        id: 1, homeTeamId: 1, awayTeamId: 2, homeTeamName: 'Real Madrid', awayTeamName: 'FC Barcelona',
                        homeScore: 2, awayScore: 1, date: '2023-10-28', status: 'FT',
                        homeScorers: ['Bellingham 68\'', 'Bellingham 92\''], awayScorers: ['Gundogan 6\''],
                        stats: { possession: [45, 55], shots: [12, 14], shotsOnTarget: [5, 4], corners: [6, 3], fouls: [10, 12] }
                    },
                    {
                        id: 2, homeTeamId: 3, awayTeamId: 4, homeTeamName: 'Man City', awayTeamName: 'PSG',
                        homeScore: 3, awayScore: 1, date: '2023-11-25', status: 'FT',
                        homeScorers: ['Haaland 27\'', 'Haaland 44\'', 'Foden 88\''], awayScorers: ['Mbappé 12\''],
                        stats: { possession: [60, 40], shots: [18, 9], shotsOnTarget: [9, 3], corners: [8, 2], fouls: [7, 9] }
                    }
                ];
                matches = initialMatches;
                localStorage.setItem('matches', JSON.stringify(matches));
            }

            this.playersSubject.next(players);
            this.teamsSubject.next(teams);
            this.matchesSubject.next(matches);

            this.dataLoaded = true;
            console.log('Data loaded from localStorage');
        } else {
            this.syncWithJson();
        }
    }

    syncWithJson(): void {
        forkJoin({
            players: this.http.get<Player[]>('assets/data/players.json').pipe(
                catchError(err => {
                    console.error('Error loading players:', err);
                    return of([]);
                })
            ),
            teams: this.http.get<Team[]>('assets/data/teams.json').pipe(
                catchError(err => {
                    console.error('Error loading teams:', err);
                    return of([]);
                })
            )
        }).subscribe(({ players, teams }) => {
            console.log('Data synced from JSON files');
            this.playersSubject.next(players);
            this.teamsSubject.next(teams);

            // Clear matches to force a refresh of sample data if history was empty or stale
            localStorage.removeItem('matches');
            this.matchesSubject.next([]);

            this.saveToStorage();
            this.dataLoaded = true;

            // Re-run loadData logic for matches specifically
            const matches: Match[] = [
                {
                    id: 1, homeTeamId: 1, awayTeamId: 2, homeTeamName: 'Real Madrid', awayTeamName: 'FC Barcelona',
                    homeScore: 2, awayScore: 1, date: '2023-10-28', status: 'FT',
                    homeScorers: ['Bellingham 68\'', 'Bellingham 92\''], awayScorers: ['Gundogan 6\''],
                    stats: { possession: [45, 55], shots: [12, 14], shotsOnTarget: [5, 4], corners: [6, 3], fouls: [10, 12] }
                },
                {
                    id: 2, homeTeamId: 3, awayTeamId: 4, homeTeamName: 'Man City', awayTeamName: 'PSG',
                    homeScore: 3, awayScore: 1, date: '2023-11-25', status: 'FT',
                    homeScorers: ['Haaland 27\'', 'Haaland 44\'', 'Foden 88\''], awayScorers: ['Mbappé 12\''],
                    stats: { possession: [60, 40], shots: [18, 9], shotsOnTarget: [9, 3], corners: [8, 2], fouls: [7, 9] }
                }
            ];
            this.matchesSubject.next(matches);
            localStorage.setItem('matches', JSON.stringify(matches));

            location.reload(); // Refresh to ensure everything is consistent
        });
    }

    private saveToStorage(): void {
        localStorage.setItem('players', JSON.stringify(this.playersSubject.value));
        localStorage.setItem('teams', JSON.stringify(this.teamsSubject.value));
        localStorage.setItem('matches', JSON.stringify(this.matchesSubject.value));
    }

    getPlayers(): Player[] {
        return this.playersSubject.value;
    }

    getTeams(): Team[] {
        return this.teamsSubject.value;
    }

    addPlayer(player: Omit<Player, 'id'>): Player {
        const players = this.playersSubject.value;
        const newPlayer: Player = {
            ...player,
            id: players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1
        };
        this.playersSubject.next([...players, newPlayer]);
        this.saveToStorage();
        return newPlayer;
    }

    deletePlayer(id: number): void {
        const players = this.playersSubject.value.filter(p => p.id !== id);
        this.playersSubject.next(players);
        this.saveToStorage();
    }

    updatePlayer(updatedPlayer: Player): void {
        const players = this.playersSubject.value.map(p =>
            p.id === updatedPlayer.id ? updatedPlayer : p
        );
        this.playersSubject.next(players);
        this.saveToStorage();
    }

    updatePlayersBatch(updatedPlayers: Player[]): void {
        const playerIds = new Set(updatedPlayers.map(p => p.id));
        const players = this.playersSubject.value.map(p => {
            const updated = updatedPlayers.find(up => up.id === p.id);
            return updated || p;
        });
        this.playersSubject.next(players);
        this.saveToStorage();
    }

    addTeam(team: Omit<Team, 'id'>): Team {
        const teams = this.teamsSubject.value;
        const newTeam: Team = {
            ...team,
            id: teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1
        };
        this.teamsSubject.next([...teams, newTeam]);
        this.saveToStorage();
        return newTeam;
    }

    updateTeam(updatedTeam: Team): void {
        const teams = this.teamsSubject.value.map(t =>
            t.id === updatedTeam.id ? updatedTeam : t
        );
        this.teamsSubject.next(teams);
        this.saveToStorage();
    }

    deleteTeam(id: number): void {
        const teams = this.teamsSubject.value.filter(t => t.id !== id);
        this.teamsSubject.next(teams);
        this.saveToStorage();
    }

    getTeamName(teamId: number): string {
        const team = this.teamsSubject.value.find(t => t.id === teamId);
        return team ? team.name : 'Free Agent';
    }

    getTeamLogo(teamId: number): string {
        const team = this.teamsSubject.value.find(t => t.id === teamId);
        return team?.logo || 'assets/default-logo.png';
    }

    addMatch(match: Omit<Match, 'id'>): Match {
        const matches = this.matchesSubject.value;
        const newMatch: Match = {
            ...match,
            id: matches.length > 0 ? Math.max(...matches.map(m => m.id)) + 1 : 1
        };
        this.matchesSubject.next([newMatch, ...matches]);
        this.saveToStorage();
        return newMatch;
    }

    deleteMatch(id: number): void {
        const matches = this.matchesSubject.value.filter(m => m.id !== id);
        this.matchesSubject.next(matches);
        this.saveToStorage();
    }

    // Reset to original data from JSON
    resetData(): void {
        localStorage.removeItem('players');
        localStorage.removeItem('teams');
        localStorage.removeItem('matches');
        this.dataLoaded = false;
        this.loadData();
    }
}
