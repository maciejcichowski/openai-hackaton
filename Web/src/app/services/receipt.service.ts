import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private apiUrl = 'api/receipts'; // dostosuj URL do swojego API

  constructor(private http: HttpClient) {}

  uploadReceipt(base64File: string): Observable<any> {
    return this.http.post(this.apiUrl, { file: base64File });
  }
}
