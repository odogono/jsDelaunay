var log = require('util').log, inspect = require('util').inspect;
var EdgeReorderer = require('./edge_reorderer');
var Voronoi = require('./voronoi');
var Vertex = require('./vertex');
var Polygon = require('./polygon');
var LR = require('./lr');
var siteInstanceCount = 0;

var Site = function(){
    // which end of each edge hooks up with the previous edge in _edges:
    this.edgeOrientations = null;

    // ordered list of points that define the region clipped to bounds:
    this.regionList = [];

    // the edges that define this Site's Voronoi region:
    this.edges = [];

    this[0] = 0;
    this[1] = 0;
    this.siteIndex = siteInstanceCount++;
}


Site.prototype.toString = function(){
    return "Site " + this.siteIndex + '; ' + this[0] +',' + this[1];
}

Site.prototype.addEdge = function( edge ){
    this.edges.push( edge );
}

Site.prototype.reorderEdges = function(){
    // log('edges: ' + this.edges.map( function(e){ return e.edgeIndex; }).join('~') );
    var reorderer = EdgeReorderer.create( this.edges, EdgeReorderer.CRITERION_VERTEX );
    this.edges = reorderer.edges;
    // log('edges: ' + this.edges.map( function(e){ return e.edgeIndex; }).join('~') );
    // log('reordered: ' + this.edges );
    this.edgeOrientations = reorderer.edgeOrientations;
    // log('edgeO ' + this.edgeOrientations);
}


Site.prototype.clipToBounds = function(bounds /*Rectangle*/){
    var points = [];
    var orientation, edge, i = 0, n = this.edges.length;

    while( i < n && ((this.edges[i]).isVisible() === false)){
        ++i;
    }

    if( i === n ){
        return [];
    }

    edge = this.edges[i];
    orientation = this.edgeOrientations[i];

    points.push( edge.clippedEnds[orientation] );
    points.push( edge.clippedEnds[LR.other(orientation)] );
    // log( edge);
    // log('clipToBounds pts ' + inspect(points) );

    for( var j=i+1;j<n;++j ){
        // log("c2b " + j);
        edge = this.edges[j];
        if( edge.isVisible() === false )
            continue;
        this.connect( points, j, bounds );
    }
    
    
    // close up the polygon by adding another corner point of the bounds if needed:
    this.connect(points, i, bounds,true);
    
    return points;
}

Site.prototype.region = function(clippingBounds /*Rectangle*/){
    if( !this.edges || this.edges.length === 0 ){
        return [];
    }
    
    if( !this.edgeOrientations ){
        this.reorderEdges();
        debugger;
        this.regionList = this.clipToBounds( clippingBounds );
        // log('regionList_ ' + inspect(this.regionList) );
        if( Polygon.create(this.regionList).winding() == Polygon.WINDING_CLOCKWISE ){
            this.regionList = this.regionList.reverse();
        }
    }

    return this.regionList;
}

Site.prototype.dist = function(p/*:ICoord*/)/*:Number*/{
    return Vertex.distance(p,this);
    // return Point.distance(p.coord, this._coord);
}

const EPSILON = 0.005;
var closeEnough = function( p0, p1 ){
    return Vertex.distance(p0,p1) < EPSILON;
}


var BOUNDSCHECK_TOP = 1;
var BOUNDSCHECK_BOTTOM = 2;
var BOUNDSCHECK_LEFT = 4;
var BOUNDSCHECK_RIGHT = 8;

var BoundsCheck = function(point, bounds /*Rectangle*/){
    var value = 0;
    if (point[0] === bounds.left){
        value |= BOUNDSCHECK_LEFT;
    }
    if (point[0] === bounds.right) {
        value |= BOUNDSCHECK_RIGHT;
    }
    if (point[1] === bounds.top) {
        value |= BOUNDSCHECK_TOP;
    }
    if (point[1] === bounds.bottom) {
        value |= BOUNDSCHECK_BOTTOM;
    }
    return value;
}

Site.prototype.connect = function(points /*Vector.<Point>*/, j /*int*/, bounds /*Rectangle*/, closingUp /*Boolean = false*/){
    var px, py;
    var rightPoint = points[ points.length - 1];
    var newEdge = this.edges[j];
    var newOrientation = this.edgeOrientations[j];

    // the point that  must be connected to rightPoint:
    var newPoint = newEdge.clippedEnds[newOrientation];

    if (!closeEnough(rightPoint, newPoint)) {
        // log('go ' + rightPoint + ' ' + newPoint );

        // The points do not coincide, so they must have been clipped at the bounds;
        // see if they are on the same border of the bounds:
        if (rightPoint[0] !== newPoint[0]
        &&  rightPoint[1] !== newPoint[1])
        {
            // They are on different borders of the bounds;
            // insert one or two corners of bounds as needed to hook them up:
            // (NOTE this will not be correct if the region should take up more than
            // half of the bounds rect, for then we will have gone the wrong way
            // around the bounds and included the smaller part rather than the larger)
            var rightCheck = BoundsCheck(rightPoint, bounds);
            var newCheck = BoundsCheck(newPoint, bounds);
            px = 0; py = 0;
            if (rightCheck & BOUNDSCHECK_RIGHT) {
                px = bounds.right;
                if (newCheck & BOUNDSCHECK_BOTTOM) {
                    py = bounds.bottom;
                    points.push( [px, py] );
                }
                else if (newCheck & BOUNDSCHECK_TOP) {
                    py = bounds.top;
                    points.push( [px, py] );
                }
                else if (newCheck & BOUNDSCHECK_LEFT) {
                    if (rightPoint[1] - bounds.y + newPoint[1] - bounds.y < bounds.height) {
                        py = bounds.top;
                    }
                    else {
                        py = bounds.bottom;
                    }
                    points.push([px, py]);
                    points.push([bounds.left, py]);
                }
            }
            else if (rightCheck & BOUNDSCHECK_LEFT) {
                px = bounds.left;
                if (newCheck & BOUNDSCHECK_BOTTOM) {
                    py = bounds.bottom;
                    points.push([px, py]);
                }
                else if (newCheck & BOUNDSCHECK_TOP) {
                    py = bounds.top;
                    points.push([px, py]);
                }
                else if (newCheck & BOUNDSCHECK_RIGHT) {
                    if (rightPoint[1] - bounds.y + newPoint[1] - bounds.y < bounds.height) {
                        py = bounds.top;
                    }
                    else {
                        py = bounds.bottom;
                    }
                    points.push([px, py]);
                    points.push([bounds.right, py]);
                }
            }
            else if (rightCheck & BOUNDSCHECK_TOP) {
                py = bounds.top;
                if (newCheck & BOUNDSCHECK_RIGHT)
                {
                    px = bounds.right;
                    points.push([px, py]);
                }
                else if (newCheck & BOUNDSCHECK_LEFT) {
                    px = bounds.left;
                    points.push([px, py]);
                }
                else if (newCheck & BOUNDSCHECK_BOTTOM)
                {
                    if (rightPoint[0] - bounds.x + newPoint[0] - bounds.x < bounds.width) {
                        px = bounds.left;
                    }
                    else {
                        px = bounds.right;
                    }
                    points.push([px, py]);
                    points.push([px, bounds.bottom]);
                }
            }
            else if (rightCheck & BOUNDSCHECK_BOTTOM) {
                py = bounds.bottom;
                if (newCheck & BOUNDSCHECK_RIGHT) {
                    px = bounds.right;
                    points.push([px, py]);
                }
                else if (newCheck & BOUNDSCHECK_LEFT) {
                    px = bounds.left;
                    points.push([px, py]);
                }
                else if (newCheck & BOUNDSCHECK_TOP) {
                    if (rightPoint[0] - bounds.x + newPoint[0] - bounds.x < bounds.width) {
                        px = bounds.left;
                    }
                    else {
                        px = bounds.right;
                    }
                    points.push([px, py]);
                    points.push([px, bounds.top]);
                }
            }
        }
        if (closingUp) {
            // newEdge's ends have already been added
            return;
        }
        // log('adding ' + newPoint );
        points.push(newPoint);
    }
    var newRightPoint = newEdge.clippedEnds[LR.other(newOrientation)];
    if (!closeEnough(points[0], newRightPoint)){
        points.push(newRightPoint);
    }
}


exports.compareByYThenX = function(s1, s2) {
    if (s1[1] < s2[1]) return -1;
    if (s1[1] > s2[1]) return 1;
    if (s1[0] < s2[0]) return -1;
    if (s1[0] > s2[0]) return 1;
    return 0;
}

exports.sort = function( sites ){
    var compareFn = function(s1,s2){
        var returnValue = exports.compareByYThenX(s1, s2);
        
        // swap _siteIndex values if necessary to match new ordering:
        var tempIndex;
        if (returnValue == -1) {
            if (s1.siteIndex > s2.siteIndex) {
                tempIndex = s1.siteIndex;
                s1.siteIndex = s2.siteIndex;
                s2.siteIndex = tempIndex;
            }
        }
        else if (returnValue == 1) {
            if (s2.siteIndex > s1.siteIndex) {
                tempIndex = s2.siteIndex;
                s2.siteIndex = s1.siteIndex;
                s1.siteIndex = tempIndex;
            }
        }
        
        return returnValue;
    }

    sites.sort(compareFn);
}



exports.create = function( point, index, weight, colour ){
    var result = new Site();
    // result.coord = point;
    result[0] = point[0]; result[1] = point[1];
    result.siteIndex = index;
    result.weight = weight;
    result.colour = colour;
    return result;
}