import { Component, Output, EventEmitter } from '@angular/core';
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
  isDescending: boolean = false;
  selectedType: string = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{field: string, isDescending: boolean}>();
  @Output() reset = new EventEmitter<void>();
  @Output() typeChange = new EventEmitter<string>();

  onSearchChange() {
    this.searchChange.emit(this.search);
  }
  setSort(sort: string) {
    if (this.sortBy === sort) {
      this.isDescending = !this.isDescending;
    } else {
      this.sortBy = sort;
      this.isDescending = false;
    }
    this.sortChange.emit({field: sort, isDescending: this.isDescending});
  }
  onTypeChange() {
    this.typeChange.emit(this.selectedType);
  }

  resetFilters() {
    this.search = '';
    this.sortBy = 'id';
    this.isDescending = false;
    this.selectedType = '';
    this.reset.emit();
    this.onSearchChange();
    this.sortChange.emit({field: 'id', isDescending: false});
    this.typeChange.emit('');
  }
}
