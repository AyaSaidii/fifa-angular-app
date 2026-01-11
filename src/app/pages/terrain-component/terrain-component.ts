import { Component, OnInit } from '@angular/core';
import { PlayersComponent } from '../players-component/players-component';
import { CommonModule } from '@angular/common';
import { Player } from '../../models/Player';
import { PlayerService } from '../../Services/Player/player-service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-terrain-component',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './terrain-component.html',
  styleUrl: './terrain-component.css',
})
export class TerrainComponent  implements OnInit{
  players:Player[]=[];
  constructor(private playerService:HttpClient){

  }

  ngOnInit(): void {
    this.playerService.get<any[]>('assets/data/players.json')
      .subscribe(data => {
        this.players = data;

        console.log(this.players);

      });
  }


}
