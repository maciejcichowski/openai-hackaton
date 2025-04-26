import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    data: { fullScreen: true }
  },
  {
    path: 'upload',
    loadComponent: () => import('./components/upload-dropzone/upload-dropzone.component')
      .then(m => m.UploadDropzoneComponent),
    data: { fullScreen: true }
  },
  {
    path: 'receipts',
    loadComponent: () => import('./components/receipt-list/receipt-list.component')
      .then(m => m.ReceiptListComponent),
    data: { fullScreen: true }
  },
  {
    path: 'receipts/:id',
    loadComponent: () => import('./components/receipt-details/receipt-details.component')
      .then(m => m.ReceiptDetailsComponent),
    data: { fullScreen: true }
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat-box/chat-box.component')
      .then(m => m.ChatBoxComponent),
    data: { fullScreen: false }
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    data: { fullScreen: true }
  },
  {
    path: 'tips',
    loadComponent: () => import('./components/tips/tips.component')
      .then(m => m.TipsComponent),
    data: { fullScreen: true }
  }
];
