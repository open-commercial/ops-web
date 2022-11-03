import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-img-picker',
  templateUrl: './img-picker.component.html',
  styleUrls: ['./img-picker.component.scss']
})
export class ImgPickerComponent implements OnInit {
  private pImageDataUrl = '';
  @Input() set imageDataUrl(value: string) { this.pImageDataUrl = value; }
  get imageDataUrl(): string { return this.pImageDataUrl; }

  private pId = '';
  @Input() set id(value: string) { this.pId = value; }
  get id(): string { return this.pId; }


  @Output() changeAsUrl = new EventEmitter<string>();
  @Output() changeAsData = new EventEmitter<number[]>();

  constructor() { }

  ngOnInit(): void {
  }

  imageChange($event) {
    const file = $event.target.files[0];
    const readerBuffer = new FileReader();
    const readerDataUrl = new FileReader();

    readerBuffer.addEventListener('load', () => {
      const arr = new Uint8Array(readerBuffer.result as ArrayBuffer);
      this.changeAsData.emit(Array.from(arr));
    });

    readerDataUrl.addEventListener('load', () => {
      this.imageDataUrl = readerDataUrl.result as string;
      this.changeAsUrl.emit(this.imageDataUrl);
    });

    readerBuffer.readAsArrayBuffer(file);
    readerDataUrl.readAsDataURL(file);
  }

  clearFile(file) {
    file.value = null;
    this.imageDataUrl = '';

    //this.changeAsData.emit(null);
    this.changeAsData.emit([]);
    this.changeAsUrl.emit('');
  }
}
