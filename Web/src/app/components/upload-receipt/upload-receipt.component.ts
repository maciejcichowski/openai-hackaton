import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-upload-receipt',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, ImageCropperComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './upload-receipt.component.html',
  styleUrls: ['./upload-receipt.component.scss']
})
export class UploadReceiptComponent {
  imageChangedEvent: any = '';
  croppedImage: any = '';

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: any) {
    this.croppedImage = event.base64;
  }
}
