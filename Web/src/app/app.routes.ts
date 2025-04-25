import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
  { path: 'upload', loadComponent: () => import('./components/upload-receipt/upload-receipt.component').then(m => m.UploadReceiptComponent) },
  { path: 'receipts', loadComponent: () => import('./components/receipt-list/receipt-list.component').then(m => m.ReceiptListComponent) },
  { path: 'chat', loadComponent: () => import('./components/chat-box/chat-box.component').then(m => m.ChatBoxComponent) }
];
