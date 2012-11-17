exports.X = 0;
exports.Y = 1;
exports.WIDTH = 2;
exports.HEIGHT = 3;

var Rectangle = function(){
    this[0] = 0;
    this[1] = 0;
    this[2] = 0;
    this[3] = 0;
}

Rectangle.prototype.__defineGetter__('left', function(){
    return this[0];
});
Rectangle.prototype.__defineGetter__('x', function(){
    return this[0];
});
Rectangle.prototype.__defineGetter__('right', function(){
    return this[0] + this[2];
});

Rectangle.prototype.__defineGetter__('top', function(){
    return this[1];
});
Rectangle.prototype.__defineGetter__('y', function(){
    return this[1];
});
Rectangle.prototype.__defineGetter__('bottom', function(){
    return this[1]+this[3];
});

Rectangle.prototype.__defineGetter__('width', function(){
    return this[2];
});
Rectangle.prototype.__defineGetter__('height', function(){
    return this[3];
});

exports.create = function( x, y, w, h ){
    var result = new Rectangle();
    result[0] = x || 0;
    result[1] = y || 0;
    result[2] = w || 0;
    result[3] = h || 0;
    return result;
}