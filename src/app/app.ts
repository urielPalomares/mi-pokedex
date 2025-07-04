import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Header } from './components/header/header';
import { PokemonList } from './components/pokemon-list/pokemon-list';
import { PokemonDetail } from './components/pokemon-detail/pokemon-detail';
import { RecentPokemon } from './components/pokemon-list/recent-pokemon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    Header,
    PokemonList,
    PokemonDetail,
    RecentPokemon
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'mi-pokedex';
  selectedPokemon: any = null;
  search: string = '';
  sortBy: string = 'id';
  isDescending: boolean = false;
  filterType: string = '';
  hasRecentPokemons: boolean = false;
  @ViewChild('recentComponent') recentPokemonComp!: RecentPokemon;
  @ViewChild('recentComponentHidden') recentPokemonCompHidden!: RecentPokemon;

  constructor() {}

  onSelectPokemon(pokemon: any) {
    this.selectedPokemon = pokemon;
  }

  onPokemonSaved(pokemon: any) {
    const activeComponent = this.recentPokemonComp || this.recentPokemonCompHidden;
    
    if (activeComponent) {
      activeComponent.reload();
    } else {
      console.log('onPokemonSaved: No component available, cannot reload');
    }
    this.checkRecentPokemons();
  }

  shouldShowRecentSection(): boolean {
    if (typeof localStorage === 'undefined') return false;
    
    try {
      const recent = JSON.parse(localStorage.getItem('recentPokemons') || '[]');
      return recent.length > 0;
    } catch {
      return false;
    }
  }

  onCloseDetail() {
    this.selectedPokemon = null;
  }

  onRecentChanged(hasRecent: boolean) {
    this.hasRecentPokemons = hasRecent;
  }

  ngOnInit() {
    this.checkRecentPokemons();
  }

  checkRecentPokemons() {
    if (typeof localStorage !== 'undefined') {
      try {
        const recent = JSON.parse(localStorage.getItem('recentPokemons') || '[]');
        this.hasRecentPokemons = recent.length > 0;
      } catch {
        this.hasRecentPokemons = false;
      }
    } else {
      this.hasRecentPokemons = false;
    }
  }

  onSelectEvolution(evo: any) {
    this.selectedPokemon = evo;
  }

  onSearch(value: string) {
    this.search = value;
  }

  onSort(sortData: {field: string, isDescending: boolean}) {
    this.sortBy = sortData.field;
    this.isDescending = sortData.isDescending;
  }

  onReset() {
    this.search = '';
    this.sortBy = 'id';
    this.isDescending = false;
    this.filterType = '';
  }

  onType(event: any) {
    this.filterType = typeof event === 'string' ? event : event?.target?.value || '';
  }
}
