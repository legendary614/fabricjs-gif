/** 
 * Server (back-end)
 * Konstantyn Valentinov
 * 2018-03-05
*/

var ss = require('socket.io-stream');

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

    //This is sample socket stream communication
    ss(socket).on(constant.method.upload, function (stream, message) {
        helper.file.writeStream(stream, config.server.uploadPath, message.filename, function (err, filepath) {
            //processing with helpers
            const result = { success: true, message: message };
            socket.emit(constant.method.upload + '_RESPONSE', result);
            helper.log.system(JSON.stringify(result));
        });
    });
});