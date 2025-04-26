import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackButtonComponent } from '../shared/back-button/back-button.component';
import { ReceiptService } from '../../services/receipt.service';
import { Receipt } from '../../models/receipt.model';

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule, BackButtonComponent],
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.scss']
})
export class ReceiptListComponent implements OnInit {
  dateRange: string = '01.04-01.05.2025';
  receipts: Receipt[] = [];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private receiptService: ReceiptService
  ) {}

  ngOnInit() {
    this.loadReceipts();
  }

  loadReceipts() {
    this.receiptService.getReceipts().subscribe({
      next: (data) => {
        this.receipts = data;
      },
      error: (error) => {
        console.error('Error loading receipts:', error);
        // Tu można dodać obsługę błędów, np. wyświetlenie komunikatu
      }
    });
  }

  openVoiceChat() {
    const dialogRef = this.dialog.open(ChatBoxComponent, {
      width: '90%',
      height: '80%',
      panelClass: 'voice-chat-dialog',
      data: { startRecording: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Chat dialog closed');
    });
  }

  navigateToDetails(receipt: Receipt) {
    this.router.navigate(['/receipts', receipt.id]);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
