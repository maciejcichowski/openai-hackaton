import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackButtonComponent } from '../shared/back-button/back-button.component';

interface ReceiptItem {
  name: string;
  price: number;
  category: string;
}

interface ReceiptDetails {
  store: string;
  date: string;
  items: ReceiptItem[];
  total: number;
}

@Component({
  selector: 'app-receipt-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule, BackButtonComponent],
  templateUrl: './receipt-details.component.html',
  styleUrls: ['./receipt-details.component.scss']
})
export class ReceiptDetailsComponent {
  constructor(
    private dialog: MatDialog,
    private router: Router
  ) {}

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

  downloadReceipt() {
    // Tutaj implementacja pobierania paragonu
    console.log('Downloading receipt...');
  }

  goBack() {
    this.router.navigate(['/receipts']);
  }

  receipt: ReceiptDetails = {
    store: 'Biedronka',
    date: 'April 22, 2025',
    items: [
      { name: 'Schabowy', price: 23.45, category: 'Food' },
      { name: 'Bulka pozn', price: 2.34, category: 'Bread' },
      { name: 'Something', price: 2.34, category: 'Category' },
      { name: 'Schabowy', price: 23.45, category: 'Food' },
      { name: 'Bulka pozn', price: 2.34, category: 'Bread' },
      { name: 'Something', price: 2.34, category: 'Category' },
      { name: 'Schabowy', price: 23.45, category: 'Food' },
      { name: 'Bulka pozn', price: 2.34, category: 'Bread' },
      { name: 'Something', price: 2.34, category: 'Category' }
    ],
    total: 204.56
  };
}
