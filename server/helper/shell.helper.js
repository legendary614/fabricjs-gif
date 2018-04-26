var shell = require('shelljs');
var fs = require('fs');
var _ = require('underscore');

var responseHelper = require('./response.helper');
var logHelper = require('./log.helper');

module.exports = {
    /**
     * 
     * @param {*} commandLine 
     * @param {*} callback 
     */
    shell(commandLine, dirPath, callback) {
        if (commandLine === undefined || commandLine === null || commandLine === '') {
            responseHelper.onError('error: shell', callback);
            return;
        }

        shell.exec(commandLine, (code) => {
            if (code !== 0) {
                responseHelper.onError('error: shell', callback);
                return;
            }
			fs.readdir(dirPath, (err, files) => {
				let fileProgress_len = files.length;
				if(fileProgress_len > 0)
				{
		            responseHelper.onSuccess(callback, fileProgress_len);
				}
				return;
				

			});
			
			
			
        });
    }
    
    
}