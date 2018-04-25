/**
 * Image Helper
 */

var _ = require('underscore');

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
    }
}