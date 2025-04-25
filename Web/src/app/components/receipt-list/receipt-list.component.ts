import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

interface Receipt {
  id: number;
  date: Date;
  amount: number;
  merchant: string;
  imageUrl: string;
}

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.scss']
})
export class ReceiptListComponent {
  displayedColumns: string[] = ['date', 'merchant', 'amount', 'actions'];
  receipts: Receipt[] = [
    {
      id: 1,
      date: new Date('2024-04-25'),
      amount: 150.50,
      merchant: 'Sklep XYZ',
      imageUrl: 'assets/receipt1.jpg'
    }
  ];
}
