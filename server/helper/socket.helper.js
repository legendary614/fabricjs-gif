/**
 * Socket Helper
 * konstantyn
 * 2018-03-10
 */


var logHelper = require('./log.helper');
var responseHelper = require('./response.helper');

module.exports = {
    /**
     * 
     * @param {*} socket 
     * @param {*} method 
     * @param {*} message 
     * @param {*} callback 
     */
    validateMessage(socket, method, message, callback) {
        if (message == null) {
            responseHelper.onError('error: validateMessage', (err, result) => {
                socket.emit(method + '_RESPONSE', result);
            });
            return;
        }

        responseHelper.onSuccess(callback);
    },
}