import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recent-pokemon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recent-pokemon-list">
      <h3>Recently Viewed</h3>
      <div class="recent-pokemon-items">
        <div class="recent-pokemon-card" *ngFor="let p of recentPokemons" (click)="selectPokemon.emit(p)">
          <img [src]="p.image" [alt]="p.name" />
          <div class="recent-pokemon-name">{{ p.name }}</div>
          <div class="recent-pokemon-types">
            <span class="type-badge type-{{ type }}" *ngFor="let type of p.types">{{ type }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./recent-pokemon.scss']
})
export class RecentPokemon {
  @Output() selectPokemon = new EventEmitter<any>();
  recentPokemons: any[] = [];

  ngOnInit() {
    this.loadRecents();
  }

  loadRecents() {
    try {
      this.recentPokemons = JSON.parse(localStorage.getItem('recentPokemons') || '[]');
    } catch {
      this.recentPokemons = [];
    }
  }

  reload() {
    this.loadRecents();
  }
} 