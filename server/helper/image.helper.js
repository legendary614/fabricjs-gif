/**
 * Image Helper
 */

var uuidGen = require('node-uuid');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');

var fileHelper = require('./file.helper');
var responseHelper = require('./response.helper');
var config = require('../config/config');
var shellHelper = require('./shell.helper');

module.exports = {
    /**
     * 
     * @param {*} position 
     * @param {*} orientation 
     * @param {*} angle 
     */
    rotatePosition(position, orientation, angle) {
        angle = angle * Math.PI / 180;

        let rot = {
            x: (position.x - orientation.x) * Math.cos(angle) - (position.y - orientation.y) * Math.sin(angle) + orientation.x,
            y: (position.x - orientation.x) * Math.sin(angle) + (position.y - orientation.y) * Math.cos(angle) + orientation.y,
        };

        return rot;
    },

    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
     * @param {*} angle 
     */
    rotateRectagle(x, y, width, height, angle) {
        let rotatePosition = this.rotatePosition;

        let rot = {
            x: x,
            y: y
        };

        if (angle != 0) {
            let corners = [
                {
                    x: x,
                    y: y
                },
                {
                    x: x + width,
                    y: y
                },
                {
                    x: x + width,
                    y: y + height
                },
                {
                    x: x,
                    y: y + height
                }
            ];

            let rot_corners = [];

            _.each(corners, (corner) => {
                rot_corners.push(rotatePosition(corner, {
                    x: x + width / 2,
                    y: y + height / 2
                }, angle));
            });

            _.each(corners, (corner) => {
                rot.x = _.min([rot.x, corner.x]);
                rot.y = _.min([rot.y, corner.y]);
            });
        }

        return rot;
    },

    convertGif2Sprite(filepath, callback) {
        let resultName = path.basename(filepath, path.extname(filepath));
        let resultPath = config.server.downloadPath + resultName + '.png';
        let commandLine = 'gifsicle.exe -e -i -U -e ' + filepath + '  -o ' + config.server.downloadPath + resultName;

        shellHelper.shell(commandLine, (err) => {
            if (err) {
                responseHelper.onError('error: convertGif2Sprite' + err, callback);
                return;
            }
            fs.readdir(config.server.downloadPath, (_err, files) => {
                if (_err) {
                    responseHelper.onError('error: convertGif2Sprite' + _err, callback);
                    return;
                }

                let convertedFiles = [], index = 0;
                _.each(files, (file) => {
                    if (file.includes(resultName)) {
                        // convertedFiles.push(config.server.downloadPath + resultName + '-' + index + '.png');
                        // index ++;
                        convertedFiles.push(config.server.downloadPath + file);
                    }
                });

                commandLine = 'convert.exe +append ';
                _.each(convertedFiles, (file) => {
                    commandLine += file + ' ';
                });

                commandLine += resultPath;

                shellHelper.shell(commandLine, (__err) => {
                    if (__err) {
                        responseHelper.onError('error: convertGif2Sprite' + err, callback);
                        return;
                    }

                    responseHelper.onSuccess(callback, {spritepath: resultPath, spriteLength: convertedFiles.length, deleteFiles: convertedFiles});
                });
            });
        });
    },
}