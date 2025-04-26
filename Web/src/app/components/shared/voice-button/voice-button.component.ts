import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatBoxComponent } from '../../chat-box/chat-box.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-voice-button',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <button class="voice-button" (click)="openVoiceChat()">
      <i class="fas fa-comments"></i>
    </button>
  `,
  styles: [`
    .voice-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: #E53935;
      border: none;
      color: white;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      transition: all 0.2s ease;

      @media (min-width: 768px) {
        &:hover {
          transform: translateY(-2px);
          background-color: darken(#E53935, 5%);
        }
      }

      &:active {
        transform: scale(0.95);
      }
    }
  `]
})
export class VoiceButtonComponent {
  constructor(private dialog: MatDialog) {}

  openVoiceChat() {
    const dialogRef = this.dialog.open(ChatBoxComponent, {
      width: '90%',
      height: '80%',
      panelClass: 'voice-chat-dialog',
      data: { startRecording: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Chat dialog closed');
    });
  }
}
