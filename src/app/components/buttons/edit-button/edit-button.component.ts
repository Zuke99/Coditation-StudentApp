import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-edit-button',
  templateUrl: './edit-button.component.html',
  styleUrl: './edit-button.component.css'
})
export class EditButtonComponent {
  @Input() buttonClass: string = ''; // Additional classes for button styling
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}
}
