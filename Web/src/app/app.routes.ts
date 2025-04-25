import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'upload', loadComponent: () => import('./components/upload-receipt/upload-receipt.component').then(m => m.UploadReceiptComponent) },
  { path: 'receipts', loadComponent: () => import('./components/receipt-list/receipt-list.component').then(m => m.ReceiptListComponent) },
  { path: 'chat', loadComponent: () => import('./components/chat-box/chat-box.component').then(m => m.ChatBoxComponent) }
];
