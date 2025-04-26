import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReceiptService } from '../../services/receipt.service';
import { Receipt } from '../../models/receipt.model';
import { BackButtonComponent } from '../shared/back-button/back-button.component';
import { VoiceButtonComponent } from '../shared/voice-button/voice-button.component';

@Component({
  selector: 'app-receipt-details',
  standalone: true,
  imports: [CommonModule, BackButtonComponent, VoiceButtonComponent],
  templateUrl: './receipt-details.component.html',
  styleUrls: ['./receipt-details.component.scss']
})
export class ReceiptDetailsComponent implements OnInit {
  receipt: Receipt | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private receiptService: ReceiptService
  ) {}

  ngOnInit() {
    const receiptId = this.route.snapshot.paramMap.get('id');
    if (receiptId) {
      this.loadReceipt(receiptId);
    } else {
      this.error = 'No receipt ID provided';
      this.loading = false;
    }
  }

  loadReceipt(id: string) {
    this.receiptService.getReceipt(id).subscribe({
      next: (data) => {
        this.receipt = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load receipt details';
        this.loading = false;
        console.error('Error loading receipt:', err);
      }
    });
  }

  downloadReceipt() {
    if (!this.receipt?.id) return;

    this.receiptService.getReceiptImage(this.receipt.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${this.receipt?.storeName}_${this.receipt?.purchaseDate}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Error downloading receipt image:', err);
        this.error = 'Failed to download receipt image';
      }
    });
  }

  goBack() {
    window.history.back();
  }
}
