import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatBoxComponent } from '../chat-box/chat-box.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(private dialog: MatDialog) {}

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
}
