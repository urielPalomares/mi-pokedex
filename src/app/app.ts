import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { PokemonList } from './components/pokemon-list/pokemon-list';
import { PokemonDetail } from './components/pokemon-detail/pokemon-detail';
import { RecentPokemon } from './components/pokemon-list/recent-pokemon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    PokemonList,
    PokemonDetail,
    RecentPokemon
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'mi-pokedex';
  selectedPokemon: any = null;
  search: string = '';
  sortBy: string = 'id';
  filterType: string = '';
  @ViewChild(RecentPokemon) recentPokemonComp!: RecentPokemon;

  onSelectPokemon(pokemon: any) {
    this.selectedPokemon = pokemon;
    setTimeout(() => this.recentPokemonComp?.reload(), 0);
  }

  onCloseDetail() {
    this.selectedPokemon = null;
    setTimeout(() => this.recentPokemonComp?.reload(), 0);
  }

  onSelectEvolution(evo: any) {
    this.selectedPokemon = evo;
  }

  onSearch(value: string) {
    this.search = value;
  }

  onSort(value: string) {
    this.sortBy = value;
  }

  onReset() {
    this.search = '';
    this.sortBy = 'id';
  }

  onType(event: any) {
    this.filterType = typeof event === 'string' ? event : event?.target?.value || '';
  }
}
