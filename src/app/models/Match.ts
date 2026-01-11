export interface Match {
    id: number;
    homeTeamId: number;
    awayTeamId: number;
    homeTeamName: string;
    awayTeamName: string;
    homeScore: number;
    awayScore: number;
    date: string;
    status: 'FT' | 'LIVE' | 'UPCOMING';
    homeScorers: string[];
    awayScorers: string[];
    stats?: {
        possession: [number, number];
        shots: [number, number];
        shotsOnTarget: [number, number];
        corners: [number, number];
        fouls: [number, number];
    };
}
