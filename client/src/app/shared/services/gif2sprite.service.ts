import { Injectable, EventEmitter } from '@angular/core';
import { SocketService } from './socket.service';

let $this: Gif2spriteService;

@Injectable()
export class Gif2spriteService {
  public onHi = new EventEmitter();

  constructor(private socket: SocketService) {
    $this = this;

    this.socket.bind('HI_RESPONSE', this._hiResponse);
  }

  _hi(message) {
    this.socket.sendMessage('HI', {message: message});
  }

  _hiResponse(response) {
    $this.onHi.emit(response);
  }
}
