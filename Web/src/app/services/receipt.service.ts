import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Receipt } from '../models/receipt.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private apiUrl = `${environment.apiUrl}/api/receipts`;

  constructor(private http: HttpClient) {}

  getReceipts(): Observable<Receipt[]> {
    return this.http.get<Receipt[]>(this.apiUrl);
  }

  getReceipt(id: string): Observable<Receipt> {
    return this.http.get<Receipt>(`${this.apiUrl}/${id}`);
  }

  getReceiptImage(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/image`, { responseType: 'blob' });
  }

  uploadReceipt(base64File: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/receipts/upload`, { base64Image: base64File });
  }

  sendVoiceRecording(base64Audio: string): Observable<any> {
    const payload = {
      base64Audio: base64Audio
    };

    return this.http.post(`${this.apiUrl}/voice/process`, payload);
  }
}
