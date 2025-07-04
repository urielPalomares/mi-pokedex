import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface PokemonListResult {
  name: string;
  url: string;
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  species: string;
  entry: string;
  abilities: string[];
  height: number;
  weight: number;
  base_experience: number;
  weaknesses: string[];
  stats: { name: string; value: number }[];
  evolution: { name: string; image: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private readonly placeholderImage = 'assets/placeholder.png';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Obtiene la lista de Pokémon con manejo de errores
   */
  getPokemonList(limit: number = 200): Observable<PokemonListResult[]> {
    return this.http.get<any>(`${this.baseUrl}/pokemon?limit=${limit}`).pipe(
      map(response => response.results || []),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene los detalles de un Pokémon específico
   */
  getPokemonDetails(url: string): Observable<any> {
    return this.http.get(url).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene la información de especie de un Pokémon
   */
  getPokemonSpecies(url: string): Observable<any> {
    return this.http.get(url).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene la cadena de evolución de un Pokémon
   */
  getEvolutionChain(url: string): Observable<any> {
    return this.http.get(url).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene los detalles de un Pokémon por nombre o ID
   */
  getPokemonByNameOrId(identifier: string | number): Observable<any> {
    return this.http.get(`${this.baseUrl}/pokemon/${identifier}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Construye un objeto Pokémon completo con todos sus datos
   */
  buildPokemonObject(details: any, species: any, evolution: any[] = []): Pokemon {
    return {
      id: details.id,
      name: details.name,
      image: this.getPokemonImage(details.id),
      types: details.types?.map((t: any) => t.type.name) || [],
      species: details.species?.name || 'Unknown',
      entry: this.getPokemonEntry(species),
      abilities: details.abilities?.map((a: any) => a.ability.name) || [],
      height: details.height ? details.height / 10 : 0,
      weight: details.weight ? details.weight / 10 : 0,
      base_experience: details.base_experience || 0,
      weaknesses: this.calculateWeaknesses(details.types),
      stats: details.stats?.map((s: any) => ({ 
        name: s.stat.name, 
        value: s.base_stat 
      })) || [],
      evolution: evolution
    };
  }

  /**
   * Maneja errores HTTP de manera centralizada
   */
  private handleError(error: HttpErrorResponse): Observable<any> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
          break;
        case 404:
          errorMessage = 'Pokémon no encontrado.';
          break;
        case 429:
          errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        case 503:
          errorMessage = 'Servicio temporalmente no disponible.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} ${error.statusText}`;
      }
    }

    this.showError(errorMessage);
    
    return of(null);
  }

  /**
   * Muestra mensajes de error usando MatSnackBar
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
   * Obtiene la URL de la imagen del Pokémon con fallback
   */
  private getPokemonImage(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  /**
   * Obtiene la entrada de la Pokédex en español
   */
  private getPokemonEntry(species: any): string {
    if (!species?.flavor_text_entries) return 'Descripción no disponible';
    
    const spanishEntry = species.flavor_text_entries.find((e: any) => e.language.name === 'es');
    if (spanishEntry) return spanishEntry.flavor_text;
    
    const englishEntry = species.flavor_text_entries.find((e: any) => e.language.name === 'en');
    if (englishEntry) return englishEntry.flavor_text;
    
    return 'Descripción no disponible';
  }

  /**
   * Calcula las debilidades del Pokémon basado en sus tipos
   */
  private calculateWeaknesses(types: any[]): string[] {
    const weaknesses: string[] = [];
    
    if (!types) return weaknesses;
    
    types.forEach(type => {
      switch (type.type.name) {
        case 'grass':
          weaknesses.push('fire', 'ice', 'poison', 'flying', 'bug');
          break;
        case 'fire':
          weaknesses.push('water', 'ground', 'rock');
          break;
        case 'water':
          weaknesses.push('electric', 'grass');
          break;
        case 'electric':
          weaknesses.push('ground');
          break;
        case 'ice':
          weaknesses.push('fire', 'fighting', 'rock', 'steel');
          break;
        case 'fighting':
          weaknesses.push('flying', 'psychic', 'fairy');
          break;
        case 'poison':
          weaknesses.push('ground', 'psychic');
          break;
        case 'ground':
          weaknesses.push('water', 'grass', 'ice');
          break;
        case 'flying':
          weaknesses.push('electric', 'ice', 'rock');
          break;
        case 'psychic':
          weaknesses.push('bug', 'ghost', 'dark');
          break;
        case 'bug':
          weaknesses.push('fire', 'flying', 'rock');
          break;
        case 'rock':
          weaknesses.push('water', 'grass', 'fighting', 'ground', 'steel');
          break;
        case 'ghost':
          weaknesses.push('ghost', 'dark');
          break;
        case 'dragon':
          weaknesses.push('ice', 'dragon', 'fairy');
          break;
        case 'dark':
          weaknesses.push('fighting', 'bug', 'fairy');
          break;
        case 'steel':
          weaknesses.push('fire', 'fighting', 'ground');
          break;
        case 'fairy':
          weaknesses.push('poison', 'steel');
          break;
      }
    });
    
    return [...new Set(weaknesses)];
  }

  /**
   * Extrae las evoluciones de una cadena de evolución
   */
  extractEvolutions(chain: any): { name: string; image: string }[] {
    const evolutions: { name: string; image: string }[] = [];
    
    const traverse = (node: any) => {
      if (!node) return;
      evolutions.push({ name: node.species.name, image: '' });
      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach((child: any) => traverse(child));
      }
    };
    
    traverse(chain);
    return evolutions;
  }
}
