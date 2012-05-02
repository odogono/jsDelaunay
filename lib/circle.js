
var Circle = function(){
    this[0] = 0;
    this[1] = 0;
    this.radius = 0;
}

exports.create = function( centreX, centreY, radius ){
    var result = new Circle();
    result[0] = centreX || 0;
    result[1] = centreY || 0;
    result.radius = radius || 0;
    return result;
}