import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReceiptService } from '../../services/receipt.service';

interface DialogData {
  startRecording: boolean;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit, OnDestroy {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  isRecording = false;
  isProcessing = false;
  messages: Message[] = [];
  newMessage: string = '';

  constructor(
    private dialogRef: MatDialogRef<ChatBoxComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private receiptService: ReceiptService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.data.startRecording) {
      this.startRecording();
    }
  }

  ngOnDestroy() {
    this.stopRecording();
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        await this.sendVoiceRecording(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      this.mediaRecorder.start();
      
      // Add initial message
      this.messages.push({
        text: 'Recording started. Speak your question...',
        sender: 'bot',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      this.messages.push({
        text: 'Error accessing microphone. Please check your permissions.',
        sender: 'bot',
        timestamp: new Date()
      });
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.isRecording = false;
      this.isProcessing = true;
      this.mediaRecorder.stop();
      this.messages.push({
        text: 'Processing your question...',
        sender: 'bot',
        timestamp: new Date()
      });
    }
  }

  closeDialog() {
    this.stopRecording();
    this.dialogRef.close();
  }

  private async sendVoiceRecording(audioBlob: Blob) {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];
        
        this.receiptService.sendVoiceRecording(base64Data).subscribe({
          next: (response) => {
            console.log('Voice recording sent successfully:', response);
            this.messages.push({
              text: response.answer,
              sender: 'bot',
              timestamp: new Date()
            });
          },
          error: (error) => {
            console.error('Error sending voice recording:', error);
            this.messages.push({
              text: 'Error processing your question. Please try again.',
              sender: 'bot',
              timestamp: new Date()
            });
          },
          complete: () => {
            this.isProcessing = false;
            this.cdr.detectChanges();
          }
        });
      };
    } catch (error) {
      console.error('Error processing voice recording:', error);
      this.messages.push({
        text: 'Error processing the recording. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      });
      this.cdr.detectChanges();
    }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        text: this.newMessage,
        sender: 'user',
        timestamp: new Date()
      });
      this.newMessage = '';
    }
  }
}
