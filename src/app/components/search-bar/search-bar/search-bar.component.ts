import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  @Output() searchChanged: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchChanged.emit(query);
  }
}
