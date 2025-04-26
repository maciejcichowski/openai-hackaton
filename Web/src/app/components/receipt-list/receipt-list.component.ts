import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackButtonComponent } from '../shared/back-button/back-button.component';

interface Receipt {
  id?: number;
  date: string;
  store: string;
  amount: number;
}

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule, BackButtonComponent],
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.scss']
})
export class ReceiptListComponent {
  dateRange: string = '01.04-01.05.2025';

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

  navigateToDetails(receipt: Receipt) {
    // W rzeczywistej aplikacji użylibyśmy prawdziwego ID
    const id = 1;
    this.router.navigate(['/receipts', id]);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  receipts: Receipt[] = [
    { id: 1, date: '23-04-2025', store: 'Lidl', amount: 123.46 },
    { id: 2, date: '23-04-2025', store: 'Rossmann', amount: 123.46 },
    { id: 3, date: '22-04-2025', store: 'Biedronka', amount: 123.46 },
    { id: 4, date: '23-04-2025', store: 'Lidl', amount: 123.46 },
    { id: 5, date: '23-04-2025', store: 'Rossmann', amount: 123.46 },
    { id: 6, date: '22-04-2025', store: 'Biedronka', amount: 123.46 }
  ];
}
