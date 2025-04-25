import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-dropzone',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, NgxDropzoneModule],
  template: `
    <div class="welcome-container">
      <button class="back-button" (click)="goBack()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
        </svg>
      </button>

      <div class="content">
        <h1>Upload your receipt</h1>

        <div class="dropzone-container" (click)="fileInput.click()">
          <input #fileInput type="file" (change)="onSelect($event)" accept="image/*" style="display: none">
          <div class="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
                    fill="#4B9BFF"/>
            </svg>
          </div>
          <p class="upload-text">Click to upload files</p>
        </div>

        <button class="add-receipt-button" (click)="fileInput.click()">
          Browse files
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./upload-dropzone.component.scss']
})
export class UploadDropzoneComponent {
  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }

  onSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload
      console.log('Selected file:', file);
    }
  }
}
