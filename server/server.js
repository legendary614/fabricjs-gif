/** 
 * Server (back-end)
 * Konstantyn Valentinov
 * 2018-03-05
*/

var ss = require('socket.io-stream');
var localStorage = require('localStorage');
var fs = require('fs');

/** 
 * Load Constant, Config, Helper, Service
*/
var constant = require('./constant/constant');
var config = require('./config/config');
var helper = require('./helper/helper');

/**
 * Create Socket Server
 */

var io = require('socket.io')(config.server.port);
helper.log.system('socket server started at Port:' + config.server.port);

io.on('connection', function (socket) {
    helper.log.system('client connected');

    //This is sample socket message communication
    socket.on(constant.method.hi, function (message) {
        helper.log.system('received ' + constant.method.hi + ' message: ' + JSON.stringify(message));
        helper.socket.validateMessage(socket, constant.method.hi, message, function () {
            //processing with helpers
            const result = {success: true, message: message};
            socket.emit(constant.method.hi + '_RESPONSE', result);
            helper.log.system(JSON.stringify(result));
        });
    });
    
    socket.on(constant.method.copy, function (message) {
        helper.log.system('received ' + constant.method.copy + ' message: ' + JSON.stringify(message));
        
    });

    //This is sample socket stream communication
    ss(socket).on(constant.method.upload, function (stream, message) {
        helper.file.writeStream(stream, config.server.uploadPath, message.filename, function (err, filepath) {
            //processing with helpers
            const result = { success: true, message: message };
            socket.emit(constant.method.upload + '_RESPONSE', result);
            helper.log.system(JSON.stringify(result));
        });
        //created by sonxai
        //first convert progress gif2sheetimages
        let inputFilePath = config.server.uploadPath + "input.gif ";
        let firstResultPath = config.server.progressPath + "progress.png";
        let secondResultPath = config.server.resultPath + "final.jpg";
        let commandLine = "convert.exe " + inputFilePath + firstResultPath;
        
        helper.shell.shell(commandLine, config.server.progressPath, function (err, fileCount) {
            //processing with helpers
            //sheetimages2result
            let finalCmdLine = "convert.exe +append ";
	        for (let idx = 0;idx < fileCount;idx++)
	        {
		        finalCmdLine+= config.server.progressPath + "progress-" + idx + ".png ";
	        }
	        
	        finalCmdLine+= secondResultPath;
	        helper.shell.shell(finalCmdLine, config.server.progressPath, function (err, fileCount) {
	            socket.emit(constant.method.upload + '_COUNT', fileCount);
	            fs.readdir(config.server.progressPath, (err, files) => {
					let fileProgress_len = files.length;
		            for (let idx = 0;idx < fileProgress_len;idx++)
		            {
		            	helper.file.deleteFile(config.server.progressPath + "progress-" + idx + ".png", function(err){
		            	});
		            }
				});
	        });
        });
        
        

    });
});