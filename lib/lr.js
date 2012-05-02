
exports.LEFT = 'left';
exports.RIGHT = 'right';

exports.other = function( lr ){
    return lr === exports.LEFT ? exports.RIGHT : exports.LEFT;
}