var V3 = require('./mjs').V3;
var LR = require('./lr');
var Site = require('./site');

var vertexInstanceCount = 0;

var Vertex = function(){
    this[0] = 0;
    this[1] = 0;
}

Vertex.prototype.setIndex = function(){
    this.vertexIndex = this.nVertices++;
}

Vertex.prototype.toString = function(){
    return "Vertex (" + this.vertexIndex + ")";
}

var isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
};


exports.isAtInfinity = function( vertex ){
    return isNaN(vertex[0]) && isNaN(vertex[1]);
}

exports.isEqual = function( a, b ){
    return a.length === b.length && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

exports.intersect = function(halfedge0/*:Halfedge*/, halfedge1/*:Halfedge*/)/*:Vertex*/ {
    var edge0, edge1, edge;
    var halfedge;
    var determinant, intersectionX, intersectionY;
    var rightOfSite;

    edge0 = halfedge0.edge;
    edge1 = halfedge1.edge;
    if (edge0 == null || edge1 == null) {
        return null;
    }
    if (edge0.rightSite === edge1.rightSite) {
        return null;
    }

    determinant = edge0.a * edge1.b - edge0.b * edge1.a;
    if (-1.0e-10 < determinant && determinant < 1.0e-10) {
        // the edges are parallel
        return null;
    }

    intersectionX = (edge0.c * edge1.b - edge1.c * edge0.b)/determinant;
    intersectionY = (edge1.c * edge0.a - edge0.c * edge1.a)/determinant;

    if (Site.compareByYThenX(edge0.rightSite, edge1.rightSite) < 0) {
        halfedge = halfedge0; edge = edge0;
    }
    else {
        halfedge = halfedge1; edge = edge1;
    }
    rightOfSite = intersectionX >= edge.rightSite.x;
    if ((rightOfSite && halfedge.leftRight === LR.LEFT)
    ||  (!rightOfSite && halfedge.leftRight === LR.RIGHT))
    {
        return null;
    }

    return exports.create(intersectionX, intersectionY);
}

exports.create = function(x,y){
    var result = new Vertex();
    result[0] = x;
    result[1] = y;
    return result;
}

exports.distance = V3.distance;
// exports.create = V3.$;
// exports.$ = V3.$;