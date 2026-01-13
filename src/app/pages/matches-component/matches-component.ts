import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../models/Match';
import { DataService } from '../../Services/data-service';

@Component({
  selector: 'app-matches-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './matches-component.html',
  styleUrls: ['./matches-component.css'],
})
export class MatchesComponent implements OnInit {
  matches: Match[] = [];
  selectedMatch: Match | null = null;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.matches$.subscribe(matches => {
      this.matches = matches;
    });
  }

  viewMatchDetails(match: Match) {
    this.selectedMatch = match;
  }

  closeDetails() {
    this.selectedMatch = null;
  }
}
