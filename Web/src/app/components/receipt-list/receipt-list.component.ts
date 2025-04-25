import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { MatDialogModule } from '@angular/material/dialog';

interface Receipt {
  date: string;
  store: string;
  amount: number;
}

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.scss']
})
export class ReceiptListComponent {
  dateRange: string = '01.04-01.05.2025';

  constructor(private dialog: MatDialog) {}

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

  receipts: Receipt[] = [
    { date: '23-04-2025', store: 'Lidl', amount: 123.46 },
    { date: '23-04-2025', store: 'Rossmann', amount: 123.46 },
    { date: '22-04-2025', store: 'Biedronka', amount: 123.46 },
    { date: '23-04-2025', store: 'Lidl', amount: 123.46 },
    { date: '23-04-2025', store: 'Rossmann', amount: 123.46 },
    { date: '22-04-2025', store: 'Biedronka', amount: 123.46 }
  ];
}
