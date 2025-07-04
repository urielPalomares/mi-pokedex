import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recent-pokemon',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="recent-pokemon-list">
      <div class="recent-title">
        <div class="title-row">
          <h3 class="recent-heading">Vistos Recientemente</h3>
          <button class="clear-history-btn" (click)="clearHistory()" *ngIf="recentPokemons.length > 0" title="Borrar historial">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
        <div class="scroll-indicator" *ngIf="recentPokemons.length > 3">
          <mat-icon>keyboard_arrow_down</mat-icon>
          <span>Desliza para ver más</span>
        </div>
      </div>
      <div class="recent-pokemon-items" *ngIf="recentPokemons.length > 0">
        <div class="recent-pokemon-card" *ngFor="let p of recentPokemons" (click)="selectPokemon.emit(p)">
          <img [src]="p.image" [alt]="p.name" />
          <div class="recent-pokemon-name">{{ p.name }}</div>
        </div>
      </div>
      <div class="no-recent" *ngIf="recentPokemons.length === 0">
        <mat-icon>history</mat-icon>
        <p>No hay Pokémon visitados recientemente</p>
      </div>
    </div>
  `,
  styleUrls: ['./recent-pokemon.scss']
})
export class RecentPokemon implements OnInit {
  @Output() selectPokemon = new EventEmitter<any>();
  @Output() hasRecentChanged = new EventEmitter<boolean>();
  recentPokemons: any[] = [];

  constructor() {}

  ngOnInit() {
    this.loadRecents();
  }

  loadRecents() {
    if (typeof localStorage !== 'undefined') {
      try {
        this.recentPokemons = JSON.parse(localStorage.getItem('recentPokemons') || '[]');
        console.log('loadRecents: Loaded', this.recentPokemons.length, 'pokemon from localStorage');
      } catch {
        this.recentPokemons = [];
      }
    } else {
      this.recentPokemons = [];
      console.log('loadRecents: localStorage not available, setting empty array');
    }
    this.hasRecentChanged.emit(this.recentPokemons.length > 0);
  }

  reload() {
    this.loadRecents();
  }

  clearHistory() {
    this.recentPokemons = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('recentPokemons');
    }
    this.hasRecentChanged.emit(false);
  }
} 