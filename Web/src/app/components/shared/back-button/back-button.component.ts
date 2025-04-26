import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="back-button" (click)="onClick()">
      <i class="fas fa-arrow-left"></i>
    </button>
  `,
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent {
  @Output() backClick = new EventEmitter<void>();

  onClick() {
    this.backClick.emit();
  }
}
