import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Receipt } from '../models/receipt.model';
import { environment } from '../../environments/environment';
import { switchMap, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  private formatDateToDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getReceipts(startDate?: Date | null, endDate?: Date | null): Observable<Receipt[]> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('dateFrom', this.formatDateToDateOnly(startDate));
    }

    if (endDate) {
      params = params.set('dateTo', this.formatDateToDateOnly(endDate));
    }

    return this.http.get<Receipt[]>(`${this.apiUrl}/receipts`, { params });
  }

  getReceipt(id: string): Observable<Receipt> {
    return this.http.get<Receipt>(`${this.apiUrl}/receipts/${id}`);
  }

  getReceiptImage(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/receipts/${id}/image`, { responseType: 'blob' });
  }

  uploadReceipt(base64File: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/receipts/upload`, { base64Image: base64File });
  }

  transcribeAudio(base64Audio: string): Observable<string> {
    return this.http.post<{transcription: string}>(`${this.apiUrl}/voice/transcribe`, { base64Audio })
      .pipe(map(response => response.transcription));
  }

  sendVoiceRecording(base64Audio: string): Observable<any> {
    const payload = {
      base64Audio: base64Audio
    };

    return this.http.post(`${this.apiUrl}/voice/process`, payload);
  }

  getVoiceRecording(text: string): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/voice/generate-audio`, {
      text
    }, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
