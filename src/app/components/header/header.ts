import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  search: string = '';
  sortBy: string = 'id';
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() reset = new EventEmitter<void>();

  onSearchChange() {
    this.searchChange.emit(this.search);
  }
  setSort(sort: string) {
    this.sortBy = sort;
    this.sortChange.emit(sort);
  }
  resetFilters() {
    this.search = '';
    this.sortBy = 'id';
    this.reset.emit();
    this.onSearchChange();
    this.sortChange.emit('id');
  }
}
