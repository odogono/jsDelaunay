var Site = require('./site');
var LR = require('./lr');

var vertexInstanceCount = 0;
var nVertices = 0;

var Vertex = function(){
    this[0] = 0;
    this[1] = 0;
    this.vertexIndex = 0;
}

Vertex.prototype.setIndex = function(){
    this.vertexIndex = nVertices++;
}

Vertex.prototype.toString = function(){
    return "Vertex (" + this[0] + ',' + this[1] + ' - ' + this.vertexIndex + ")";
}

var isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
};


exports.isAtInfinity = function( vertex ){
    return vertex && isNaN(vertex[0]) && isNaN(vertex[1]);
}

exports.isEqual = function( a, b ){
    if( a === null && b === null )
        return true;
    return a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

exports.indexOf = function( list, v ){
    if( list === null || list.length <= 0 )
        return false;
    for( var i=0,len=list.length;i<len;i++ ){
        if( exports.isEqual( list[i], v ) )
            return i;
    }
    return -1;
}

exports.intersect = function(halfedge0/*:Halfedge*/, halfedge1/*:Halfedge*/)/*:Vertex*/ {
    var edge0, edge1, edge;
    var halfedge;
    var determinant, intersectionX, intersectionY;
    var rightOfSite;

    edge0 = halfedge0.edge;
    edge1 = halfedge1.edge;
    if (!edge0 || !edge1) {
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
    rightOfSite = intersectionX >= edge.rightSite[0];
    if ((rightOfSite && halfedge.leftRight === LR.LEFT)
    ||  (!rightOfSite && halfedge.leftRight === LR.RIGHT))
    {
        return null;
    }

    return exports.create(intersectionX, intersectionY);
}

exports.distance = function distance(a,b){
    var x = a[0] - b[0];
    var y = a[1] - b[1];

    return Math.sqrt( x * x + y * y );
}

exports.create = function(x,y){
    var result = new Vertex();
    result[0] = x;
    result[1] = y;
    return result;
}