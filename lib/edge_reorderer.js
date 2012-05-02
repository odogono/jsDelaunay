var log = require('util').log, inspect = require('util').inspect;
var LR = require('./lr');
var Vertex = require('./vertex');

exports.CRITERION_VERTEX = 10;
exports.CRITERION_SITE = 11;

var EdgeReorderer = function(){

}

EdgeReorderer.prototype.reorderEdges = function(origEdges,criterion){

    var i=0,j,n = origEdges.length,edge,
        leftPoint, rightPoint,
        done = new Array(n),
        nDone = 0,
        newEdges = [];


    edge = origEdges[i];
    newEdges.push( edge );
    this.edgeOrientations.push(LR.LEFT);


    var firstPoint = ( criterion === exports.CRITERION_VERTEX) ? edge.leftVertex : edge.leftSite;
    var lastPoint = ( criterion === exports.CRITERION_VERTEX) ? edge.rightVertex : edge.rightSite;

    if( Vertex.isAtInfinity(firstPoint) || Vertex.isAtInfinity(lastPoint) ){
        return [];
    }
    
    done[i] = true;
    ++nDone;

    while (nDone < n) {
        for (i = 1; i < n; ++i) {
            if (done[i]) {
                continue;
            }
            edge = origEdges[i];
            leftPoint = (criterion === exports.CRITERION_VERTEX) ? edge.leftVertex : edge.leftSite;
            rightPoint = (criterion === exports.CRITERION_VERTEX) ? edge.rightVertex : edge.rightSite;

            if( Vertex.isAtInfinity(leftPoint) || Vertex.isAtInfinity(rightPoint) ){
                return [];
            }

            if( Vertex.isEqual(leftPoint,lastPoint) ){
                lastPoint = rightPoint;
                this.edgeOrientations.push(LR.LEFT);
                newEdges.push(edge);
                done[i] = true;
            }
            else if (Vertex.isEqual(rightPoint, firstPoint)) {
                firstPoint = leftPoint;
                this.edgeOrientations.unshift(LR.LEFT);
                newEdges.unshift(edge);
                done[i] = true;
            }
            else if (Vertex.isEqual(leftPoint, firstPoint)) {
                firstPoint = rightPoint;
                this.edgeOrientations.unshift(LR.RIGHT);
                newEdges.unshift(edge);
                done[i] = true;
            }
            else if (Vertex.isEqual(rightPoint, lastPoint)) {
                lastPoint = leftPoint;
                this.edgeOrientations.push(LR.RIGHT);
                newEdges.push(edge);
                done[i] = true;
            }
            if (done[i]) {
                ++nDone;
            }
        }
    }
    
    return newEdges;
}




exports.create = function(origEdges, criterion){
    if( criterion !== exports.CRITERION_VERTEX && criterion !== exports.CRITERION_SITE ){
        throw new Error("Edges: criterion must be Vertex or Site");
    }

    var result = new EdgeReorderer();
    result.edges = [];
    result.edgeOrientations = [];

    if (origEdges.length > 0)
        result.edges = result.reorderEdges(origEdges, criterion);

    return result;
}