import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(
    private dialog: MatDialog,
    private router: Router
  ) {}

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
}
