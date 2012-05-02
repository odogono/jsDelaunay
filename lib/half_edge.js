var log = require('util').log, inspect = require('util').inspect;
var LR = require('./lr');

var HalfEdge = function(){
    this.edgeListLeftNeighbor = null;
    this.edgeListRightNeighbor = null;
    
    this.edge = null;
    this.leftRight = null;
    
    // the vertex's y-coordinate in the transformed Voronoi space V*
    this.ystar = 0;

    this.nextInPriorityQueue = null;
    this.vertex = null;
}

HalfEdge.prototype.dispose = function(){
    if (this.edgeListLeftNeighbor || this.edgeListRightNeighbor) {
        // still in EdgeList
        return;
    }
    if (this.nextInPriorityQueue) {
        // still in PriorityQueue
        return;
    }
    this.edge = null;
    this.leftRight = null;
    this.vertex = null;
}

HalfEdge.prototype.reallyDispose = function(){
    this.edgeListLeftNeighbor = null;
    this.edgeListRightNeighbor = null;
    this.nextInPriorityQueue = null;
    this.edge = null;
    this.leftRight = null;
    this.vertex = null;
    // _pool.push(this);    
}


HalfEdge.prototype.toString = function() {
    return "HalfEdge (leftRight: " + this.leftRight + "; vertex: " + this.vertex + ")";
}


HalfEdge.prototype.isEqual = function(other){

}

HalfEdge.prototype.isLeftOf = function(p/*Point*/)/*Boolean*/ {
    var topSite;
    var isRightOfSite, isAbove, isFast;
    var dxp, dyp, dxs, t1, t2, t3, yl;
    
    topSite = this.edge.rightSite;
    // log( inspect(this.edge.rightSite) );
    // log( inspect(this.edge) );
    isRightOfSite = p[0] > topSite[0];
    if (isRightOfSite && this.leftRight === LR.LEFT){
        return true;
    }
    if (!isRightOfSite && this.leftRight === LR.RIGHT)
    {
        return false;
    }
    
    if (this.edge.a == 1.0)
    {
        dyp = p[1] - topSite[1];
        dxp = p[0] - topSite[0];
        isFast = false;
        if ((!isRightOfSite && this.edge.b < 0.0) || (isRightOfSite && this.edge.b >= 0.0) ) {
            isAbove = dyp >= this.edge.b * dxp;    
            isFast = isAbove;
        }
        else {
            isAbove = p[0] + p[1] * this.edge.b > this.edge.c;
            if (this.edge.b < 0.0) {
                isAbove = !isAbove;
            }
            if (!isAbove) {
                isFast = true;
            }
        }
        if (!isFast) {
            dxs = topSite[0] - this.edge.leftSite[0];
            isAbove = this.edge.b * (dxp * dxp - dyp * dyp) <
                    dxs * dyp * (1.0 + 2.0 * dxp/dxs + this.edge.b * this.edge.b);
            if (this.edge.b < 0.0) {
                isAbove = !isAbove;
            }
        }
    }
    else  /* this.edge.b == 1.0 */ {
        yl = this.edge.c - this.edge.a * p[0];
        t1 = p[1] - yl;
        t2 = p[0] - topSite[0];
        t3 = yl - topSite[1];
        isAbove = t1 * t1 > t2 * t2 + t3 * t3;
    }
    return this.leftRight === LR.LEFT ? isAbove : !isAbove;
}


exports.create = function(edge, lr){
    var result = new HalfEdge();
    result.edge = edge;
    result.leftRight = lr;
    // log('HalfEdge created with ' + edge );
    return result;
}




var HalfEdgePriorityQueue = function(){
}

HalfEdgePriorityQueue.prototype.initialise = function(){
    this.count = 0;
    this.minBucket = 0;
    this.hash = [];
    // dummy Halfedge at the top of each hash
    for (var i = 0,len=this.hashSize; i < len; ++i)
    {
        this.hash[i] = exports.create();
        this.hash[i].nextInPriorityQueue = null;
    }
};

HalfEdgePriorityQueue.prototype.dispose = function(){
    // get rid of dummies
    for( var i=0;i<this.hashSize;i++ ){
        this.hash[i].dispose();
        this.hash[i] = null;
    }
    this.hash = null;
}



HalfEdgePriorityQueue.prototype.insert = function(halfEdge) {
    var previous, next;
    var insertionBucket = this.bucket(halfEdge);
    this.minBucket = Math.min( this.minBucket, insertionBucket );
    previous = this.hash[insertionBucket];
    while( (next = previous.nextInPriorityQueue) && 
        (halfEdge.ystar  > next.ystar || (halfEdge.ystar == next.ystar && halfEdge.vertex[0] > next.vertex[0]))){
        previous = next;
    }
    halfEdge.nextInPriorityQueue = previous.nextInPriorityQueue; 
    previous.nextInPriorityQueue = halfEdge;
    ++this.count;
}

HalfEdgePriorityQueue.prototype.remove = function(halfEdge){
    var previous;
    var removalBucket = this.bucket(halfEdge);
    
    if (halfEdge.vertex !== null) {
        previous = this.hash[removalBucket];
        while(previous.nextInPriorityQueue !== halfEdge) {
            previous = previous.nextInPriorityQueue;
        }
        previous.nextInPriorityQueue = halfEdge.nextInPriorityQueue;
        this.count--;
        halfEdge.vertex = null;
        halfEdge.nextInPriorityQueue = null;
        halfEdge.dispose();
    }
}

HalfEdgePriorityQueue.prototype.bucket = function(halfEdge)
{
    var theBucket = (halfEdge.ystar - this.ymin)/this.deltay * this.hashSize;
    if (theBucket < 0) theBucket = 0;
    if (theBucket >= this.hashSize) theBucket = this.hashSize - 1;
    return theBucket;
}

HalfEdgePriorityQueue.prototype.isEmpty = function(bucket) {
    return (this.hash[bucket].nextInPriorityQueue === null);
}

/**
 * move _minBucket until it contains an actual Halfedge (not just the dummy at the top); 
 * 
 */
HalfEdgePriorityQueue.prototype.adjustMinBucket = function()
{
    while (this.minBucket < this.hashSize - 1 && this.isEmpty(this.minBucket)) {
        ++this.minBucket;
    }
}

HalfEdgePriorityQueue.prototype.empty = function(){
    return this.count === 0;
}

/**
 * @return coordinates of the Halfedge's vertex in V*, the transformed Voronoi diagram
 * 
 */
HalfEdgePriorityQueue.prototype.min = function()
{
    this.adjustMinBucket();
    var answer = this.hash[this.minBucket].nextInPriorityQueue;
    return [answer.vertex[0], answer.ystar];
}

/**
 * remove and return the min Halfedge
 * @return 
 * 
 */
HalfEdgePriorityQueue.prototype.extractMin = function(){
    var answer;

    // get the first real Halfedge in _minBucket
    answer = this.hash[this.minBucket].nextInPriorityQueue;
    
    this.hash[this.minBucket].nextInPriorityQueue = answer.nextInPriorityQueue;
    this.count--;
    answer.nextInPriorityQueue = null;
    
    return answer;
}

exports.createPriorityQueue = function(ymin, deltay, sqrtNsites){
    var result = new HalfEdgePriorityQueue();
    
    
    result.ymin = ymin;
    result.deltay = deltay;
    result.hashSize = 4 * sqrtNsites;

    result.initialise();

    return result;
}