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
  }
];
