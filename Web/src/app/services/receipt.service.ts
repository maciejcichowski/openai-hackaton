import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private apiUrl = 'http://localhost:5063/api/receipts';

  constructor(private http: HttpClient) {}

  uploadReceipt(base64File: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, { base64Image: base64File });
  }

  sendVoiceRecording(base64Audio: string): Observable<any> {
    const payload = {
      audioData: base64Audio,
      format: 'wav'
    };

    return this.http.post(`${this.apiUrl}/voice-input`, payload);
  }
}
