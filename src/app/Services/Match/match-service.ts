import { Injectable } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { takeWhile, map } from 'rxjs/operators';
import { Team } from '../../models/Team';
import { Player } from '../../models/Player';


export interface MatchEvent {
    minute: number;
    type: 'GOAL' | 'CHANCE' | 'CARD' | 'WHISTLE';
    description: string;
    teamId?: number;
    playerId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class MatchService {

    private MIN_INTERVAL = 500; // 0.5s per game minute

    constructor() { }

    simulateMatch(home: Team, away: Team, homePlayers: Player[] = [], awayPlayers: Player[] = []): Observable<MatchEvent> {
        const events$ = new Subject<MatchEvent>();
        let minute = 0;

        // Calculate bias for chances
        const homePower = ((home.att || 80) + (home.mid || 80) * 1.2) / 2;
        const awayPower = ((away.att || 80) + (away.mid || 80) * 1.2) / 2;
        const homeChanceProb = homePower / (homePower + awayPower);

        interval(this.MIN_INTERVAL).pipe(
            takeWhile(() => minute <= 90)
        ).subscribe({
            next: () => {
                minute++;

                let eventType: 'GOAL' | 'CHANCE' | 'CARD' | 'WHISTLE' | null = null;
                let description = '';
                let teamId = 0;
                let playerId = 0;

                if (minute === 1) {
                    eventType = 'WHISTLE';
                    description = 'Match Started!';
                } else if (minute === 45) {
                    eventType = 'WHISTLE';
                    description = 'Half Time!';
                } else if (minute === 46) {
                    eventType = 'WHISTLE';
                    description = 'Second Half Begins!';
                } else if (minute === 90) {
                    eventType = 'WHISTLE';
                    description = 'Full Time!';
                } else {
                    const rand = Math.random();
                    if (rand < 0.08) { // 8% chance of an event per minute
                        const attackingTeam = Math.random() < homeChanceProb ? home : away;
                        const defendingTeam = attackingTeam === home ? away : home;
                        const currentTeamPlayers = attackingTeam === home ? homePlayers : awayPlayers;
                        const currentDefendingPlayers = defendingTeam === home ? homePlayers : awayPlayers;

                        // Goal probability based on Att vs Def
                        const goalRand = Math.random();
                        const goalThreshold = ((attackingTeam.att || 80) / ((attackingTeam.att || 80) + (defendingTeam.def || 80))) * 0.3;

                        if (goalRand < goalThreshold) {
                            eventType = 'GOAL';
                            teamId = attackingTeam.id;

                            // Pick a scorer from attacking players (prefer strikers/mids)
                            if (currentTeamPlayers.length > 0) {
                                const scorers = currentTeamPlayers.length > 3 ? currentTeamPlayers.filter(p => ['ST', 'LW', 'RW', 'CAM', 'CM'].includes(p.position)) : currentTeamPlayers;
                                const finalScorers = scorers.length > 0 ? scorers : currentTeamPlayers;
                                const scorer = finalScorers[Math.floor(Math.random() * finalScorers.length)];
                                playerId = scorer.id;
                                description = `GOAL! ${scorer.name} scored for ${attackingTeam.name}!`;
                            } else {
                                description = `GOAL! ${attackingTeam.name} scores!`;
                            }
                        } else if (goalRand < 0.7) {
                            eventType = 'CHANCE';
                            teamId = attackingTeam.id;
                            if (currentTeamPlayers.length > 0) {
                                const player = currentTeamPlayers[Math.floor(Math.random() * currentTeamPlayers.length)];
                                description = `${player.name} is making a great run for ${attackingTeam.name}...`;
                            } else {
                                description = `${attackingTeam.name} is putting on the pressure...`;
                            }
                        } else {
                            eventType = 'CARD';
                            teamId = defendingTeam.id;
                            if (currentDefendingPlayers.length > 0) {
                                const player = currentDefendingPlayers[Math.floor(Math.random() * currentDefendingPlayers.length)];
                                description = `Yellow Card for ${player.name} (${defendingTeam.name})!`;
                            } else {
                                description = `Yellow Card for ${defendingTeam.name}!`;
                            }
                        }
                    }
                }

                if (eventType) {
                    events$.next({ minute, type: eventType, description, teamId, playerId });
                }
            },
            complete: () => {
                events$.complete();
            }
        });

        return events$.asObservable();
    }
}
