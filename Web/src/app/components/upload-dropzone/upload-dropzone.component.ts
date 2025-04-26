import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ReceiptService } from '../../services/receipt.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-upload-dropzone',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './upload-dropzone.component.html',
  styleUrls: ['./upload-dropzone.component.scss']
})
export class UploadDropzoneComponent {
  isUploading = false;

  constructor(
    private router: Router,
    private receiptService: ReceiptService,
    private snackBar: MatSnackBar
  ) {}

  goBack() {
    window.history.back();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.uploadFile(files[0]);
    }
  }

  private uploadFile(file: File) {
    this.isUploading = true;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64String = e.target.result.split(',')[1];

      this.receiptService.uploadReceipt(base64String)
        .pipe(
          finalize(() => this.isUploading = false)
        )
        .subscribe({
          next: (response) => {
            this.router.navigate(['/receipts', response.id]);
          },
          error: (error) => {
            console.error('Błąd podczas przesyłania pliku:', error);
            this.snackBar.open('Wystąpił błąd podczas przesyłania pliku', 'Zamknij', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    };
    reader.readAsDataURL(file);
  }
}
