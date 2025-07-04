import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { lastValueFrom, forkJoin, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PokemonService, Pokemon, PokemonListResult } from '../../services/pokemon';

@Component({
  selector: 'app-pokemon-list',
  imports: [
    CommonModule,
    MatCardModule,
    HttpClientModule,
    FormsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.scss'
})
export class PokemonList implements OnInit {
  pokemons: Pokemon[] = [];
  paginatedPokemons: Pokemon[] = [];
  @Input() search: string = '';
  @Input() sortBy: string = 'id';
  @Input() isDescending: boolean = false;
  currentPage: number = 1;
  pageSize: number = 20;
  totalPagesArray: number[] = [];
  @Output() selectPokemon = new EventEmitter<Pokemon>();
  loading: boolean = false;
  error: boolean = false;

  constructor(
    private pokemonService: PokemonService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPokemons();
  }

  /**
   * Carga la lista de Pokémon con manejo de errores
   */
  async loadPokemons() {
    this.loading = true;
    this.error = false;

    try {
      const pokemonList = await lastValueFrom(this.pokemonService.getPokemonList(200));
      
      if (!pokemonList || pokemonList.length === 0) {
        this.showError('No se pudieron cargar los Pokémon. Verifica tu conexión.');
        this.error = true;
        return;
      }

      const pokemonPromises = pokemonList.map(async (poke: PokemonListResult) => {
        try {
          const details = await lastValueFrom(this.pokemonService.getPokemonDetails(poke.url));
          if (!details) return null;

          const species = await lastValueFrom(this.pokemonService.getPokemonSpecies(details.species.url));
          
          let evolution: { name: string; image: string }[] = [];
          if (species?.evolution_chain?.url) {
            try {
              const evoChain = await lastValueFrom(this.pokemonService.getEvolutionChain(species.evolution_chain.url));
              const evoStages = this.pokemonService.extractEvolutions(evoChain.chain);
              
              for (let evo of evoStages) {
                try {
                  const evoDetails = await lastValueFrom(
                    this.pokemonService.getPokemonByNameOrId(evo.name)
                  );
                  if (evoDetails) {
                    evo.image = evoDetails.sprites?.front_default || 'assets/placeholder.png';
                  }
                } catch (evoError) {
                  evo.image = 'assets/placeholder.png';
                }
              }
              evolution = evoStages;
            } catch (evoError) {
              console.warn(`No se pudo cargar la evolución para ${poke.name}:`, evoError);
            }
          }

          return this.pokemonService.buildPokemonObject(details, species, evolution);
        } catch (error) {
          console.warn(`Error cargando ${poke.name}:`, error);
          return {
            id: 0,
            name: poke.name,
            image: 'assets/placeholder.png',
            types: ['unknown'],
            species: 'Unknown',
            entry: 'Información no disponible',
            abilities: [],
            height: 0,
            weight: 0,
            base_experience: 0,
            weaknesses: [],
            stats: [],
            evolution: []
          };
        }
      });

      const pokemonResults = await Promise.all(pokemonPromises);
      
      this.pokemons = pokemonResults
        .filter(pokemon => pokemon !== null)
        .sort((a, b) => a.id - b.id);

      if (this.pokemons.length === 0) {
        this.showError('No se pudieron cargar los Pokémon. Intenta recargar la página.');
        this.error = true;
      } else {
        this.updateList();
      }
    } catch (error) {
      console.error('Error cargando Pokémon:', error);
      this.showError('Error al cargar los Pokémon. Verifica tu conexión a internet.');
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Muestra mensaje de error
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Reintenta cargar los Pokémon
   */
  retryLoad(): void {
    this.loadPokemons();
  }

  updateList() {
    let filtered = this.pokemons;
    
    if (this.search) {
      const search = this.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.id.toString() === search
      );
    }

    const sortMultiplier = this.isDescending ? -1 : 1;
    
    switch (this.sortBy) {
      case 'name':
        filtered = filtered.slice().sort((a, b) => sortMultiplier * a.name.localeCompare(b.name));
        break;
      case 'hp':
        filtered = filtered.slice().sort((a, b) => {
          const aHp = a.stats.find((s: any) => s.name === 'hp')?.value || 0;
          const bHp = b.stats.find((s: any) => s.name === 'hp')?.value || 0;
          return sortMultiplier * (bHp - aHp);
        });
        break;
      case 'attack':
        filtered = filtered.slice().sort((a, b) => {
          const aAtk = a.stats.find((s: any) => s.name === 'attack')?.value || 0;
          const bAtk = b.stats.find((s: any) => s.name === 'attack')?.value || 0;
          return sortMultiplier * (bAtk - aAtk);
        });
        break;
      case 'type':
        filtered = filtered.slice().sort((a, b) => sortMultiplier * (a.types[0] || '').localeCompare(b.types[0] || ''));
        break;
      case 'electric':
        filtered = filtered.slice().sort((a, b) => 
          sortMultiplier * ((b.types.includes('electric') ? 1 : 0) - (a.types.includes('electric') ? 1 : 0))
        );
        break;
      case 'exp':
        filtered = filtered.slice().sort((a, b) => sortMultiplier * (b.base_experience - a.base_experience));
        break;
      case 'height':
        filtered = filtered.slice().sort((a, b) => sortMultiplier * (b.height - a.height));
        break;
      case 'weight':
        filtered = filtered.slice().sort((a, b) => sortMultiplier * (b.weight - a.weight));
        break;
      default:
        filtered = filtered.slice().sort((a, b) => sortMultiplier * (a.id - b.id));
    }

    const totalPages = Math.ceil(filtered.length / this.pageSize);
    this.totalPagesArray = Array(totalPages).fill(0).map((_, i) => i + 1);
    
    if (this.currentPage > totalPages) this.currentPage = 1;
    
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPokemons = filtered.slice(start, end);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updateList();
  }

  ngOnChanges() {
    this.updateList();
  }

  ngDoCheck() {
    this.updateList();
  }

  resetFilters() {
    this.search = '';
    this.sortBy = 'id';
    this.currentPage = 1;
    this.updateList();
  }

  onPokemonClick(pokemon: Pokemon): void {
    pokemon.capturing = true;
    
    setTimeout(() => {
      pokemon.capturing = false;
      this.selectPokemon.emit(pokemon);
    }, 500);
  }
}
