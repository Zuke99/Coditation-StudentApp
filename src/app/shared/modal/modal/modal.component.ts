import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() title: string = '';
  isOpen: boolean = false;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();


  constructor() {
    console.log("Modal Const",this.isOpen)
  }
   

  openModal(): void {
    this.isOpen = true;
    console.log("Modal Open",this.isOpen)
  }

  closeModal1(): void {
    this.isOpen = false;
    console.log("Modal Close",this.isOpen)
  }
}
