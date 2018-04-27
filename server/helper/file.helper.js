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

var blobService = azure.createBlobService(config.cloud.azure.AZURE_STORAGE_ACCOUNT, config.cloud.azure.AZURE_STORAGE_ACCESS_KEY);

blobService.getServiceProperties(function (error, result, response) {
    if (!error) {
        var serviceProperties = result;

        // modify the properties
        serviceProperties['DefaultServiceVersion'] = '2017-07-29';

        blobService.setServiceProperties(serviceProperties, function (error, result, response) {
            // blobService.getServiceProperties(function (error, result, response) {
            //     if (!error) {
            //         // console.log(serviceProperties);
            //     }
            // });
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
        blobService.createBlockBlobFromLocalFile('stage', filename, localPath, { contentSettings: { contentDisposition: 'attachment; filename=' + 'uploadedGif' + '.gif'} }, (err, result, response) => {
            if (err) {
                responseHelper.onError('error: putFileToCloud', callback);
                return;
            }

            let cloudPath = 'https://' + config.cloud.azure.AZURE_STORAGE_ACCOUNT + '.blob.core.windows.net/stage/' + filename;
            responseHelper.onSuccess(callback, cloudPath);
        })
    },
    /**
     * 
     * @param {*} callback 
     */
    generateSasToken(callback) {
        let perms = azure.BlobUtilities.SharedAccessPermissions;

        let startDate = new Date();
        startDate.setMinutes(startDate.getMinutes() - 5);
        let expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + 60);

        let sharedAccessPolicy = {
          AccessPolicy: {
            Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
            Start: startDate,
            Expiry: expiryDate
          }
        };
        let sasToken = blobService.generateSharedAccessSignature('stage', undefined, sharedAccessPolicy);
        let data = {
          token: sasToken,
          expiryDate,
          issDate: startDate
        };
        responseHelper.onSuccess(callback, data);
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
        //updated by sonxai
        let filepath = outpath + "input.gif";
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
}