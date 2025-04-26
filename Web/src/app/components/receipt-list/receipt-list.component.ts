import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackButtonComponent } from '../shared/back-button/back-button.component';
import { ReceiptService } from '../../services/receipt.service';
import { Receipt } from '../../models/receipt.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { VoiceButtonComponent } from '../shared/voice-button/voice-button.component';

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    BackButtonComponent,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    VoiceButtonComponent
  ],
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.scss']
})
export class ReceiptListComponent implements OnInit {
  receipts: Receipt[] = [];
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  });

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private receiptService: ReceiptService
  ) {}

  ngOnInit() {
    this.setDefaultDateRange();
    this.loadReceipts();
    this.dateRange.get('end')?.valueChanges.subscribe(() => {
      if (this.dateRange.valid) {
        this.loadReceipts();
      }
    });
  }

  private setDefaultDateRange() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.dateRange.patchValue({
      start: firstDayOfMonth,
      end: lastDayOfMonth
    });
  }

  loadReceipts() {
    const startDate = this.dateRange.get('start')?.value;
    const endDate = this.dateRange.get('end')?.value;

    if (!startDate || !endDate) return;

    this.receiptService.getReceipts(startDate, endDate).subscribe({
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
