import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
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
  messages: Message[] = [];
  newMessage: string = '';

  constructor(
    private dialogRef: MatDialogRef<ChatBoxComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private receiptService: ReceiptService
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
        this.isRecording = false;
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
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
        const base64Data = base64Audio.split(',')[1];
        
        // Send to service
        this.receiptService.sendVoiceRecording(base64Data).subscribe(
          response => {
            console.log('Voice recording sent successfully:', response);
            this.messages.push({
              text: 'Your question has been processed.',
              sender: 'bot',
              timestamp: new Date()
            });
            // Add the response from the API if available
            if (response && response.text) {
              this.messages.push({
                text: response.text,
                sender: 'bot',
                timestamp: new Date()
              });
            }
          },
          error => {
            console.error('Error sending voice recording:', error);
            this.messages.push({
              text: 'Error processing your question. Please try again.',
              sender: 'bot',
              timestamp: new Date()
            });
          }
        );
      };
    } catch (error) {
      console.error('Error processing voice recording:', error);
      this.messages.push({
        text: 'Error processing the recording. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      });
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
