import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { Router } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ReceiptService } from '../../services/receipt.service';
import { CategorySummary } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  maxDate = new Date();
  dashboardSummary: CategorySummary[] | null = null;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private receiptService: ReceiptService
  ) {}

  ngOnInit() {
    this.setDefaultDateRange();
    this.loadDashboardSummary();

    // Subscribe to date range changes
    this.dateRange.valueChanges.subscribe(() => {
      if (this.dateRange.valid) {
        this.loadDashboardSummary();
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

  private loadDashboardSummary() {
    const startDate = this.dateRange.get('start')?.value;
    const endDate = this.dateRange.get('end')?.value;

    this.receiptService.getDashboardSummary(startDate, endDate).subscribe({
      next: (data) => {
        this.dashboardSummary = data;
      },
      error: (error) => {
        console.error('Error loading dashboard summary:', error);
      }
    });
  }

  openChat(voice: boolean) {
    this.dialog.open(ChatBoxComponent, {
      width: '90%',
      height: '80%',
      panelClass: 'voice-chat-dialog',
      data: { startRecording: voice }
    });
  }

  navigateToUpload() {
    this.router.navigate(['/upload']);
  }

  navigateToReceipts() {
    this.router.navigate(['/receipts']);
  }

  navigateToTips() {
    this.router.navigate(['/tips']);
  }

  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Jedzenie': 'fa-shopping-cart',
      'Chemia': 'fa-spray-can',
      'Elektronika': 'fa-laptop',
      'Ubrania': 'fa-tshirt',
      'Dom': 'fa-home',
      'Alkohol': 'fa-wine-bottle',
      'Leki': 'fa-pills',
      'Inne': 'fa-box'
    };

    return iconMap[categoryName] || 'fa-tag';
  }
}
