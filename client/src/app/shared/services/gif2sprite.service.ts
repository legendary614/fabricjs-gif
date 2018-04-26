import { Injectable, EventEmitter } from '@angular/core';
import { SocketService } from './socket.service';

let $this: Gif2spriteService;

@Injectable()
export class Gif2spriteService {
  public onHi = new EventEmitter();
  public onUpload = new EventEmitter();
  public onCopy = new EventEmitter();

  constructor(private socket: SocketService) {
    $this = this;

    this.socket.bind('HI_RESPONSE', this._hiResponse);
    this.socket.bind('UPLOAD_RESPONSE', this._uploadResponse);
    this.socket.bind('DOWNLOAD_RESPONSE', this._downloadResponse);
    this.socket.bind('UPLOAD_COUNT', this._uploadCount);
  }

  fakeId() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return 'fake-' + s4() + '-' + s4();
  }

  _hi(message) {
    this.socket.sendMessage('HI', {message: message});
  }

  _copy(message) {
    this.socket.sendMessage('COPY', {message: message});
  }

  _download(message) {
    this.socket.sendMessage('DOWNLOAD', { message: message });
  }

  _downloadResponse(response) {
    console.log(response);
  }



  _hiResponse(response) {
    $this.onHi.emit(response);
  }

  _upload(file, metadata: any) {
    metadata.size = file.size;
    metadata.filename = file.name;

    this.socket.sendStream('UPLOAD', file, metadata, null);
  }

  _uploadResponse(response) {
    console.log(response);
    $this.onUpload.emit(response);
  }

  _uploadCount(response) {
    window.localStorage.setItem('count', response);
  }
}
