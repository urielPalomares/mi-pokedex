import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatIconModule, MatSnackBarModule],
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.scss'
})
export class PokemonDetail implements OnChanges {
  @Input() pokemon: any;
  @Output() closeDetail: EventEmitter<void> = new EventEmitter<void>();
  @Output() selectEvolution: EventEmitter<any> = new EventEmitter<any>();
  @Output() pokemonSaved: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('radarChart') radarChartRef!: ElementRef<HTMLCanvasElement>;
  radarChartInstance: any;

  backgroundColor = '#fff';
  radarChartLabels: string[] = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];
  radarChartData: any = { datasets: [{ data: [0,0,0,0,0,0], label: 'Stats' }] };
  radarChartOptions: any = {
    responsive: true,
    scale: {
      ticks: { beginAtZero: true, min: 0, max: 200 }
    }
  };
  
  showOpeningAnimation = false;
  showPanel = false;

  constructor(
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pokemon'] && this.pokemon) {
      this.backgroundColor = this.getBackgroundColor(this.pokemon.types?.[0]);
      this.startOpeningAnimation();
      this.saveRecentPokemon(this.pokemon);
    }
  }

  startOpeningAnimation() {
    this.showOpeningAnimation = true;
    this.showPanel = false;
    
    setTimeout(() => {
      this.showPanel = true;
      setTimeout(() => this.renderRadarChart(), 100);
    }, 500);
    
    setTimeout(() => {
      this.showOpeningAnimation = false;
    }, 1000);
  }

  renderRadarChart() {
    if (!this.radarChartRef) return;
    const stats = this.pokemon.stats || [];
    const data = [
      stats.find((s: any) => s.name === 'hp')?.value || 0,
      stats.find((s: any) => s.name === 'attack')?.value || 0,
      stats.find((s: any) => s.name === 'defense')?.value || 0,
      stats.find((s: any) => s.name === 'special-attack')?.value || 0,
      stats.find((s: any) => s.name === 'special-defense')?.value || 0,
      stats.find((s: any) => s.name === 'speed')?.value || 0
    ];
    const labels = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];
    if (this.radarChartInstance) {
      this.radarChartInstance.destroy();
    }
    this.radarChartInstance = new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Stats',
          data,
          backgroundColor: 'rgba(227,53,13,0.2)',
          borderColor: '#e3350d',
          pointBackgroundColor: '#e3350d',
        }]
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 200,
            ticks: { stepSize: 50 }
          }
        }
      }
    });
  }

  getBackgroundColor(type: string): string {
    const typeColors: any = {
      grass: '#78C850', fire: '#F08030', water: '#6890F0', bug: '#A8B820', normal: '#A8A878',
      poison: '#A040A0', electric: '#F8D030', ground: '#E0C068', fairy: '#EE99AC', fighting: '#C03028',
      psychic: '#F85888', rock: '#B8A038', ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8',
      dark: '#705848', steel: '#B8B8D0', flying: '#A890F0'
    };
    return typeColors[type] || '#fff';
  }

  getTypeColorName(type: string): string {
    const colorNames: any = {
      grass: 'Verde', fire: 'Naranja', water: 'Azul', bug: 'Verde Oliva', normal: 'Gris',
      poison: 'Morado', electric: 'Amarillo', ground: 'Marrón', fairy: 'Rosa', fighting: 'Rojo',
      psychic: 'Fucsia', rock: 'Beige', ghost: 'Violeta', ice: 'Celeste', dragon: 'Azul Marino',
      dark: 'Negro', steel: 'Plateado', flying: 'Celeste'
    };
    return colorNames[type] || 'Desconocido';
  }

  saveRecentPokemon(pokemon: any) {
    if (!pokemon) {
      return;
    }
    
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    const key = 'recentPokemons';
    let recents: any[] = [];
    try {
      recents = JSON.parse(localStorage.getItem(key) || '[]');
    } catch {}
    recents = recents.filter(p => p.id !== pokemon.id);
    recents.unshift({
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.image,
      types: pokemon.types
    });
    recents = recents.slice(0, 10);
    localStorage.setItem(key, JSON.stringify(recents));
    this.pokemonSaved.emit(pokemon);
  }
}
