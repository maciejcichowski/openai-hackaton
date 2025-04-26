import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReceiptService } from '../../services/receipt.service';
import { ChatMessage } from '../../models/chat.model';

interface DialogData {
  startRecording: boolean;
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
  private statusMessageIndex: number = -1;
  isRecording = false;
  isProcessing = false;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  audio: HTMLAudioElement = new Audio();

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

  private updateStatusMessage(text: string) {
    if (this.statusMessageIndex === -1) {
      this.messages.push({
        text,
        sender: 'bot',
        timestamp: new Date()
      });
      this.statusMessageIndex = this.messages.length - 1;
    } else {
      this.messages[this.statusMessageIndex] = {
        text,
        sender: 'bot',
        timestamp: new Date()
      };
    }
    this.cdr.detectChanges();
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording = true;
      this.audio.pause();

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
      
      // Update status message
      this.updateStatusMessage('Listening to your voice...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      this.updateStatusMessage('Error accessing microphone. Please check your permissions.');
      this.statusMessageIndex = -1;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.isRecording = false;
      this.isProcessing = true;
      this.mediaRecorder.stop();
      this.updateStatusMessage('Processing your question...');
    }
  }

  closeDialog() {
    this.stopRecording();
    this.audio.pause();
    this.dialogRef.close();
  }

  private async sendVoiceRecording(audioBlob: Blob) {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];
        
        // First transcribe the audio
        this.receiptService.transcribeAudio(base64Data).subscribe({
          next: (transcribedText) => {
            if (this.statusMessageIndex !== -1) {
              this.messages.splice(this.statusMessageIndex, 1);
              this.statusMessageIndex = -1;
            }
            this.sendMessage(transcribedText);

            // Now send the audio for processing
            //this.receiptService.sendVoiceRecording(base64Data).subscribe({
            //  next: (response) => {
            //    console.log('Voice recording sent successfully:', response);
            //    // Add bot's answer as a new message
            //    this.messages.push({
            //      text: response.answer,
            //      sender: 'bot',
            //      timestamp: new Date()
            //    });
//
            //    this.receiptService.getVoiceRecording(response.answer).subscribe({
            //      next: (response) => {
            //        const blob = response.body;
            //        if (blob) {
            //          const url = URL.createObjectURL(blob);
            //          const audio = new Audio(url);
            //          audio.play().catch(error => console.error('Error playing audio:', error));
            //          // Clean up the URL after the audio is done playing
            //          audio.onended = () => URL.revokeObjectURL(url);
            //        }
            //      },
            //      error: (error) => {
            //        console.error('Error receiving voice recording:', error);
            //      }
            //    });
            //  },
            //  error: (error) => {
            //    console.error('Error sending voice recording:', error);
            //    this.messages.push({
            //      text: 'Error processing your question. Please try again.',
            //      sender: 'bot',
            //      timestamp: new Date()
            //    });
            //  },
            //  complete: () => {
            //    this.isProcessing = false;
            //    this.cdr.detectChanges();
            //  }
            //});
          },
          error: (error) => {
            console.error('Error transcribing audio:', error);
            if (this.statusMessageIndex !== -1) {
              this.messages.splice(this.statusMessageIndex, 1);
              this.statusMessageIndex = -1;
            }
            this.messages.push({
              text: 'Error transcribing your message. Please try again.',
              sender: 'bot',
              timestamp: new Date()
            });
          }
        });
      };
    } catch (error) {
      console.error('Error processing voice recording:', error);
      if (this.statusMessageIndex !== -1) {
        this.statusMessageIndex = -1;
      }
      this.messages.push({
        text: 'Error processing the recording. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      });
      this.cdr.detectChanges();
    }
  }

  sendMessage(voiceMessage: string | null = null) {
    if (this.newMessage.trim() || voiceMessage) {
      this.audio.pause();
      const messageText = voiceMessage || this.newMessage;
      this.newMessage = '';
      
      this.messages.push({
        text: messageText,
        sender: 'user',
        timestamp: new Date()
      });

      this.updateStatusMessage('Processing your question...');
      this.isProcessing = true;

      // Send message to service with chat history
      this.receiptService.sendMessage(messageText, this.messages).subscribe({
        next: (response) => {
          this.updateStatusMessage(response);

          if (voiceMessage) {
            this.receiptService.getVoiceRecording(response).subscribe({
              next: (response) => {
                const blob = response.body;
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  this.audio = new Audio(url);
                  this.audio.play().catch(error => console.error('Error playing audio:', error));
                  // Clean up the URL after the audio is done playing
                  this.audio.onended = () => URL.revokeObjectURL(url);
                }
              },
              error: (error) => {
                console.error('Error receiving voice recording:', error);
              }
            });
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.updateStatusMessage('Error processing your message. Please try again.');
        },
        complete: () => {
          if (this.statusMessageIndex !== -1) {
            this.statusMessageIndex = -1;
          }
          this.isProcessing = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
