var log = require('util').log, inspect = require('util').inspect;
var Vertex = require('./vertex');
var HalfEdge = require('./half_edge');
var LR = require('./lr');

var edgeInstanceCount = 0;

var edgeId = function(){
    var id = 0;
    return function(){ return id++ };
};


var Edge = function(){
    this.a = 0;
    this.b = 0;
    this.c = 0;
    this.leftVertex = Vertex.create();
    this.rightVertex = Vertex.create();
    this.isDeleted = false;

    // Once clipVertices() is called, this Dictionary will hold two Points
    // representing the clipped coordinates of the left and right ends...
    this.clippedVertices = null;

    this.sites = {};
    this.edgeIndex = edgeInstanceCount++;
    
}

Edge.prototype.toString = function(){
    return "Edge " + this.edgeIndex + "; sites " + this.sites[LR.LEFT] + ", " + this.sites[LR.RIGHT]
                    + "; endVertices " + (this.leftVertex ? this.leftVertex.vertexIndex : "null") + ", "
                     + (this.rightVertex ? this.rightVertex.vertexIndex : "null") + "::";
}

Edge.prototype.isVisible = function(){
    return this.clippedVertices !== null;
}

Edge.prototype.__defineGetter__('clippedEnds', function(){
    return this.clippedVertices;
});



Edge.prototype.__defineGetter__('leftSite',function(){
    return this.sites[LR.LEFT];
});
Edge.prototype.__defineGetter__('rightSite',function(){
    return this.sites[LR.RIGHT];
});
Edge.prototype.__defineSetter__('leftSite',function(site){
    this.sites[LR.LEFT] = site;
});
Edge.prototype.__defineSetter__('rightSite',function(site){
    // log('setting edge ' + this.edgeIndex + ' rightSite to ' + site.siteIndex );
    this.sites[LR.RIGHT] = site;
});

Edge.prototype.site = function(leftRight/*:LR*/)/*:Site*/ {
    return this.sites[leftRight];
}

Edge.prototype.vertex = function(leftRight/*:LR*/)/*:Vertex*/ {
    return (leftRight === LR.LEFT) ? this.leftVertex : this.rightVertex;
}


Edge.prototype.setVertex = function(leftRight/*:LR*/, v/*:Vertex*/) {
    if (leftRight === LR.LEFT){
        this.leftVertex = v;
    }
    else{
        this.rightVertex = v;
    }
}


/**
 * Set _clippedVertices to contain the two ends of the portion of the Voronoi edge that is visible
 * within the bounds.  If no part of the Edge falls within the bounds, leave _clippedVertices null. 
 * @param bounds
 * 
 */
Edge.prototype.clipVertices = function(bounds /*Rectangle*/) {
    var xmin = bounds.x;
    var ymin = bounds.y;
    var xmax = bounds.right;
    var ymax = bounds.bottom;
    var vertex0, vertex1;
    var x0, x1, y0, y1;
    
    if (this.a == 1.0 && this.b >= 0.0) {
        vertex0 = this.rightVertex;
        vertex1 = this.leftVertex;
    }
    else  {
        vertex0 = this.leftVertex;
        vertex1 = this.rightVertex;
    }

    if (this.a == 1.0){
        y0 = ymin;
        if (vertex0 && vertex0[1] > ymin) {
             y0 = vertex0[1];
        }
        if (y0 > ymax) {
            return;
        }
        x0 = this.c - this.b * y0;
        
        y1 = ymax;
        if (vertex1 !== null && vertex1[1] < ymax) {
            y1 = vertex1[1];
        }
        if (y1 < ymin) {
            return;
        }
        x1 = this.c - this.b * y1;
        // log('x1 ' + x1 + ' ' + y1);
        
        if ((x0 > xmax && x1 > xmax) || (x0 < xmin && x1 < xmin)){
            return;
        }
        
        if (x0 > xmax){
            x0 = xmax; y0 = (this.c - x0)/this.b;
        }
        else if (x0 < xmin){
            x0 = xmin; y0 = (this.c - x0)/this.b;
        }
        
        if (x1 > xmax){
            x1 = xmax; y1 = (this.c - x1)/this.b;
        }
        else if (x1 < xmin){
            x1 = xmin; y1 = (this.c - x1)/this.b;
        }
    }
    else
    {
        x0 = xmin;
        if (vertex0 !== null && vertex0[0] > xmin){
            x0 = vertex0[0];
        }
        if (x0 > xmax){
            return;
        }
        y0 = this.c - this.a * x0;
        
        x1 = xmax;
        if (vertex1 !== null && vertex1[0] < xmax){
            x1 = vertex1[0];
        }
        if (x1 < xmin){
            return;
        }
        y1 = this.c - this.a * x1;
        
        if ((y0 > ymax && y1 > ymax) || (y0 < ymin && y1 < ymin)){
            return;
        }
        
        if (y0 > ymax){
            y0 = ymax; x0 = (this.c - y0)/this.a;
        }
        else if (y0 < ymin){
            y0 = ymin; x0 = (this.c - y0)/this.a;
        }
        
        if (y1 > ymax){
            y1 = ymax; x1 = (this.c - y1)/this.a;
        }
        else if (y1 < ymin){
            y1 = ymin; x1 = (this.c - y1)/this.a;
        }
    }

    this.clippedVertices = {};
    if( Vertex.isEqual(vertex0,this.leftVertex) ){
    // if (vertex0 == this.leftVertex) {
        this.clippedVertices[LR.LEFT] = [x0,y0];//new Point(x0, y0);
        this.clippedVertices[LR.RIGHT] = [x1, y1];
    }
    else {
        this.clippedVertices[LR.RIGHT] = [x0, y0];
        this.clippedVertices[LR.LEFT] = [x1, y1];
    }
}
exports.DELETED = new Edge();
exports.DELETED.isDeleted = true;

exports.create = function(){
    var result = new Edge();
    return result;
}



exports.createBisectingEdge = function(site0, site1) /*Edge*/ {
    var dx, dy, absdx, absdy;
    var a, b, c;

    dx = site1[0] - site0[0];
    dy = site1[1] - site0[1];
    absdx = dx > 0 ? dx : -dx;
    absdy = dy > 0 ? dy : -dy;
    c = site0[0] * dx + site0[1] * dy + (dx * dx + dy * dy) * 0.5;
    if (absdx > absdy) {
        a = 1.0; b = dy/dx; c /= dx;
    }
    else {
        b = 1.0; a = dx/dy; c /= dy;
    }
    
    var edge = exports.create();

    edge.leftSite = site0;
    edge.rightSite = site1;
    // log('rightsite ' + edge.rightSite );
    site0.addEdge(edge);
    site1.addEdge(edge);
    
    edge.leftVertex = null;
    edge.rightVertex = null;
    
    edge.a = a; edge.b = b; edge.c = c;
    //trace("createBisectingEdge: a ", edge.a, "b", edge.b, "c", edge.c);
    
    return edge;
}



var EdgeList = function(){
    this.deltaX = 0;
    this.xmin = 0;
    this.hashSize = 0;
    this.hash = [];
    this.leftEnd = null;
    this.rightEnd = null;
}


EdgeList.prototype.__defineGetter__('length', function() {
    return this.hash.length;
});


EdgeList.prototype.dispose = function(){
    var halfEdge = this.leftEnd;
    var prevHe;
    while (halfEdge !== this.rightEnd) {
        prevHe = halfEdge;
        halfEdge = halfEdge.edgeListRightNeighbor;
        prevHe.dispose();
    }
    this.leftEnd = null;
    this.rightEnd.dispose();
    this.rightEnd = null;

    for (var i = 0; i < this.hashSize; ++i){
        this.hash[i] = null;
    }
    this.hash = null;
}


/**
 * Insert newHalfedge to the right of lb 
 * @param lb
 * @param newHalfedge
 * 
 */
EdgeList.prototype.insert = function(lb /*Halfedge*/, newHalfedge /*Halfedge*/){
    newHalfedge.edgeListLeftNeighbor = lb;
    newHalfedge.edgeListRightNeighbor = lb.edgeListRightNeighbor;
    lb.edgeListRightNeighbor.edgeListLeftNeighbor = newHalfedge;
    lb.edgeListRightNeighbor = newHalfedge;
}

/**
 * This function only removes the Halfedge from the left-right list.
 * We cannot dispose it yet because we are still using it. 
 * @param halfEdge
 * 
 */
EdgeList.prototype.remove = function(halfEdge /*Halfedge*/){
    halfEdge.edgeListLeftNeighbor.edgeListRightNeighbor = halfEdge.edgeListRightNeighbor;
    halfEdge.edgeListRightNeighbor.edgeListLeftNeighbor = halfEdge.edgeListLeftNeighbor;
    halfEdge.edge = exports.DELETED;
    halfEdge.edgeListLeftNeighbor = halfEdge.edgeListRightNeighbor = null;
}



/**
 * Find the rightmost Halfedge that is still left of p 
 * @param p
 * @return 
 * 
 */
EdgeList.prototype.edgeListLeftNeighbor = function(p /*Point*/){
    var i, bucket;
    var halfEdge;

    /* Use hash table to get close to desired halfedge */
    bucket = (p[0] - this.xmin)/this.deltaX * this.hashSize;
    
    
    if (bucket < 0){
        bucket = 0;
    }
    if (bucket >= this.hashSize){
        bucket = this.hashSize - 1;
    }

    // log('1 bucket ' + p[0] + ' ' + this.xmin + ' ' + this.deltaX + ' hs ' + this.hashSize  + ' = ' + bucket );
    

    halfEdge = this.getHash(bucket);

    if (!halfEdge) {
        // log( inspect(this.hash) );
        for (i = 1; true ; ++i) {
            halfEdge = this.getHash(bucket-i);
            if( halfEdge )
                break;
            halfEdge = this.getHash(bucket+i);
            if( halfEdge )
                break;
            
            // log('checking halfEdge ');
        }
    }

    
    /* Now search linear list of halfedges for the correct one */
    if (halfEdge === this.leftEnd  || (halfEdge !== this.rightEnd && halfEdge.isLeftOf(p))){
        do {
            halfEdge = halfEdge.edgeListRightNeighbor;
        }
        while (halfEdge != rightEnd && halfEdge.isLeftOf(p));
        halfEdge = halfEdge.edgeListLeftNeighbor;
    }
    else {
        do {
            halfEdge = halfEdge.edgeListLeftNeighbor;
        }
        while (halfEdge != this.leftEnd && !halfEdge.isLeftOf(p));
    }


    /* Update hash table and reference counts */
    if (bucket > 0 && bucket <this.hashSize - 1) {
        this.hash[bucket] = halfEdge;
    }
    return halfEdge;
}

/* Get entry from hash table, pruning any deleted nodes */
EdgeList.prototype.getHash = function(b) {
    var halfEdge;

    if (b < 0 || b >= this.hashSize){
        return null;
    }
    
    halfEdge = this.hash[b];
    
    if (halfEdge && halfEdge.edge && halfEdge.edge.isDeleted) {
        
        /* Hash table points to deleted halfedge.  Patch as necessary. */
        this.hash[b] = null;
        // still can't dispose halfEdge yet!
        return null;
    }
    else {
        return halfEdge;
    }
}

exports.createList = function(xmin, deltaX, sqrtNsites){
    var result = new EdgeList();
    result.xmin = xmin;
    // log('createList ' + inspect(arguments) );
    result.deltaX = deltaX;
    result.hashSize = Math.round(2 * sqrtNsites);
    // console.log( sqrtNsites );

    result.hash = new Array(result.hashSize);
    for( var i=0;i<result.hashSize;i++ )
        result.hash[i] = null;

    // two dummy Halfedges:
    result.leftEnd = HalfEdge.create();
    result.rightEnd = HalfEdge.create();
    result.leftEnd.edgeListLeftNeighbor = null;
    result.leftEnd.edgeListRightNeighbor = result.rightEnd;
    result.rightEnd.edgeListLeftNeighbor = result.leftEnd;
    result.rightEnd.edgeListRightNeighbor = null;
    result.hash[0] = result.leftEnd;
    result.hash[result.hashSize - 1] = result.rightEnd;

    // log( inspect(result.hash) );

    return result;
}