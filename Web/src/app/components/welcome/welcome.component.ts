import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="welcome-container">
      <button class="back-button" (click)="goBack()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
        </svg>
      </button>

      <div class="content">
        <h1>Welcome to</h1>
        <p>Capture and analyze your receipts effortlessly.</p>

        <div class="illustration">
          <img src="assets/welcome-illustration.png" alt="Welcome illustration">
        </div>

        <button class="add-receipt-button" (click)="addReceipt()">
          Add first receipt
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }

  addReceipt() {
    this.router.navigate(['/upload']);
  }
}
