import { Component, OnInit } from '@angular/core';
import { Team } from '../../models/Team';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../Services/data-service';

@Component({
  selector: 'app-team-component',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './team-component.html',
  styleUrls: ['./team-component.css'],
})
export class TeamComponent implements OnInit {
  teams: Team[] = [];
  showModal = false;

  newTeam: Omit<Team, 'id'> = {
    name: '',
    country: '',
    logo: '',
    att: 80,
    mid: 80,
    def: 80
  };

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.teams$.subscribe(teams => {
      this.teams = teams;
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newTeam = {
      name: '',
      country: '',
      logo: '',
      att: 80,
      mid: 80,
      def: 80
    };
  }

  saveTeam(): void {
    if (this.newTeam.name && this.newTeam.country) {
      if (!this.newTeam.logo) {
        this.newTeam.logo = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.newTeam.name)}&background=random&color=fff&size=128`;
      }

      // Generate random stats
      this.newTeam.att = Math.floor(Math.random() * (88 - 74 + 1)) + 74;
      this.newTeam.mid = Math.floor(Math.random() * (88 - 74 + 1)) + 74;
      this.newTeam.def = Math.floor(Math.random() * (88 - 74 + 1)) + 74;

      this.dataService.addTeam(this.newTeam);
      this.closeModal();
    }
  }

  deleteTeam(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer cette équipe ?')) {
      this.dataService.deleteTeam(id);
    }
  }
}
