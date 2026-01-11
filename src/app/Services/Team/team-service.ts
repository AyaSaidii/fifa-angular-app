import { Injectable } from '@angular/core';
import { Team } from '../../models/Team';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
    private teams: Team[] = [
    {
      id: 1,
      name: 'FC Barcelona',
      country: 'Spain',
      logo: 'assets/logos/barcelona.png',
      players: []
    },
    {
      id: 2,
      name: 'Real Madrid',
      country: 'Spain',
      logo: 'assets/logos/real-madrid.png',
      players: []
    },
    {
      id: 3,
      name: 'Manchester City',
      country: 'England',
      logo: 'assets/logos/man-city.png',
      players: []
    },
    {
      id: 4,
      name: 'Paris Saint-Germain',
      country: 'France',
      logo: 'assets/logos/psg.png',
      players: []
    },
    {
      id: 5,
      name: 'Bayern Munich',
      country: 'Germany',
      logo: 'assets/logos/bayern.png',
      players: []
    }
  ];
 getTeams():Team[]{
  return this.teams;
 }
 getTeambyId(id:number):Team|undefined{
  return this.teams.find(team=>team.id==id)
 }
  
}
