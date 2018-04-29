/**
 * File Helper
 * konstantyn
 * 2018-03-10
 */

var path = require('path');
var fs = require('fs');
var azure = require('azure-storage');
var readChunk = require('read-chunk');
var mime = require('mime-types');
var fileType = require('file-type');
var async = require('async');
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var uuidGen = require('node-uuid');
var download = require('url-download');
var _ = require('underscore');

var config = require('../config/config');
var logHelper = require('./log.helper');
var responseHelper = require('./response.helper');
var serverConfig = require('../config/server.config');
var imageHelper = require('./image.helper');

var blobService = azure.createBlobService(config.cloud.azure.AZURE_STORAGE_ACCOUNT, config.cloud.azure.AZURE_STORAGE_ACCESS_KEY);

blobService.getServiceProperties(function (error, result, response) {
    if (!error) {
        var serviceProperties = result;

        // modify the properties
        serviceProperties['DefaultServiceVersion'] = '2017-07-29';
        // serviceProperties['Cors'] = {
        //     CorsRule: [{
        //         AllowedOrigins: ['*'],
        //         AllowedMethods: ['GET'],
        //         AllowedHeaders: ['*'],
        //         ExposedHeaders: ['*'],
        //         MaxAgeInSeconds: 1800
        //     }]
        // }; 

        blobService.setServiceProperties(serviceProperties, function (error, result, response) {
            blobService.getServiceProperties(function (error, result, response) {
                if (!error) {
                    console.log(serviceProperties.Cors.CorsRule);
                }
            });
        });
    }
});

blobService.createContainerIfNotExists('stage', { publicAccessLevel: 'blob' }, function (error, result, response) {
});

module.exports = {
    /**
     * 
     * @param {*} filename 
     * @param {*} localPath 
     * @param {*} callback 
     */
    putFileToCloud(filename, localPath, callback) {
        blobService.createBlockBlobFromLocalFile('stage', filename, localPath, (err, result, response) => {
            if (err) {
                responseHelper.onError('error: putFileToCloud', callback);
                return;
            }

            let cloudPath = 'https://' + config.cloud.azure.AZURE_STORAGE_ACCOUNT + '.blob.core.windows.net/stage/' + filename;
            responseHelper.onSuccess(callback, cloudPath);
        })
    },

    blobService: blobService,
    
    /**
     * 
     * @param {*} stream 
     * @param {*} outpath 
     * @param {*} filename
     * @param {*} callback 
     */
    writeStream(stream, outpath, filename, callback) {
        let ext = mime.extension(mime.lookup(filename));
        let filepath = outpath + uuidGen.v1() + '.' + ext;
        let writeStream = fs.createWriteStream(filepath, { highWaterMark: 102400 * 5});
        stream.pipe(writeStream);
        writeStream.on('close', () => {
            responseHelper.onSuccess(callback, filepath);
        });

        writeStream.on('error', (err) => {
            responseHelper.onError('error: writeStream', callback);
        });
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} callback 
     */
    readFile(filepath, callback) {
        fs.readFile(filepath, (err, buffer) => {
            if (err) {
                responseHelper.onError('error: readFile', callback);
                return;
            }
            responseHelper.onSuccess(callback, buffer);
        });
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} buffer 
     * @param {*} mode 
     * @param {*} callback 
     */
    writeFile(filepath, buffer, mode, callback) {
        fs.writeFile(filepath, buffer, mode, (err) => {
            if (err) {
                responseHelper.onError('error: writeFile', callback);
                return;
            }
            responseHelper.onSuccess(callback);
        })
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} callback 
     */
    deleteFile(filepath, callback) {
        fs.unlink(filepath, (err) => {
            if (err) {
                responseHelper.onError('error: deleteFile', callback);
                return;
            }
            responseHelper.onSuccess(callback);
        });
    },

    /**
     * 
     * @param {*} filepaths 
     * @param {*} callback 
     */
    deleteFiles(filepaths, callback) {
        let parallelTasks = [];

        _.each(filepaths, (filepath) => {
            parallelTasks.push((parallel_callback) => {
                fs.unlink(filepath, (err) => {
                    parallel_callback(err);
                });
            })
        });

        async.parallel(parallelTasks, (err) => {
            if (err) {
                responseHelper.onError('error: deleteFiles', callback);
            } else {
                responseHelper.onSuccess(callback);
            }
        });
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} setProgress 
     * @param {*} callback 
     */
    putMediaToCloud(filepath, setProgress, callback) {
        let mimeType = mime.lookup(filepath);
        if (!mimeType || !(mimeType.includes('video/') || mimeType.includes('image/'))) {
            responseHelper.onError('error: putMediaToCloud' + 'unsupported file', callback);
            return;
        }

        let ext = mime.extension(mimeType);
        let filename = path.basename(filepath, path.extname(filepath));
        let newFileName = filename;
        let spriteLength = 0;

        let resolution = '';
        let metadata = {};

        let seriesTasks = [];

        seriesTasks.push((series_callback) => {
            setProgress(80);

            if (mimeType.includes('video/')) {
                newFileName += '.mp4';
                if (ext != 'mp4') {
                    videoHelper.convert2mp4(filepath, serverConfig.uploadPath, (err, newPath) => {
                        if (!err) {
                            fs.unlink(filepath, (err) => {
                                filepath = newPath;
                                getResolution(filepath)
                                    .then((size) => {
                                        resolution = size;
                                        series_callback('');
                                    });
                                series_callback(err);
                            });
                        } else {
                            series_callback(err);
                        }
                    });
                } else {
                    getResolution(filepath)
                        .then((size) => {
                            resolution = size;
                            series_callback('');
                        });
                }
            } else {
                newFileName += '.' + ext;
                if (ext === 'gif' || ext === 'GIF') {
                    imageHelper.convertGif2Sprite(filepath, (err, result) => {
                        if (err) {
                            series_callback(err);
                        } else {
                            spriteLength = result.spriteLength;
                            this.deleteFiles(result.deleteFiles, (_err) => {
                                if (_err) {
                                    series_callback(_err);
                                } else {
                                    this.putFileToCloud(path.basename(result.spritepath), result.spritepath, (__err, cloudPath) => {
                                        if (__err) {
                                            series_callback(__err);
                                        } else {
                                            gm(filepath)
                                                .size((___err, size) => {
                                                    if (!___err) {
                                                        resolution = size;
                                                    }
                                                    series_callback(___err);
                                                });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    gm(filepath)
                        .size((err, size) => {
                            if (!err) {
                                resolution = size;
                            }
                            series_callback(err);
                        });
                }
            }
        });

        seriesTasks.push((series_callback) => {
            setProgress(90);
            this.putFileToCloud(newFileName, filepath, (err, cloudPath) => {
                if (!err) {
                    fs.rename(filepath, config.server.uploadPath + newFileName, (err) => {
                        if (!err) {
                            metadata = {
                                cloudPath: cloudPath,
                                resolution: resolution,
                                filepath: config.server.uploadPath + newFileName,
                                spriteLength: spriteLength,
                            };
                        }
                        series_callback('');
                    });
                } else {
                    series_callback(err);
                }
            });
        });

        async.series(seriesTasks, (err) => {
            if (!err) {
                responseHelper.onSuccess(callback, metadata);
            } else {
                responseHelper.onError('error: putMediaToCloud' + err, callback);
            }
        });
    },
}