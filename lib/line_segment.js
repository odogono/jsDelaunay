
var LineSegment = function(){
    this.p0 = null;
    this.p1 = null;
}


exports.compareLengths_MAX = function(segment0/*:LineSegment*/, segment1/*:LineSegment*/)/*:Number*/ {
    var length0 = Vertex.distance(segment0.p0, segment0.p1);
    var length1 = Vertex.distance(segment1.p0, segment1.p1);
    if (length0 < length1) {
        return 1;
    }
    if (length0 > length1) {
        return -1;
    }
    return 0;
}

exports.compareLengths = function(edge0/*:LineSegment*/, edge1/*:LineSegment*/)/*:Number*/ {
    return -exports.compareLengths_MAX(edge0, edge1);
}

exports.create = function( p0, p1 ){
    var result = new LineSegment();
    result.p0 = p0;
    result.p1 = p1;
    return result;
}