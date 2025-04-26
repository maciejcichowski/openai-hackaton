import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from '../shared/back-button/back-button.component';
import { VoiceButtonComponent } from '../shared/voice-button/voice-button.component';
import { Router } from '@angular/router';
import { ReceiptService } from '../../services/receipt.service';

interface Tip {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-tips',
  standalone: true,
  imports: [CommonModule, BackButtonComponent, VoiceButtonComponent],
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss']
})
export class TipsComponent {

  constructor(
    private router: Router
  ) {}

  tips: Tip[] = [
    {
      icon: 'fas fa-receipt',
      title: 'Upload Receipts Regularly',
      description: 'Keep your expenses up to date by uploading receipts right after purchases.'
    },
    {
      icon: 'fas fa-tags',
      title: 'Use Categories',
      description: 'Categorize your expenses to better understand your spending patterns.'
    },
    {
      icon: 'fas fa-calendar-alt',
      title: 'Monthly Review',
      description: 'Review your expenses at the end of each month to identify areas for savings.'
    },
    {
      icon: 'fas fa-chart-pie',
      title: 'Budget Planning',
      description: 'Set budget goals for different categories to manage your finances better.'
    },
    {
      icon: 'fas fa-search',
      title: 'Use Voice Search',
      description: 'Try voice commands to quickly find specific expenses or get spending insights.'
    },
    {
      icon: 'fas fa-clock',
      title: 'Real-time Tracking',
      description: 'Track your expenses in real-time to stay within your budget limits.'
    }
  ];

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
