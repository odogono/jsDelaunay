
exports.WINDING_CLOCKWISE = "clockwise";
exports.WINDING_COUNTERCLOCKWISE = "counterclockwise";
exports.WINDING_NONE = "none";

var Polygon = function(){
    this.vertices = [];
};


Polygon.prototype.winding = function(){
    var signedDoubleArea = this.signedDoubleArea();
    if (signedDoubleArea < 0) {
        return exports.WINDING_CLOCKWISE;
    }
    if (signedDoubleArea > 0) {
        return exports.WINDING_COUNTERCLOCKWISE;
    }
    return exports.WINDING_NONE;
};

Polygon.prototype.signedDoubleArea = function() {
    var nextIndex;
    var point, next;
    var signedDoubleArea = 0;

    for ( var index = 0, n = this.vertices.length; index < n; ++index) {
        nextIndex = (index + 1) % n;
        point = this.vertices[index];
        next = this.vertices[nextIndex];
        signedDoubleArea += point[0] * next[1] - next[0] * point[1];
    }
    return signedDoubleArea;
};

exports.create = function(vertices){
    var result = new Polygon();
    result.vertices = vertices;
    return result;
}