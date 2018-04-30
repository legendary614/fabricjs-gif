import 'fabric';
import { SocketService } from './socket.service';
import { Gif2spriteService } from './shared/services/gif2sprite.service';
declare const fabric: any;
import * as path from 'path';

fabric.Sprite = fabric.util.createClass(fabric.Image, {
    type: 'sprite',

    spriteWidth: 480,
    spriteHeight: 400,
    spriteIndex: 0,

    initialize: function (element, options) {
        // console.log(options);
        // tslint:disable-next-line:no-unused-expression
        // options || (options = {});

        // options.width = this.spriteWidth;
        // options.height = this.spriteHeight;

        this.spriteWidth = options.width;
        this.spriteHeight = options.height;

        console.log(this.spriteWidth);
        console.log(this.spriteHeight);

        this.callSuper('initialize', element, options);

        this.createTmpCanvas();
        this.createSpriteImages();
    },

    createTmpCanvas: function () {
        this.tmpCanvasEl = fabric.util.createCanvasElement();
        this.tmpCanvasEl.width = this.spriteWidth || this.width;
        this.tmpCanvasEl.height = this.spriteHeight || this.height;
    },

    createSpriteImages: function () {
        this.spriteImages = [];

        const steps = this._element.width / this.spriteWidth;
        for (let i = 0; i < steps; i++) {
            this.createSpriteImage(i);
        }
    },

    createSpriteImage: function (i) {
        const tmpCtx = this.tmpCanvasEl.getContext('2d');
        tmpCtx.clearRect(0, 0, this.tmpCanvasEl.width, this.tmpCanvasEl.height);
        tmpCtx.drawImage(this._element, -i * this.spriteWidth, 0);

        const dataURL = this.tmpCanvasEl.toDataURL('image/png');
        const tmpImg = fabric.util.createImage();

        tmpImg.src = dataURL;

        this.spriteImages.push(tmpImg);
    },

    _render: function (ctx) {
        ctx.drawImage(
            this.spriteImages[this.spriteIndex],
            -this.width / 2,
            -this.height / 2
        );
    },

    play: function () {
        const _this = this;
        this.animInterval = setInterval(function () {

            // tslint:disable-next-line:no-unused-expression
            _this.onPlay && _this.onPlay();

            _this.spriteIndex++;
            if (_this.spriteIndex === _this.spriteImages.length) {
                _this.spriteIndex = 0;
            }
        }, 1000 / 24);
    },

    stop: function () {
        clearInterval(this.animInterval);
    }
});

fabric.Sprite.fromURL = function (url, callback, options) {
    fabric.util.loadImage(url, function (img) {
        callback(new fabric.Sprite(img, options));
    }, null, options && options.crossOrigin);
};

fabric.Sprite.async = true;

let $this: WorkareaCanvas;
export class WorkareaCanvas {
    private element: any = {
        canvas: null,
        tmpCanvasEl: null,
    };

    constructor(private socekt: Gif2spriteService) {
        $this = this;
        this.init();

    }

    init() {
        this.element.canvas = new fabric.Canvas('kos-canvas', {
            hoverCursor: 'pointer',
            // selection: false,
            preserveObjectStacking: true
        });

        this.element.tmpCanvasEl = fabric.util.createCanvasElement();
    }

    addGifOverlay(metadata) {
        // tslint:disable-next-line:max-line-length
        const gifpath = path.dirname(metadata.cloudPath) + '/' + path.basename(metadata.cloudPath, path.extname(metadata.cloudPath)) + '.png';
        fabric.Sprite.fromURL(gifpath, (sprite) => {
            $this.element.canvas.add(sprite);
            setTimeout(function () {
                sprite.play();
            }, 100);

            fabric.util.requestAnimFrame(function render() {
                $this.element.canvas.renderAll();
                fabric.util.requestAnimFrame(render);
            });
        }, { crossOrigin: 'Anonymous', width: metadata.resolution.width, height: metadata.resolution.height });
    }
}
