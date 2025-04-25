import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Receipt {
  date: string;
  store: string;
  amount: number;
}

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.scss']
})
export class ReceiptListComponent {
  dateRange: string = '01.04-01.05.2025';

  receipts: Receipt[] = [
    { date: '23-04-2025', store: 'Lidl', amount: 123.46 },
    { date: '23-04-2025', store: 'Rossmann', amount: 123.46 },
    { date: '22-04-2025', store: 'Biedronka', amount: 123.46 },
    { date: '23-04-2025', store: 'Lidl', amount: 123.46 },
    { date: '23-04-2025', store: 'Rossmann', amount: 123.46 },
    { date: '22-04-2025', store: 'Biedronka', amount: 123.46 }
  ];
}
