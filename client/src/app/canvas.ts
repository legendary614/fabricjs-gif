import 'fabric';
import { SocketService } from './socket.service';
declare const fabric: any;

export class WorkareaCanvas {
    private element: any = {
        canvas: null,
    };

    constructor(private socekt: SocketService) {
        this.init();
    }

    init() {
        this.element.canvas = new fabric.Canvas('workarea-canvas', {
            hoverCursor: 'pointer',
            selection: false,
            preserveObjectStacking: true
        });
    }
}
