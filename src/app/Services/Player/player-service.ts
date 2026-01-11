import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from '../../models/Player';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
   private dataUrl = 'assets/data/players.json';
     constructor(private http: HttpClient) {}

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.dataUrl);
  }
  

}
